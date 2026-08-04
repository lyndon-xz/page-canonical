import { create } from "zustand";
import { persist } from "zustand/middleware";

import { FetchStatus } from "@/lib/fetch-status";

import type {
  BatchFavoriteFailure,
  Hotel,
  HotelPage,
  SearchParams,
} from "./shared/types";

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

  /**
   * 装载首页。列表、总数、分页游标必须整组写入：分开设会留下
   * 「已有 12 条却 loadedPage 仍是 0」这类中间态，哨兵会照着它重复拉第 1 页。
   */
  setFirstPage: (page: HotelPage) => void;
  /** 追加下一页。页码由此处自增，调用方不再各自记账 */
  appendPage: (page: HotelPage) => void;

  setHotelsStatus: (status: FetchStatus) => void;
  setSelectedHotelId: (id: string | null) => void;
  setAppliedParams: (searchParams: SearchParams) => void;
  setLoadMoreStatus: (status: FetchStatus) => void;
  setFavoriteIds: (ids: string[]) => void;
  setSelectedHotelIds: (ids: string[]) => void;
  setIsBatchFavoriting: (batchFavoriting: boolean) => void;
  setBatchFavoriteFailures: (failures: BatchFavoriteFailure[]) => void;

  /**
   * 作废上一轮结果集：列表、分页游标、以及只对这批结果成立的选中与失败项。
   * favoriteIds 与 appliedParams 不在其中，那是跨结果集的用户数据。
   */
  resetResultSet: () => void;
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

      setFirstPage: (page) => {
        const { items, total, hasMore } = page;

        set({
          hotels: items,
          hotelsTotal: total,
          hasMore,
          loadedPage: 1,
        });
      },
      appendPage: (page) =>
        set((state) => {
          const { items, total, hasMore } = page;
          const { hotels, loadedPage } = state;

          return {
            hotels: [...hotels, ...items],
            // 总数每页都跟服务端对齐：期间别人增删了酒店，这里要反映真实值
            hotelsTotal: total,
            hasMore,
            loadedPage: loadedPage + 1,
          };
        }),

      setHotelsStatus: (status) => set({ hotelsStatus: status }),
      setSelectedHotelId: (id) => set({ selectedHotelId: id }),
      setAppliedParams: (searchParams) => set({ appliedParams: searchParams }),
      setLoadMoreStatus: (status) => set({ loadMoreStatus: status }),
      setFavoriteIds: (ids) => set({ favoriteIds: ids }),
      setSelectedHotelIds: (ids) => set({ selectedHotelIds: ids }),
      setIsBatchFavoriting: (batchFavoriting) =>
        set({ isBatchFavoriting: batchFavoriting }),
      setBatchFavoriteFailures: (failures) =>
        set({ batchFavoriteFailures: failures }),

      resetResultSet: () =>
        set({
          hotels: [],
          hotelsTotal: 0,
          loadedPage: 0,
          hasMore: false,
          // 上一轮翻页的失败痕迹要一并清掉，否则新列表仍显示失败框、哨兵不渲染，无限滚动失效
          loadMoreStatus: FetchStatus.Ready,
          selectedHotelId: null,
          selectedHotelIds: [],
          batchFavoriteFailures: [],
        }),
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
