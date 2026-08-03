import { create } from "zustand";
import { persist } from "zustand/middleware";

import { FetchStatus } from "@/lib/fetch-status";

import type { BatchFavoriteFailure, Hotel, SearchParams } from "./shared/types";

const DEFAULT_PARAMS: SearchParams = {
  keyword: "",
  star: 0,
  sortBy: "price",
};

const PERSIST_KEY = "hotel-page";

/** 落盘的字段集合，由 partialize 挑出。改这里等于改存储格式 */
interface PersistedPageState {
  appliedParams: SearchParams;
  favoriteIds: string[];
}

interface PageStore {
  hotels: Hotel[];
  /**
   * 匹配筛选条件的总条数，由服务端给出。
   * 与 hotels.length（已加载条数）是两回事：后者随分页累加，不能用来显示「找到 N 家」。
   */
  hotelsTotal: number;
  hotelsStatus: FetchStatus;
  selectedHotelId: string | null;
  appliedParams: SearchParams;

  /** 已加载到第几页；下一页取 loadedPage + 1 */
  loadedPage: number;
  hasMore: boolean;
  /** 与 hotelsStatus 分开：首屏要盖住整个列表，加载更多只在列表末尾转圈 */
  loadMoreStatus: FetchStatus;

  favoriteIds: string[];

  /** 多选集合，批量操作的作用域；与单选的 selectedHotelId 各管一件事 */
  selectedHotelIds: string[];
  isBatchFavoriting: boolean;
  /** 批量收藏中失败的项。空数组表示上一次批量全部成功 */
  batchFavoriteFailures: BatchFavoriteFailure[];

  setHotels: (hotels: Hotel[]) => void;
  appendHotels: (hotels: Hotel[]) => void;
  setHotelsTotal: (total: number) => void;
  setHotelsStatus: (status: FetchStatus) => void;
  setSelectedHotelId: (id: string | null) => void;
  setAppliedParams: (searchParams: SearchParams) => void;
  setLoadedPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoadMoreStatus: (status: FetchStatus) => void;
  setFavoriteIds: (ids: string[]) => void;
  setSelectedHotelIds: (ids: string[]) => void;
  setIsBatchFavoriting: (batchFavoriting: boolean) => void;
  setBatchFavoriteFailures: (failures: BatchFavoriteFailure[]) => void;
}

export const usePageStore = create<PageStore>()(
  persist<PageStore, [], [], PersistedPageState>(
    (set) => ({
      hotels: [],
      hotelsTotal: 0,
      hotelsStatus: FetchStatus.Ready,
      selectedHotelId: null,
      appliedParams: DEFAULT_PARAMS,

      loadedPage: 0,
      hasMore: false,
      loadMoreStatus: FetchStatus.Ready,

      favoriteIds: [],

      selectedHotelIds: [],
      isBatchFavoriting: false,
      batchFavoriteFailures: [],

      setHotels: (hotels) => set({ hotels }),
      appendHotels: (hotels) =>
        set((state) => ({ hotels: [...state.hotels, ...hotels] })),
      setHotelsTotal: (total) => set({ hotelsTotal: total }),
      setHotelsStatus: (status) => set({ hotelsStatus: status }),
      setSelectedHotelId: (id) => set({ selectedHotelId: id }),
      setAppliedParams: (searchParams) => set({ appliedParams: searchParams }),
      setLoadedPage: (page) => set({ loadedPage: page }),
      setHasMore: (hasMore) => set({ hasMore }),
      setLoadMoreStatus: (status) => set({ loadMoreStatus: status }),
      setFavoriteIds: (ids) => set({ favoriteIds: ids }),
      setSelectedHotelIds: (ids) => set({ selectedHotelIds: ids }),
      setIsBatchFavoriting: (batchFavoriting) =>
        set({ isBatchFavoriting: batchFavoriting }),
      setBatchFavoriteFailures: (failures) =>
        set({ batchFavoriteFailures: failures }),
    }),
    {
      name: PERSIST_KEY,
      /*
       * 白名单：只落盘用户的长期偏好，其余一概不存。
       *
       * 默认整棵 state 落盘会连瞬时态与服务端快照一起存：
       * 取数状态存下来后重进页面会停在上一次的 loading 或错误占位上，
       * hotels 存下来是一份会过期的旧数据，selectedHotelIds 与批量失败清单
       * 是一次性的操作意图与结果，都不该跨会话活着。
       */
      partialize: (state) => ({
        appliedParams: state.appliedParams,
        favoriteIds: state.favoriteIds,
      }),
      /*
       * 恢复时把落盘值与当前默认值合并，而不是直接展开覆盖。
       *
       * 落盘结构会随版本演进：给 appliedParams 新增一个字段后，老用户存下来的那份就缺它，
       * 直接展开会让该字段变成 undefined，一路传到取数与排序里炸掉。
       */
      merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedPageState> | undefined;

        return {
          ...current,
          ...saved,
          appliedParams: { ...DEFAULT_PARAMS, ...saved?.appliedParams },
        };
      },
    },
  ),
);
