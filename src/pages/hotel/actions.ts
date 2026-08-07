import { message } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import {
  batchFavoriteHotels,
  fetchHotelPage,
  submitBooking as submitBookingService,
  toggleHotelFavorite,
} from "./data/services";
import type { BookingForm } from "./shared/booking";
import {
  parseSearchParams,
  writeParamsToUrl,
  type SearchParams,
} from "./shared/params";
import { usePageStore } from "./store";

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

const isCurrentGeneration = (generation: number) =>
  generation === resultSetGeneration;

async function loadHotels(searchParams: SearchParams) {
  const { setAppliedParams, resetResultSet, setHotelsStatus, setFirstPage } =
    usePageStore.getState();

  const generation = (resultSetGeneration += 1);

  setAppliedParams(searchParams);
  writeParamsToUrl(searchParams);
  resetResultSet();
  setHotelsStatus(FetchStatus.Loading);

  try {
    const page = await fetchHotelPage(searchParams, 1);
    if (!isCurrentGeneration(generation)) {
      return;
    }
    setFirstPage(page);
    setHotelsStatus(FetchStatus.Ready);
  } catch {
    if (!isCurrentGeneration(generation)) {
      return;
    }
    setHotelsStatus(FetchStatus.Error);
  }
}

const favoritingIds = new Set<string>();

export const pageActions = {
  // ── 列表 ──

  async initPage() {
    await waitForHydration();

    const initialParams =
      parseSearchParams(window.location.search) ??
      usePageStore.getState().appliedParams;

    await loadHotels(initialParams);
  },

  applySearchParams(patch: Partial<SearchParams>) {
    const { appliedParams } = usePageStore.getState();

    void loadHotels({ ...appliedParams, ...patch });
  },

  async loadMoreHotels() {
    const {
      hasMore,
      loadMoreStatus,
      hotelsStatus,
      loadedPage,
      appliedParams,
      setLoadMoreStatus,
      appendPage,
    } = usePageStore.getState();

    if (
      !hasMore ||
      loadMoreStatus === FetchStatus.Loading ||
      hotelsStatus === FetchStatus.Loading
    ) {
      return;
    }

    const generation = resultSetGeneration;

    setLoadMoreStatus(FetchStatus.Loading);
    try {
      const page = await fetchHotelPage(appliedParams, loadedPage + 1);
      if (!isCurrentGeneration(generation)) {
        return;
      }
      appendPage(page);
      setLoadMoreStatus(FetchStatus.Ready);
    } catch {
      if (!isCurrentGeneration(generation)) {
        return;
      }
      setLoadMoreStatus(FetchStatus.Error);
    }
  },

  retryHotels() {
    void loadHotels(usePageStore.getState().appliedParams);
  },

  // ── 选中 ──

  selectHotel(hotelId: string) {
    usePageStore.getState().setSelectedHotelId(hotelId);
  },

  // ── 多选 ──

  toggleSelect(hotelId: string) {
    const { selectedHotelIds, setSelectedHotelIds } = usePageStore.getState();

    setSelectedHotelIds(
      selectedHotelIds.includes(hotelId)
        ? selectedHotelIds.filter((id) => id !== hotelId)
        : [...selectedHotelIds, hotelId],
    );
  },

  selectAllLoaded() {
    const { hotels, setSelectedHotelIds } = usePageStore.getState();

    setSelectedHotelIds(hotels.map((hotel) => hotel.id));
  },

  clearSelection() {
    usePageStore.getState().setSelectedHotelIds([]);
  },

  // ── 收藏 ──

  async toggleFavorite(hotelId: string) {
    if (favoritingIds.has(hotelId)) {
      return;
    }

    const { favoriteIds, setFavoriteIds } = usePageStore.getState();

    const snapshot = favoriteIds;
    const nextIds = favoriteIds.includes(hotelId)
      ? favoriteIds.filter((id) => id !== hotelId)
      : [...favoriteIds, hotelId];

    favoritingIds.add(hotelId);
    setFavoriteIds(nextIds);
    try {
      await toggleHotelFavorite(hotelId);
    } catch (err) {
      setFavoriteIds(snapshot);
      message.error(err instanceof Error ? err.message : String(err));
    } finally {
      favoritingIds.delete(hotelId);
    }
  },

  async batchFavorite() {
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
      const { succeededIds, failures } =
        await batchFavoriteHotels(selectedHotelIds);
      const { favoriteIds } = usePageStore.getState();

      setFavoriteIds([...new Set([...favoriteIds, ...succeededIds])]);

      if (!isCurrentGeneration(generation)) {
        return;
      }
      setBatchFavoriteFailures(failures);
      setSelectedHotelIds(failures.map((failure) => failure.hotelId));
    } catch (err) {
      if (!isCurrentGeneration(generation)) {
        return;
      }

      const reason = err instanceof Error ? err.message : String(err);

      setBatchFavoriteFailures(
        selectedHotelIds.map((hotelId) => ({ hotelId, reason })),
      );
    } finally {
      setIsBatchFavoriting(false);
    }
  },

  dismissBatchFavoriteFailures() {
    usePageStore.getState().setBatchFavoriteFailures([]);
  },

  // ── 预订 ──

  async submitBooking(values: BookingForm) {
    const {
      selectedHotelId,
      setIsSubmittingBooking,
      setBookedHotelId,
      setContact,
    } = usePageStore.getState();

    if (!selectedHotelId) {
      throw new Error("请先在列表里选择一家酒店");
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
