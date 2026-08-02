import {
  batchFavoriteHotels,
  fetchHotelPage,
  toggleHotelFavorite,
} from "./data/services";
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
      setLoadedPage,
      setHasMore,
      setLoadMoreError,
    } = usePageStore.getState();

    setAppliedParams(searchParams);
    setIsLoadingHotels(true);
    setHotelsError(null);
    setLoadMoreError(null);
    try {
      const { items, hasMore } = await fetchHotelPage(searchParams, 1);
      setHotels(items);
      setLoadedPage(1);
      setHasMore(hasMore);
    } catch (err) {
      setHotelsError(err instanceof Error ? err : new Error(String(err)));
      setHotels([]);
      setLoadedPage(0);
      setHasMore(false);
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
      const { items, hasMore: nextHasMore } = await fetchHotelPage(
        appliedParams,
        nextPage,
      );
      appendHotels(items);
      setLoadedPage(nextPage);
      setHasMore(nextHasMore);
    } catch (err) {
      // 保留 hasMore：失败不代表没有下一页，用户可以原地重试
      setLoadMoreError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoadingMore(false);
    }
  },

  applySearchParams(searchParams: SearchParams) {
    void pageActions.loadHotels(searchParams);
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
