import {
  createEntityAdapter,
  createSlice,
  type EntityState,
  type PayloadAction,
} from "@reduxjs/toolkit";

import { FetchStatus } from "@/lib/fetch-status";

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
 * 取数状态一律用 FetchStatus，操作类失败一律走 toast，故本 slice 不存任何错误消息：
 * 存下来的字符串没有渲染它的地方，只会变成要人清理的死值。
 */
interface HomestayPageState {
  listings: EntityState<Listing, string>;
  listingsStatus: FetchStatus;
  selectedListingId: string | null;
  appliedFilters: ListingFilters;

  /*
   * 详情整组放页面层：触发方是 listing-list（卡片上的入口），消费方是 listing-detail。
   * 跨模块的开关落在任一模块的 slice 里，另一方就得反向 import。
   * 抽屉内部的提交 loading 反过来归各自模块 slice——那是「谁执行」的状态。
   */
  listingDetail: ListingDetail | null;
  detailStatus: FetchStatus;
  detailListingId: string | null;
  isDetailDrawerOpen: boolean;

  /** 收藏态：列表卡片与详情抽屉都要读，故放页面层 */
  favoriteIds: string[];

  /*
   * 确认弹窗的场景放页面层，理由同上：列表卡片与详情抽屉都能触发同一个弹窗。
   * 为 null 表示弹窗关闭，省掉一个与场景必须同步变更的 isOpen 布尔。
   */
  confirmScene: ConfirmScene | null;

  isSubmittingInquiry: boolean;
  inquirySubmitted: boolean;
}

const initialState: HomestayPageState = {
  listings: listingsAdapter.getInitialState(),
  listingsStatus: FetchStatus.Ready,
  selectedListingId: null,
  appliedFilters: DEFAULT_FILTERS,

  listingDetail: null,
  detailStatus: FetchStatus.Ready,
  detailListingId: null,
  isDetailDrawerOpen: false,

  favoriteIds: [],

  confirmScene: null,

  isSubmittingInquiry: false,
  inquirySubmitted: false,
};

const homestayPageSlice = createSlice({
  name: "homestayPage",
  initialState,
  reducers: {
    setListings(state, action: PayloadAction<Listing[]>) {
      listingsAdapter.setAll(state.listings, action.payload);
    },
    setListingsStatus(state, action: PayloadAction<FetchStatus>) {
      state.listingsStatus = action.payload;
    },
    setSelectedListingId(state, action: PayloadAction<string | null>) {
      state.selectedListingId = action.payload;
    },
    setAppliedFilters(state, action: PayloadAction<ListingFilters>) {
      state.appliedFilters = action.payload;
    },
    setListingDetail(state, action: PayloadAction<ListingDetail | null>) {
      state.listingDetail = action.payload;
    },
    setDetailStatus(state, action: PayloadAction<FetchStatus>) {
      state.detailStatus = action.payload;
    },
    setDetailListingId(state, action: PayloadAction<string | null>) {
      state.detailListingId = action.payload;
    },
    setIsDetailDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isDetailDrawerOpen = action.payload;
    },

    /**
     * 详情上下文整组归零：退出当前房源、或列表结果作废时都走这里。
     *
     * 收成一个 reducer 而不在各调用点手写字段清单，是因为 isDetailDrawerOpen 容易被落下：
     * 抽屉渲染在 detailListingId 的可见性判断之内，只清 id 时抽屉会随模块卸载而看似关闭，
     * 开关却仍是 true；又因 store 是页面级单例不随卸载重置，下次点开任意房源抽屉就会自动弹出。
     */
    clearDetailContext(state) {
      state.listingDetail = null;
      state.detailStatus = FetchStatus.Ready;
      state.detailListingId = null;
      state.isDetailDrawerOpen = false;
    },

    setFavoriteIds(state, action: PayloadAction<string[]>) {
      state.favoriteIds = action.payload;
    },
    setConfirmScene(state, action: PayloadAction<ConfirmScene | null>) {
      state.confirmScene = action.payload;
    },
    setIsSubmittingInquiry(state, action: PayloadAction<boolean>) {
      state.isSubmittingInquiry = action.payload;
    },
    setInquirySubmitted(state, action: PayloadAction<boolean>) {
      state.inquirySubmitted = action.payload;
    },
  },
});

export const {
  setListings,
  setListingsStatus,
  setSelectedListingId,
  setAppliedFilters,
  setListingDetail,
  setDetailStatus,
  setDetailListingId,
  setIsDetailDrawerOpen,
  clearDetailContext,
  setFavoriteIds,
  setConfirmScene,
  setIsSubmittingInquiry,
  setInquirySubmitted,
} = homestayPageSlice.actions;

export const homestayPageReducer = homestayPageSlice.reducer;
