import { message } from 'antd';

import { FetchStatus } from '@/constants/fetch-status';
import { toErrorMessage } from '@/utils/error';

import {
  batchFavoriteHotels,
  fetchHotelPage,
  submitBooking as submitBookingService,
  toggleHotelFavorite,
} from './data/services';
import type { BookingForm } from './shared/booking';
import { parseSearchParams, writeParamsToUrl, type SearchParams } from './shared/params';
import { usePageStore } from './store';

async function waitForHydration() {
  if (usePageStore.persist.hasHydrated()) {
    return;
  }

  await new Promise<void>((resolve) => {
    const unsubscribe = usePageStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

let resultSetGeneration = 0;

const isStaleGeneration = (generation: number) => generation !== resultSetGeneration;

async function loadHotels(searchParams: SearchParams) {
  const { setAppliedParams, resetResultSet, setHotelsStatus, setFirstPage } =
    usePageStore.getState();

  const generation = (resultSetGeneration += 1);

  setAppliedParams(searchParams);
  writeParamsToUrl(searchParams);
  resetResultSet();
  setHotelsStatus(FetchStatus.Loading);

  try {
    const hotelPage = await fetchHotelPage(searchParams, 1);
    if (isStaleGeneration(generation)) {
      return;
    }
    setFirstPage(hotelPage);
    setHotelsStatus(FetchStatus.Ready);
  } catch {
    if (isStaleGeneration(generation)) {
      return;
    }
    setHotelsStatus(FetchStatus.Error);
  }
}

const favoritingIds = new Set<string>();

function canLoadMoreHotels() {
  const { hasMore, loadMoreStatus, hotelsStatus } = usePageStore.getState();

  return hasMore && loadMoreStatus !== FetchStatus.Loading && hotelsStatus !== FetchStatus.Loading;
}

async function loadNextHotelPage() {
  const { loadedPage, appliedParams, setLoadMoreStatus, appendPage } = usePageStore.getState();
  const generation = resultSetGeneration;

  setLoadMoreStatus(FetchStatus.Loading);
  try {
    const hotelPage = await fetchHotelPage(appliedParams, loadedPage + 1);
    if (isStaleGeneration(generation)) {
      return;
    }
    appendPage(hotelPage);
    setLoadMoreStatus(FetchStatus.Ready);
  } catch {
    if (isStaleGeneration(generation)) {
      return;
    }
    setLoadMoreStatus(FetchStatus.Error);
  }
}

export const pageActions = {
  initPage: async () => {
    await waitForHydration();

    const initialParams =
      parseSearchParams(window.location.search) ?? usePageStore.getState().appliedParams;

    await loadHotels(initialParams);
  },

  applySearchParams: (patch: Partial<SearchParams>) => {
    const { appliedParams } = usePageStore.getState();

    void loadHotels({ ...appliedParams, ...patch });
  },

  loadMoreHotels: async () => {
    if (!canLoadMoreHotels()) {
      return;
    }

    await loadNextHotelPage();
  },

  retryHotels: () => {
    void loadHotels(usePageStore.getState().appliedParams);
  },

  selectHotel: (hotelId: string) => {
    usePageStore.getState().setSelectedHotelId(hotelId);
  },

  toggleSelect: (hotelId: string) => {
    const { selectedHotelIds, setSelectedHotelIds } = usePageStore.getState();

    setSelectedHotelIds(
      selectedHotelIds.includes(hotelId)
        ? selectedHotelIds.filter((id) => id !== hotelId)
        : [...selectedHotelIds, hotelId],
    );
  },

  selectAllLoaded: () => {
    const { hotels, setSelectedHotelIds } = usePageStore.getState();

    setSelectedHotelIds(hotels.map((hotel) => hotel.id));
  },

  clearSelection: () => {
    usePageStore.getState().setSelectedHotelIds([]);
  },

  toggleFavorite: async (hotelId: string) => {
    if (favoritingIds.has(hotelId)) {
      return;
    }

    const { favoriteIds, setFavoriteIds } = usePageStore.getState();
    const isAlreadyFavorited = favoriteIds.includes(hotelId);

    favoritingIds.add(hotelId);
    setFavoriteIds(
      isAlreadyFavorited ? favoriteIds.filter((id) => id !== hotelId) : [...favoriteIds, hotelId],
    );
    try {
      await toggleHotelFavorite(hotelId);
    } catch (err) {
      // 回滚只反转本次这一项：别的酒店可以同时在飞，整份快照会把它们的结果一起擦掉
      const { favoriteIds: latestIds } = usePageStore.getState();

      setFavoriteIds(
        isAlreadyFavorited
          ? [...new Set([...latestIds, hotelId])]
          : latestIds.filter((id) => id !== hotelId),
      );
      message.error(toErrorMessage(err));
    } finally {
      favoritingIds.delete(hotelId);
    }
  },

  batchFavorite: async () => {
    const {
      selectedHotelIds,
      isBatchFavoriting,
      setFavoriteIds,
      setSelectedHotelIds,
      setIsBatchFavoriting,
      setBatchFavoriteFailures,
    } = usePageStore.getState();

    if (selectedHotelIds.length === 0 || isBatchFavoriting) {
      return;
    }

    const generation = resultSetGeneration;

    setIsBatchFavoriting(true);
    setBatchFavoriteFailures([]);
    try {
      const { succeededIds, failures } = await batchFavoriteHotels(selectedHotelIds);
      const { favoriteIds } = usePageStore.getState();

      setFavoriteIds([...new Set([...favoriteIds, ...succeededIds])]);

      if (isStaleGeneration(generation)) {
        return;
      }
      setBatchFavoriteFailures(failures);
      setSelectedHotelIds(failures.map((failure) => failure.hotelId));
    } catch (err) {
      if (isStaleGeneration(generation)) {
        return;
      }

      const reason = toErrorMessage(err);

      setBatchFavoriteFailures(selectedHotelIds.map((hotelId) => ({ hotelId, reason })));
    } finally {
      setIsBatchFavoriting(false);
    }
  },

  dismissBatchFavoriteFailures: () => {
    usePageStore.getState().setBatchFavoriteFailures([]);
  },

  submitBooking: async (values: BookingForm) => {
    const { selectedHotelId, setIsSubmittingBooking, setBookedHotelId, setContact } =
      usePageStore.getState();

    if (!selectedHotelId) {
      throw new Error('请先在列表里选择一家酒店');
    }

    setIsSubmittingBooking(true);
    setBookedHotelId(null);
    try {
      await submitBookingService(selectedHotelId, values);
      setBookedHotelId(selectedHotelId);

      const { guestName, phone } = values;

      setContact({ guestName, phone });
    } finally {
      setIsSubmittingBooking(false);
    }
  },
};
