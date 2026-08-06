import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { FetchStatus } from "@/lib/fetch-status";

import type { ConfirmRequest } from "./shared/confirm";
import type { ListingFilters } from "./shared/filters";
import type { SubmittedInquiry } from "./shared/inquiry";
import type { Listing, ListingDetail } from "./shared/listing";

interface HomestayPageState {
  listings: Listing[];
  listingsStatus: FetchStatus;
  selectedListingId: string | null;
  appliedFilters: ListingFilters;

  listingDetail: ListingDetail | null;
  detailStatus: FetchStatus;
  isDetailDrawerOpen: boolean;

  favoriteIds: string[];
  favoritingIds: string[];

  confirmRequest: ConfirmRequest | null;

  isSubmittingInquiry: boolean;
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
