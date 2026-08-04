import { create } from "zustand";
import { persist } from "zustand/middleware";

import { FetchStatus } from "@/lib/fetch-status";

import type { BatchFavoriteFailure, Hotel, SearchParams } from "./shared/types";

const DEFAULT_PARAMS: SearchParams = {
  keyword: "",
  star: 0,
  sortBy: "price",
};

/** 改动即改动存储格式，需兼容老数据 */
interface PersistedPageState {
  appliedParams: SearchParams;
  favoriteIds: string[];
}

interface PageStore {
  hotels: Hotel[];
  hotelsTotal: number;
  hotelsStatus: FetchStatus;
  selectedHotelId: string | null;
  appliedParams: SearchParams;

  loadedPage: number;
  hasMore: boolean;
  /** 与 hotelsStatus 分开：首屏要盖住整个列表，加载更多只在列表末尾转圈 */
  loadMoreStatus: FetchStatus;

  favoriteIds: string[];

  /** 多选集合，批量操作的作用域；与单选的 selectedHotelId 各管一件事 */
  selectedHotelIds: string[];
  isBatchFavoriting: boolean;
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
      name: "hotel-page",
      /** 白名单：只落盘长期偏好，瞬时态与服务端快照不跨会话 */
      partialize: (state) => {
        const { appliedParams, favoriteIds } = state;

        return { appliedParams, favoriteIds };
      },
      /** 与默认值合并，避免老数据缺少后加的字段 */
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
