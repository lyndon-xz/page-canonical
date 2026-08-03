import {
  createEntityAdapter,
  createSlice,
  type EntityState,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  ConfirmScene,
  Listing,
  ListingDetail,
  ListingFilters,
} from "./shared/types";

// 本文件被 store.ts 组装、被 listeners.ts 取 action creator，
// 因此禁止 import store 的运行时内容，需要类型时一律 type-only import。

const DEFAULT_FILTERS: ListingFilters = { keyword: "", roomType: "" };

/**
 * 房源规范化存储：`{ids, entities}` 而不是数组。
 *
 * 详情模块要按 id 取单条房源，数组下每次都得 `find` 一遍；
 * 规范化后是字典查，且详情不再隐式依赖列表的顺序与位置。
 * 展示顺序由服务端返回的 ids 顺序决定，不在前端另排一次。
 */
export const listingsAdapter = createEntityAdapter<Listing>();

/*
 * 错误一律存消息字符串而非 Error 实例：RTK 的 serializableCheck 会拦下不可序列化的值，
 * 且 store 快照要能进 devtools / persist。Error 的堆栈属于上报关心的东西，不是 UI 状态。
 */
interface HomestayPageState {
  listings: EntityState<Listing, string>;
  isLoadingListings: boolean;
  listingsError: string | null;
  selectedListingId: string | null;
  appliedFilters: ListingFilters;

  /*
   * 详情抽屉的开关放页面层：触发方是 listing-list（卡片上的入口），
   * 消费方是 listing-detail。跨模块的开关落在任一模块的 slice 里，另一方就得反向 import。
   * 抽屉内部的提交 loading 反过来归各自模块 slice——那是「谁执行」的状态。
   */
  isDetailDrawerOpen: boolean;
  detailListingId: string | null;
  listingDetail: ListingDetail | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  /*
   * 确认弹窗的场景放页面层，理由同上：列表卡片与详情抽屉都能触发同一个弹窗。
   * 为 null 表示弹窗关闭，省掉一个与场景必须同步变更的 isOpen 布尔。
   */
  confirmScene: ConfirmScene | null;

  /** 收藏态：列表卡片与详情抽屉都要读，故放页面层 */
  favoriteIds: string[];
  /** 直接收藏（无二次确认那条路径）的失败提示；取消收藏的失败留在确认弹窗内 */
  favoriteError: string | null;

  isSubmittingInquiry: boolean;
  inquiryError: string | null;
  inquirySubmitted: boolean;
}

const initialState: HomestayPageState = {
  listings: listingsAdapter.getInitialState(),
  isLoadingListings: false,
  listingsError: null,
  selectedListingId: null,
  appliedFilters: DEFAULT_FILTERS,

  isDetailDrawerOpen: false,
  detailListingId: null,
  listingDetail: null,
  isLoadingDetail: false,
  detailError: null,

  confirmScene: null,

  favoriteIds: [],
  favoriteError: null,

  isSubmittingInquiry: false,
  inquiryError: null,
  inquirySubmitted: false,
};

const homestayPageSlice = createSlice({
  name: "homestayPage",
  initialState,
  reducers: {
    setListings(state, action: PayloadAction<Listing[]>) {
      listingsAdapter.setAll(state.listings, action.payload);
    },
    setIsLoadingListings(state, action: PayloadAction<boolean>) {
      state.isLoadingListings = action.payload;
    },
    setListingsError(state, action: PayloadAction<string | null>) {
      state.listingsError = action.payload;
    },
    setSelectedListingId(state, action: PayloadAction<string | null>) {
      state.selectedListingId = action.payload;
    },
    setAppliedFilters(state, action: PayloadAction<ListingFilters>) {
      state.appliedFilters = action.payload;
    },
    setIsDetailDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isDetailDrawerOpen = action.payload;
    },
    setDetailListingId(state, action: PayloadAction<string | null>) {
      state.detailListingId = action.payload;
    },
    setListingDetail(state, action: PayloadAction<ListingDetail | null>) {
      state.listingDetail = action.payload;
    },
    setIsLoadingDetail(state, action: PayloadAction<boolean>) {
      state.isLoadingDetail = action.payload;
    },
    setDetailError(state, action: PayloadAction<string | null>) {
      state.detailError = action.payload;
    },

    /**
     * 详情上下文整组归零：退出当前房源、或列表结果作废时都走这里。
     *
     * 收成一个 reducer 而不在各调用点手写字段清单，是因为 isDetailDrawerOpen 容易被落下：
     * 抽屉渲染在 detailListingId 的可见性判断之内，只清 id 时抽屉会随模块卸载而看似关闭，
     * 开关却仍是 true；又因 store 是页面级单例不随卸载重置，下次点开任意房源抽屉就会自动弹出。
     */
    clearDetailContext(state) {
      state.detailListingId = null;
      state.listingDetail = null;
      state.isDetailDrawerOpen = false;
      state.isLoadingDetail = false;
      state.detailError = null;
    },

    setConfirmScene(state, action: PayloadAction<ConfirmScene | null>) {
      state.confirmScene = action.payload;
    },
    setFavoriteIds(state, action: PayloadAction<string[]>) {
      state.favoriteIds = action.payload;
    },
    setFavoriteError(state, action: PayloadAction<string | null>) {
      state.favoriteError = action.payload;
    },
    setIsSubmittingInquiry(state, action: PayloadAction<boolean>) {
      state.isSubmittingInquiry = action.payload;
    },
    setInquiryError(state, action: PayloadAction<string | null>) {
      state.inquiryError = action.payload;
    },
    setInquirySubmitted(state, action: PayloadAction<boolean>) {
      state.inquirySubmitted = action.payload;
    },
  },
});

export const {
  setListings,
  setIsLoadingListings,
  setListingsError,
  setSelectedListingId,
  setAppliedFilters,
  setIsDetailDrawerOpen,
  setDetailListingId,
  setListingDetail,
  setIsLoadingDetail,
  setDetailError,
  clearDetailContext,
  setConfirmScene,
  setFavoriteIds,
  setFavoriteError,
  setIsSubmittingInquiry,
  setInquiryError,
  setInquirySubmitted,
} = homestayPageSlice.actions;

export const homestayPageReducer = homestayPageSlice.reducer;
