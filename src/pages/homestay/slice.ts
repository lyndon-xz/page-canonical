import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { FetchStatus } from "@/lib/fetch-status";

import type {
  ConfirmScene,
  Listing,
  ListingDetail,
  ListingFilters,
} from "./shared/types";

// 被 store.ts 与 listeners.ts import，故禁止 import store 的运行时内容

const DEFAULT_FILTERS: ListingFilters = { keyword: "", roomType: "" };

interface HomestayPageState {
  listings: Listing[];
  listingsStatus: FetchStatus;
  selectedListingId: string | null;
  appliedFilters: ListingFilters;

  listingDetail: ListingDetail | null;
  detailStatus: FetchStatus;
  detailListingId: string | null;
  /** 与 detailListingId 分开：看谁与在哪看解耦，抽屉才能复用内联区已取到的详情 */
  isDetailDrawerOpen: boolean;

  favoriteIds: string[];

  /** 为 null 表示弹窗关闭 */
  confirmScene: ConfirmScene | null;

  isSubmittingInquiry: boolean;
  inquirySubmitted: boolean;
}

const initialState: HomestayPageState = {
  listings: [],
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
      state.listings = action.payload;
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
     * 详情上下文整组归零，退出房源与列表结果作废都走这里。
     *
     * 单独清 detailListingId 会漏下 isDetailDrawerOpen：抽屉随模块卸载看似关闭，
     * 开关却仍是 true，下次点开任意房源就会自动弹出。
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
