import { message } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import {
  cancelInquiry as cancelInquiryService,
  fetchListingDetail,
  fetchListings,
  submitInquiry as submitInquiryService,
  toggleFavorite as toggleFavoriteService,
} from "./data/services";
import { ConfirmScene, type ConfirmRequest } from "./shared/confirm";
import type { ListingFilters } from "./shared/filters";
import type { InquiryForm } from "./shared/inquiry";
import { reportTrace } from "./shared/trace";
import {
  addFavoriteId,
  finishFavoriting,
  removeFavoriteId,
  resetResultSet,
  setAppliedFilters,
  setConfirmRequest,
  setDetailStatus,
  setIsDetailDrawerOpen,
  setIsSubmittingInquiry,
  setListingDetail,
  setListings,
  setListingsStatus,
  setSelectedListingId,
  setSubmittedInquiry,
  startFavoriting,
} from "./slice";
import { selectTraceCommonTag, store } from "./store";

let latestDetailRequestId = 0;

async function loadListingDetail(listingId: string) {
  const requestId = (latestDetailRequestId += 1);

  const isCurrent = () =>
    requestId === latestDetailRequestId &&
    store.getState().page.selectedListingId === listingId;

  store.dispatch(setDetailStatus(FetchStatus.Loading));
  try {
    const detail = await fetchListingDetail(listingId);
    if (!isCurrent()) {
      return;
    }
    store.dispatch(setListingDetail(detail));
    store.dispatch(setDetailStatus(FetchStatus.Ready));
  } catch {
    if (!isCurrent()) {
      return;
    }
    store.dispatch(setDetailStatus(FetchStatus.Error));
  }
}

export const pageActions = {

  trackClick(event: string, extra: Record<string, string> = {}) {
    reportTrace(event, {
      ...selectTraceCommonTag(store.getState()),
      ...extra,
    });
  },

  async loadListings(filters: ListingFilters) {
    store.dispatch(setAppliedFilters(filters));
    store.dispatch(setListingsStatus(FetchStatus.Loading));
    store.dispatch(resetResultSet());

    try {
      const listings = await fetchListings(filters);
      store.dispatch(setListings(listings));
      store.dispatch(setListingsStatus(FetchStatus.Ready));
    } catch {
      store.dispatch(setListingsStatus(FetchStatus.Error));
    }
  },

  retryListings() {
    void pageActions.loadListings(store.getState().page.appliedFilters);
  },

  selectListing(listingId: string) {
    store.dispatch(setSelectedListingId(listingId));
    void loadListingDetail(listingId);
  },

  openDetailDrawer() {
    store.dispatch(setIsDetailDrawerOpen(true));
  },

  closeDetailDrawer() {
    store.dispatch(setIsDetailDrawerOpen(false));
  },

  retryDetail() {
    const { selectedListingId } = store.getState().page;

    if (!selectedListingId) {
      return;
    }
    void loadListingDetail(selectedListingId);
  },

  openConfirm(request: ConfirmRequest) {
    store.dispatch(setConfirmRequest(request));
  },

  closeConfirm() {
    store.dispatch(setConfirmRequest(null));
  },

  async commitFavorite(listingId: string) {
    const { favoriteIds } = store.getState().page;
    const wasFavorite = favoriteIds.includes(listingId);

    store.dispatch(startFavoriting(listingId));
    try {
      await toggleFavoriteService(listingId);
      store.dispatch(
        wasFavorite ? removeFavoriteId(listingId) : addFavoriteId(listingId),
      );
    } finally {
      store.dispatch(finishFavoriting(listingId));
    }
  },

  async addFavorite(listingId: string) {
    try {
      await pageActions.commitFavorite(listingId);
    } catch (err) {
      message.error(err instanceof Error ? err.message : String(err));
    }
  },

  toggleFavorite(listingId: string) {
    const { favoriteIds, favoritingIds } = store.getState().page;

    if (favoritingIds.includes(listingId)) {
      return;
    }

    const willFavorite = !favoriteIds.includes(listingId);

    pageActions.trackClick("listing_favorite_toggle", {
      listingId,
      willFavorite: String(willFavorite),
    });

    if (willFavorite) {
      void pageActions.addFavorite(listingId);
      return;
    }

    pageActions.openConfirm({
      scene: ConfirmScene.RemoveFavorite,
      listingId,
    });
  },

  async submitInquiry(values: InquiryForm) {
    const { selectedListingId } = store.getState().page;

    if (!selectedListingId) {
      throw new Error("请先选择要询价的房源");
    }

    store.dispatch(setIsSubmittingInquiry(true));
    store.dispatch(setSubmittedInquiry(null));
    try {
      const submitted = await submitInquiryService({
        ...values,
        listingId: selectedListingId,
      });

      store.dispatch(setSubmittedInquiry(submitted));
    } finally {
      store.dispatch(setIsSubmittingInquiry(false));
    }
  },

  async cancelInquiry() {
    const { submittedInquiry } = store.getState().page;

    if (!submittedInquiry) {
      return;
    }

    await cancelInquiryService(submittedInquiry.inquiryId);
    store.dispatch(setSubmittedInquiry(null));
  },
};
