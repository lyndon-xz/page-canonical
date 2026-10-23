import { message } from 'antd';

import { FetchStatus } from '@/constants/fetch-status';
import { toErrorMessage } from '@/utils/error';

import {
  cancelInquiry as cancelInquiryService,
  fetchListingDetail,
  fetchListings,
  submitInquiry as submitInquiryService,
  toggleFavorite as toggleFavoriteService,
} from './data/services';
import { ConfirmScene, type ConfirmRequest } from './shared/confirm';
import type { ListingFilters } from './shared/filters';
import type { InquiryForm } from './shared/inquiry';
import { reportTrace } from './shared/trace';
import {
  addFavoriteId,
  finishFavoriting,
  removeFavoriteId,
  resetResultSet,
  setAppliedFilters,
  setConfirmRequest,
  setDetail,
  setDetailStatus,
  setIsDetailDrawerOpen,
  setIsSubmittingInquiry,
  setListings,
  setListingsStatus,
  setSelectedListingId,
  setSubmittedInquiry,
  startFavoriting,
} from './slice';
import { selectTraceCommonTag, store } from './store';

let resultSetGeneration = 0;

const isStaleGeneration = (generation: number) => generation !== resultSetGeneration;

let latestDetailRequestId = 0;

async function loadListingDetail(listingId: string) {
  const requestId = (latestDetailRequestId += 1);

  const isStale = () =>
    requestId !== latestDetailRequestId || store.getState().page.selectedListingId !== listingId;

  store.dispatch(setDetail(null));
  store.dispatch(setDetailStatus(FetchStatus.Loading));
  try {
    const detail = await fetchListingDetail(listingId);
    if (isStale()) {
      return;
    }
    store.dispatch(setDetail(detail));
    store.dispatch(setDetailStatus(FetchStatus.Ready));
  } catch {
    if (isStale()) {
      return;
    }
    store.dispatch(setDetail(null));
    store.dispatch(setDetailStatus(FetchStatus.Error));
  }
}

async function addFavorite(listingId: string) {
  try {
    await pageActions.commitFavorite(listingId);
  } catch (err) {
    message.error(toErrorMessage(err));
  }
}

export const pageActions = {
  trackClick: (event: string, extra: Record<string, string> = {}) => {
    reportTrace(event, {
      ...selectTraceCommonTag(store.getState()),
      ...extra,
    });
  },

  loadListings: async (filters: ListingFilters) => {
    const generation = (resultSetGeneration += 1);

    store.dispatch(setAppliedFilters(filters));
    store.dispatch(setListingsStatus(FetchStatus.Loading));
    store.dispatch(resetResultSet());

    try {
      const listings = await fetchListings(filters);
      if (isStaleGeneration(generation)) {
        return;
      }
      store.dispatch(setListings(listings));
      store.dispatch(setListingsStatus(FetchStatus.Ready));
    } catch {
      if (isStaleGeneration(generation)) {
        return;
      }
      store.dispatch(setListingsStatus(FetchStatus.Error));
    }
  },

  retryListings: () => {
    void pageActions.loadListings(store.getState().page.appliedFilters);
  },

  selectListing: (listingId: string) => {
    store.dispatch(setSelectedListingId(listingId));
    void loadListingDetail(listingId);
  },

  openDetailDrawer: () => {
    store.dispatch(setIsDetailDrawerOpen(true));
  },

  closeDetailDrawer: () => {
    store.dispatch(setIsDetailDrawerOpen(false));
  },

  retryDetail: () => {
    const { selectedListingId } = store.getState().page;

    if (!selectedListingId) {
      return;
    }
    void loadListingDetail(selectedListingId);
  },

  openConfirm: (request: ConfirmRequest) => {
    store.dispatch(setConfirmRequest(request));
  },

  closeConfirm: () => {
    store.dispatch(setConfirmRequest(null));
  },

  commitFavorite: async (listingId: string) => {
    const { favoriteIds } = store.getState().page;
    const isFavorited = favoriteIds.includes(listingId);

    store.dispatch(startFavoriting(listingId));
    try {
      await toggleFavoriteService(listingId);
      store.dispatch(isFavorited ? removeFavoriteId(listingId) : addFavoriteId(listingId));
    } finally {
      store.dispatch(finishFavoriting(listingId));
    }
  },

  toggleFavorite: (listingId: string) => {
    const { favoriteIds, favoritingIds } = store.getState().page;

    if (favoritingIds.includes(listingId)) {
      return;
    }

    const willFavorite = !favoriteIds.includes(listingId);

    pageActions.trackClick('listing_favorite_toggle', {
      listingId,
      willFavorite: String(willFavorite),
    });

    if (willFavorite) {
      void addFavorite(listingId);
      return;
    }

    pageActions.openConfirm({
      scene: ConfirmScene.RemoveFavorite,
      listingId,
    });
  },

  submitInquiry: async (values: InquiryForm) => {
    const { selectedListingId } = store.getState().page;

    if (!selectedListingId) {
      throw new Error('请先选择要询价的房源');
    }

    store.dispatch(setIsSubmittingInquiry(true));
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

  cancelInquiry: async () => {
    const { submittedInquiry } = store.getState().page;

    if (!submittedInquiry) {
      return;
    }

    await cancelInquiryService(submittedInquiry.inquiryId);
    store.dispatch(setSubmittedInquiry(null));
  },
};
