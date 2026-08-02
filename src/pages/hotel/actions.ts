import {
  batchFavoriteHotels,
  fetchHotelPage,
  toggleHotelFavorite,
} from "./data/services";
import { getLive } from "./live";
import { parseSearchParams, serializeParams } from "./shared/params";
import type { SearchParams } from "./shared/types";
import { usePageStore } from "./store";

/**
 * 等持久化恢复完成。
 *
 * localStorage 的恢复虽是同步的，但门禁仍要写：storage 一旦换成异步实现（IndexedDB 等），
 * 少了它首屏就会先按默认条件拉一次、恢复后再拉一次，用户看到列表闪一下。
 */
async function waitForHydration() {
  if (usePageStore.persist.hasHydrated()) {
    return;
  }

  await new Promise<void>((resolve) => {
    const unsubscribe = usePageStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

/**
 * URL 显式带了筛选条件就以它为准，否则用持久化下来的偏好。
 *
 * 分享链接与带参刷新是用户的明示意图，持久化偏好是隐式的，不该盖掉明示。
 */
function resolveInitialParams(): SearchParams {
  if (window.location.search) {
    return parseSearchParams(window.location.search);
  }

  return usePageStore.getState().appliedParams;
}

export const pageActions = {
  /** 首屏编排：先等偏好恢复，再决定用哪套筛选条件拉第一页 */
  async initPage() {
    await waitForHydration();
    await pageActions.loadHotels(resolveInitialParams());
  },

  /** 首屏与换筛选条件都走这里：列表整体替换，分页从头开始 */
  async loadHotels(searchParams: SearchParams) {
    const {
      setAppliedParams,
      setIsLoadingHotels,
      setHotelsError,
      setHotels,
      setHotelsTotal,
      setLoadedPage,
      setHasMore,
      setLoadMoreError,
      setSelectedHotelId,
      setSelectedHotelIds,
      setBatchFavoriteFailures,
    } = usePageStore.getState();

    setAppliedParams(searchParams);
    setIsLoadingHotels(true);
    setHotelsError(null);
    setLoadMoreError(null);

    /*
     * 请求发出前先把上一轮结果作废。
     *
     * store 是页面级单例、不随页面卸载重置，重进本页或换筛选条件时旧值都还在：
     * 少了这段，loading 期间「找到 N 家」会报上一次的数字，选中态与批量失败提示
     * 也会指向已经不在结果里的酒店。收藏（favoriteIds）不清——那是跨结果集的用户数据。
     */
    setHotels([]);
    setHotelsTotal(0);
    setLoadedPage(0);
    setHasMore(false);
    setSelectedHotelId(null);
    setSelectedHotelIds([]);
    setBatchFavoriteFailures([]);

    try {
      const { items, hasMore, total } = await fetchHotelPage(searchParams, 1);
      setHotels(items);
      setHotelsTotal(total);
      setLoadedPage(1);
      setHasMore(hasMore);
    } catch (err) {
      // 结果态已在请求前清空，这里只记错误
      setHotelsError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoadingHotels(false);
    }
  },

  /**
   * 加载下一页。三道闸：没有下一页、已有请求在飞、首屏还没回来，都直接退出。
   * 滚动哨兵会连续触发，缺了这三道就会并发拉同一页、把重复数据追加进列表。
   */
  async loadMoreHotels() {
    const {
      hasMore,
      isLoadingMore,
      isLoadingHotels,
      loadedPage,
      appliedParams,
      setIsLoadingMore,
      setLoadMoreError,
      appendHotels,
      setHotelsTotal,
      setLoadedPage,
      setHasMore,
    } = usePageStore.getState();

    if (!hasMore || isLoadingMore || isLoadingHotels) {
      return;
    }

    const nextPage = loadedPage + 1;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const {
        items,
        hasMore: nextHasMore,
        total,
      } = await fetchHotelPage(appliedParams, nextPage);

      appendHotels(items);
      // 总数每页都跟服务端对齐：期间别人增删了酒店，这里要反映真实值
      setHotelsTotal(total);
      setLoadedPage(nextPage);
      setHasMore(nextHasMore);
    } catch (err) {
      // 保留 hasMore：失败不代表没有下一页，用户可以原地重试
      setLoadMoreError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoadingMore(false);
    }
  },

  /**
   * 局部更新取数条件并重新取第一页。
   *
   * 接收 patch 而非整份条件：筛选来自 search-filter、排序来自 hotel-list，
   * 各改各的那部分，新增取数参数时也不必逐个改调用点。
   */
  applySearchParams(patch: Partial<SearchParams>) {
    const searchParams = { ...usePageStore.getState().appliedParams, ...patch };

    void pageActions.loadHotels(searchParams);

    /*
     * 列表重置回第一页，滚动位置也必须回到列表顶部。
     *
     * 少了这步，用户在页底换筛选或排序时，列表缩回一页而视口还停在下方，
     * 末尾哨兵立刻又进视口，于是自动连锁翻页直到取完。
     * 收在这里而不是各调用点：筛选与排序都会走到这，分开写必漏一个。
     */
    // 用 auto 而非 smooth：平滑滚动要几百毫秒，取数比它先回来，
    // 哨兵会在视口还没归位时重新挂载并立刻触发下一页
    getLive("hotelListRef")?.current?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });

    const query = new URLSearchParams(serializeParams(searchParams)).toString();
    history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  },

  retryHotels() {
    void pageActions.loadHotels(usePageStore.getState().appliedParams);
  },

  /**
   * 收藏走乐观更新：先按预期改本地，再发请求，失败回滚到快照。
   * 收藏是高频轻操作，等 300ms 再亮起会让人觉得点了没反应；
   * 回滚用请求前的快照而非「再取反一次」——并发点击下取反会把状态推到错的一边。
   */
  async toggleFavorite(hotelId: string) {
    const { favoriteIds, setFavoriteIds, setFavoriteError } =
      usePageStore.getState();

    const snapshot = favoriteIds;
    const nextIds = favoriteIds.includes(hotelId)
      ? favoriteIds.filter((id) => id !== hotelId)
      : [...favoriteIds, hotelId];

    setFavoriteIds(nextIds);
    setFavoriteError(null);
    try {
      await toggleHotelFavorite(hotelId);
    } catch (err) {
      setFavoriteIds(snapshot);
      setFavoriteError(err instanceof Error ? err : new Error(String(err)));
    }
  },

  dismissFavoriteError() {
    usePageStore.getState().setFavoriteError(null);
  },

  toggleSelect(hotelId: string) {
    const { selectedHotelIds, setSelectedHotelIds } = usePageStore.getState();

    setSelectedHotelIds(
      selectedHotelIds.includes(hotelId)
        ? selectedHotelIds.filter((id) => id !== hotelId)
        : [...selectedHotelIds, hotelId],
    );
  },

  /** 全选的作用域是「已加载的」而非「全部匹配的」：后者还没取回，勾了也提交不了 */
  selectAllLoaded() {
    const { hotels, setSelectedHotelIds } = usePageStore.getState();

    setSelectedHotelIds(hotels.map((hotel) => hotel.id));
  },

  clearSelection() {
    usePageStore.getState().setSelectedHotelIds([]);
  },

  /**
   * 批量收藏。与单项收藏刻意不同：不做乐观更新。
   *
   * 单项操作失败只需回滚一个值，批量的结果是「部分成功」，
   * 先全亮起再挑几个回滚，中间态会让用户以为全成了。故等结果回来再落库：
   * 成功项并入收藏，失败项点名给用户、并保留在选中态里供原地重试。
   */
  async batchFavorite() {
    const {
      selectedHotelIds,
      favoriteIds,
      isBatchFavoriting,
      setFavoriteIds,
      setSelectedHotelIds,
      setIsBatchFavoriting,
      setBatchFavoriteFailures,
    } = usePageStore.getState();

    if (selectedHotelIds.length === 0 || isBatchFavoriting) {
      return;
    }

    setIsBatchFavoriting(true);
    setBatchFavoriteFailures([]);
    try {
      const { succeededIds, failures } =
        await batchFavoriteHotels(selectedHotelIds);

      // 去重：选中项里可能已有收藏过的
      setFavoriteIds([...new Set([...favoriteIds, ...succeededIds])]);
      setBatchFavoriteFailures(failures);
      setSelectedHotelIds(failures.map((failure) => failure.hotelId));
    } catch (err) {
      // 整个请求没发出去，逐项成败无从得知，故全部按失败处理、选中态整批保留
      const reason = err instanceof Error ? err.message : String(err);

      setBatchFavoriteFailures(
        selectedHotelIds.map((hotelId) => ({ hotelId, reason })),
      );
    } finally {
      setIsBatchFavoriting(false);
    }
  },

  dismissBatchFavoriteFailures() {
    usePageStore.getState().setBatchFavoriteFailures([]);
  },
};
