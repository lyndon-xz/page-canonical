import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { BatchFavoriteFailure, Hotel, SearchParams } from "./shared/types";

const DEFAULT_PARAMS: SearchParams = { keyword: "", star: 0 };

const PERSIST_KEY = "hotel-page";

/** 落盘的字段集合，由 partialize 挑出。改这里等于改存储格式 */
interface PersistedPageState {
  appliedParams: SearchParams;
  favoriteIds: string[];
}

interface PageStore {
  hotels: Hotel[];
  isLoadingHotels: boolean;
  hotelsError: Error | null;
  selectedHotelId: string | null;
  appliedParams: SearchParams;

  /** 已加载到第几页；下一页取 loadedPage + 1 */
  loadedPage: number;
  hasMore: boolean;
  /** 与 isLoadingHotels 分开：首屏要盖住整个列表，加载更多只在列表末尾转圈 */
  isLoadingMore: boolean;
  loadMoreError: Error | null;

  favoriteIds: string[];
  /** 乐观更新失败后的提示；成功路径下始终为 null */
  favoriteError: Error | null;

  /** 多选集合，批量操作的作用域；与单选的 selectedHotelId 各管一件事 */
  selectedHotelIds: string[];
  isBatchFavoriting: boolean;
  /** 批量收藏中失败的项。空数组表示上一次批量全部成功 */
  batchFavoriteFailures: BatchFavoriteFailure[];

  setHotels: (hotels: Hotel[]) => void;
  appendHotels: (hotels: Hotel[]) => void;
  setIsLoadingHotels: (loading: boolean) => void;
  setHotelsError: (error: Error | null) => void;
  setSelectedHotelId: (id: string | null) => void;
  setAppliedParams: (searchParams: SearchParams) => void;
  setLoadedPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoadingMore: (loading: boolean) => void;
  setLoadMoreError: (error: Error | null) => void;
  setFavoriteIds: (ids: string[]) => void;
  setFavoriteError: (error: Error | null) => void;
  setSelectedHotelIds: (ids: string[]) => void;
  setIsBatchFavoriting: (batchFavoriting: boolean) => void;
  setBatchFavoriteFailures: (failures: BatchFavoriteFailure[]) => void;
}

export const usePageStore = create<PageStore>()(
  persist<PageStore, [], [], PersistedPageState>(
    (set) => ({
      hotels: [],
      isLoadingHotels: false,
      hotelsError: null,
      selectedHotelId: null,
      appliedParams: DEFAULT_PARAMS,

      loadedPage: 0,
      hasMore: false,
      isLoadingMore: false,
      loadMoreError: null,

      favoriteIds: [],
      favoriteError: null,

      selectedHotelIds: [],
      isBatchFavoriting: false,
      batchFavoriteFailures: [],

      setHotels: (hotels) => set({ hotels }),
      appendHotels: (hotels) =>
        set((state) => ({ hotels: [...state.hotels, ...hotels] })),
      setIsLoadingHotels: (loading) => set({ isLoadingHotels: loading }),
      setHotelsError: (error) => set({ hotelsError: error }),
      setSelectedHotelId: (id) => set({ selectedHotelId: id }),
      setAppliedParams: (searchParams) => set({ appliedParams: searchParams }),
      setLoadedPage: (page) => set({ loadedPage: page }),
      setHasMore: (hasMore) => set({ hasMore }),
      setIsLoadingMore: (loading) => set({ isLoadingMore: loading }),
      setLoadMoreError: (error) => set({ loadMoreError: error }),
      setFavoriteIds: (ids) => set({ favoriteIds: ids }),
      setFavoriteError: (error) => set({ favoriteError: error }),
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
       * isLoading* 存下来后重进页面会永久转圈，hotels 存下来是一份会过期的旧数据，
       * selectedHotelIds 与 error 是一次性的操作意图与结果，都不该跨会话活着。
       */
      partialize: (state) => ({
        appliedParams: state.appliedParams,
        favoriteIds: state.favoriteIds,
      }),
    },
  ),
);
