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

let resultSetGeneration = 0;

const isCurrentGeneration = (generation: number) =>
  generation === resultSetGeneration;

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
  // ── 埋点 ──

  trackClick(event: string, extra: Record<string, string> = {}) {
    reportTrace(event, {
      ...selectTraceCommonTag(store.getState()),
      ...extra,
    });
  },

  // ── 列表 ──

  async loadListings(filters: ListingFilters) {
    const generation = (resultSetGeneration += 1);

    store.dispatch(setAppliedFilters(filters));
    store.dispatch(setListingsStatus(FetchStatus.Loading));
    store.dispatch(resetResultSet());

    try {
      const listings = await fetchListings(filters);
      if (!isCurrentGeneration(generation)) {
        return;
      }
      store.dispatch(setListings(listings));
      store.dispatch(setListingsStatus(FetchStatus.Ready));
    } catch {
      if (!isCurrentGeneration(generation)) {
        return;
      }
      store.dispatch(setListingsStatus(FetchStatus.Error));
    }
  },

  retryListings() {
    void pageActions.loadListings(store.getState().page.appliedFilters);
  },

  // ── 详情 ──

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

  // ── 确认弹窗 ──

  openConfirm(request: ConfirmRequest) {
    store.dispatch(setConfirmRequest(request));
  },

  closeConfirm() {
    store.dispatch(setConfirmRequest(null));
  },

  // ── 收藏 ──

  async commitFavorite(listingId: string) {
    const { favoriteIds } = store.getState().page;
    const isFavorited = favoriteIds.includes(listingId);

    store.dispatch(startFavoriting(listingId));
    try {
      await toggleFavoriteService(listingId);
      store.dispatch(
        isFavorited ? removeFavoriteId(listingId) : addFavoriteId(listingId),
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

  // ── 询价 ──

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
