import { message } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import {
  batchFavoriteHotels,
  fetchHotelPage,
  toggleHotelFavorite,
} from "./data/services";
import { getLive } from "./live";
import { parseSearchParams, serializeParams } from "./params";
import type { SearchParams } from "./shared/types";
import { usePageStore } from "./store";

/** storage 若换成异步实现，缺此门禁首屏会先按默认条件多拉一次 */
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

/** URL 带参是用户的明示意图，优先于隐式的持久化偏好 */
function resolveInitialParams(): SearchParams {
  if (window.location.search) {
    return parseSearchParams(window.location.search);
  }

  return usePageStore.getState().appliedParams;
}

async function loadHotels(searchParams: SearchParams) {
  const {
    setAppliedParams,
    setHotelsStatus,
    setHotels,
    setHotelsTotal,
    setLoadedPage,
    setHasMore,
    setLoadMoreStatus,
    setSelectedHotelId,
    setSelectedHotelIds,
    setBatchFavoriteFailures,
  } = usePageStore.getState();

  setAppliedParams(searchParams);
  setHotelsStatus(FetchStatus.Loading);
  // 上一轮翻页失败的状态要清掉，否则新列表仍显示失败框、哨兵不渲染，无限滚动失效
  setLoadMoreStatus(FetchStatus.Ready);

  // 先作废上一轮结果；favoriteIds 不清，那是跨结果集的用户数据
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
    setHotelsStatus(FetchStatus.Ready);
  } catch {
    // 结果态已在请求前清空，这里只翻状态
    setHotelsStatus(FetchStatus.Error);
  }
}

export const pageActions = {
  // ── 列表 ──

  /** 哨兵会连续触发，三个前置判断防并发拉同一页 */
  async loadMoreHotels() {
    const {
      hasMore,
      loadMoreStatus,
      hotelsStatus,
      loadedPage,
      appliedParams,
      setLoadMoreStatus,
      appendHotels,
      setHotelsTotal,
      setLoadedPage,
      setHasMore,
    } = usePageStore.getState();

    if (
      !hasMore ||
      loadMoreStatus === FetchStatus.Loading ||
      hotelsStatus === FetchStatus.Loading
    ) {
      return;
    }

    const nextPage = loadedPage + 1;
    setLoadMoreStatus(FetchStatus.Loading);
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
      setLoadMoreStatus(FetchStatus.Ready);
    } catch {
      // 保留 hasMore：失败不代表没有下一页，用户可以原地重试
      setLoadMoreStatus(FetchStatus.Error);
    }
  },

  async initPage() {
    await waitForHydration();
    await loadHotels(resolveInitialParams());
  },

  /** 接收 patch：筛选与排序分属两个模块，各改各的那部分 */
  applySearchParams(patch: Partial<SearchParams>) {
    const searchParams = { ...usePageStore.getState().appliedParams, ...patch };

    void loadHotels(searchParams);

    /*
     * 换条件后列表缩回一页，视口须回顶，否则末尾哨兵立即连锁翻页。
     * 用 auto 而非 smooth：平滑滚动要几百毫秒，取数比它先回来，
     * 哨兵会在视口还没归位时重新挂载并立刻触发下一页。
     */
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
    void loadHotels(usePageStore.getState().appliedParams);
  },

  // ── 选中 ──

  selectHotel(hotelId: string) {
    usePageStore.getState().setSelectedHotelId(hotelId);
  },

  // ── 多选 ──

  toggleSelect(hotelId: string) {
    const { selectedHotelIds, setSelectedHotelIds } = usePageStore.getState();

    setSelectedHotelIds(
      selectedHotelIds.includes(hotelId)
        ? selectedHotelIds.filter((id) => id !== hotelId)
        : [...selectedHotelIds, hotelId],
    );
  },

  /** 全选的作用域是「已加载的」而非「全部匹配的」：后者还没取回 */
  selectAllLoaded() {
    const { hotels, setSelectedHotelIds } = usePageStore.getState();

    setSelectedHotelIds(hotels.map((hotel) => hotel.id));
  },

  clearSelection() {
    usePageStore.getState().setSelectedHotelIds([]);
  },

  // ── 收藏 ──

  /** 乐观更新；回滚用请求前的快照，取反在并发点击下会推到错的一边 */
  async toggleFavorite(hotelId: string) {
    const { favoriteIds, setFavoriteIds } = usePageStore.getState();

    const snapshot = favoriteIds;
    const nextIds = favoriteIds.includes(hotelId)
      ? favoriteIds.filter((id) => id !== hotelId)
      : [...favoriteIds, hotelId];

    setFavoriteIds(nextIds);
    try {
      await toggleHotelFavorite(hotelId);
    } catch (err) {
      setFavoriteIds(snapshot);
      // 回滚已经把星标弹回去了，但那只是「没生效」，用户还需要知道为什么
      message.error(err instanceof Error ? err.message : String(err));
    }
  },

  /**
   * 不做乐观更新：批量结果是部分成功，先全亮起再挑几个回滚会让用户以为全成了。
   * 失败项保留在选中态里供原地重试。
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
