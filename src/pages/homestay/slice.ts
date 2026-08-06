import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { FetchStatus } from "@/lib/fetch-status";

import type { ConfirmRequest } from "./shared/confirm";
import type { ListingFilters } from "./shared/filters";
import type { SubmittedInquiry } from "./shared/inquiry";
import type { Listing, ListingDetail } from "./shared/listing";

// 被 store.ts 与 listeners.ts import，故禁止 import store 的运行时内容

interface HomestayPageState {
  listings: Listing[];
  listingsStatus: FetchStatus;
  /** 选中即看详情，故没有另一个「详情在看谁」；弹窗要处理谁由 confirmRequest 自带 */
  selectedListingId: string | null;
  appliedFilters: ListingFilters;

  listingDetail: ListingDetail | null;
  detailStatus: FetchStatus;
  /** 与 selectedListingId 分开：看谁与在哪看解耦，抽屉才能复用内联区已取到的详情 */
  isDetailDrawerOpen: boolean;

  favoriteIds: string[];
  /** 收藏请求进行中的房源。悲观更新下心标要等接口回来才变，按钮得先有个进行中的样子 */
  favoritingIds: string[];

  /** 为 null 表示弹窗关闭 */
  confirmRequest: ConfirmRequest | null;

  isSubmittingInquiry: boolean;
  /** 为 null 表示当前没有已提交的询价；撤回凭 id、成功态显示 quote，故整条存下 */
  submittedInquiry: SubmittedInquiry | null;
}

const initialState: HomestayPageState = {
  listings: [],
  listingsStatus: FetchStatus.Ready,
  selectedListingId: null,
  appliedFilters: { keyword: "", roomType: "" },

  listingDetail: null,
  detailStatus: FetchStatus.Ready,
  isDetailDrawerOpen: false,

  favoriteIds: [],
  favoritingIds: [],

  confirmRequest: null,

  isSubmittingInquiry: false,
  submittedInquiry: null,
};

/**
 * 退出当前房源：选中态与整组详情上下文同生同灭。
 *
 * 少清 isDetailDrawerOpen 会留下「抽屉随模块卸载看似关闭，开关却仍是 true」，
 * 下次点开任意房源就自动弹出；少清 detailStatus 会让下一套房先闪一帧上一套的失败占位。
 */
function exitListingState(state: HomestayPageState) {
  state.selectedListingId = null;
  state.listingDetail = null;
  state.detailStatus = FetchStatus.Ready;
  state.isDetailDrawerOpen = false;
}

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
    setSelectedListingId(state, action: PayloadAction<string>) {
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
    setIsDetailDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isDetailDrawerOpen = action.payload;
    },
    exitListing(state) {
      exitListingState(state);
    },

    /**
     * 收藏的增删落在 reducer 里，不由 action 用请求前的快照做全量覆盖：
     * 悲观更新下两次收藏的请求会重叠，各自基于旧快照覆盖会把先落库的那次抹掉。
     */
    addFavoriteId(state, action: PayloadAction<string>) {
      if (!state.favoriteIds.includes(action.payload)) {
        state.favoriteIds.push(action.payload);
      }
    },
    removeFavoriteId(state, action: PayloadAction<string>) {
      state.favoriteIds = state.favoriteIds.filter(
        (id) => id !== action.payload,
      );
    },
    startFavoriting(state, action: PayloadAction<string>) {
      if (!state.favoritingIds.includes(action.payload)) {
        state.favoritingIds.push(action.payload);
      }
    },
    finishFavoriting(state, action: PayloadAction<string>) {
      state.favoritingIds = state.favoritingIds.filter(
        (id) => id !== action.payload,
      );
    },

    setConfirmRequest(state, action: PayloadAction<ConfirmRequest | null>) {
      state.confirmRequest = action.payload;
    },
    setIsSubmittingInquiry(state, action: PayloadAction<boolean>) {
      state.isSubmittingInquiry = action.payload;
    },
    setSubmittedInquiry(state, action: PayloadAction<SubmittedInquiry | null>) {
      state.submittedInquiry = action.payload;
    },

    /**
     * 作废上一轮结果集：列表本身，以及只对这批结果成立的选中、详情与待确认操作。
     *
     * 收在一个 reducer 里而不是在 action 里连着 dispatch 几句：散着写会留下
     * 「列表已空但选中态还指着旧房源」这类中间态，新增派生于结果集的状态时也没人提醒要来补一句。
     * favoriteIds 与 appliedFilters 不在其中，那是跨结果集的用户数据。
     */
    resetResultSet(state) {
      state.listings = [];
      state.confirmRequest = null;
      exitListingState(state);
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
  setIsDetailDrawerOpen,
  exitListing,
  addFavoriteId,
  removeFavoriteId,
  startFavoriting,
  finishFavoriting,
  setConfirmRequest,
  setIsSubmittingInquiry,
  setSubmittedInquiry,
  resetResultSet,
} = homestayPageSlice.actions;

export const homestayPageReducer = homestayPageSlice.reducer;
