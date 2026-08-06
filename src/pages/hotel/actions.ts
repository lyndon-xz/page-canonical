import { message } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import {
  batchFavoriteHotels,
  fetchHotelPage,
  submitBooking as submitBookingService,
  toggleHotelFavorite,
} from "./data/services";
import { getLive } from "./live";
import type { BookingForm } from "./shared/booking";
import {
  parseSearchParams,
  serializeParams,
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

function resolveInitialParams(): SearchParams {
  if (window.location.search) {
    return parseSearchParams(window.location.search);
  }

  return usePageStore.getState().appliedParams;
}

let resultSetGeneration = 0;

const isCurrentGeneration = (generation: number) =>
  generation === resultSetGeneration;

async function loadHotels(searchParams: SearchParams) {
  const { setAppliedParams, resetResultSet, setHotelsStatus, setFirstPage } =
    usePageStore.getState();

  const generation = (resultSetGeneration += 1);

  setAppliedParams(searchParams);
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

export const pageActions = {
  // ── 列表 ──

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

  async initPage() {
    await waitForHydration();
    await loadHotels(resolveInitialParams());
  },

  applySearchParams(patch: Partial<SearchParams>) {
    const searchParams = { ...usePageStore.getState().appliedParams, ...patch };

    void loadHotels(searchParams);

    getLive("hotelListRef")?.current?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });

    const query = new URLSearchParams(serializeParams(searchParams)).toString();
    history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
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
    const { favoriteIds, setFavoriteIds } = usePageStore.getState();

    const snapshot = favoriteIds;
    const nextIds = favoriteIds.includes(hotelId)
      ? favoriteIds.filter((id) => id !== hotelId)
      : [...favoriteIds, hotelId];

    setFavoriteIds(nextIds);
    try {
      await toggleHotelFavorite(hotelId);
    } catch (err) {
      setFavoriteIds(snapshot);
      message.error(err instanceof Error ? err.message : String(err));
    }
  },

  async batchFavorite() {
    const {
      selectedHotelIds,
      favoriteIds,
      isBatchFavoriting,
      setFavoriteIds,
      setSelectedHotelIds,
      setIsBatchFavoriting,
      setBatchFavoriteFailures,
    } = usePageStore.getState();

    if (selectedHotelIds.length === 0 || isBatchFavoriting) {
      return;
    }

    setIsBatchFavoriting(true);
    setBatchFavoriteFailures([]);
    try {
      const { succeededIds, failures } =
        await batchFavoriteHotels(selectedHotelIds);

      setFavoriteIds([...new Set([...favoriteIds, ...succeededIds])]);
      setBatchFavoriteFailures(failures);
      setSelectedHotelIds(failures.map((failure) => failure.hotelId));
    } catch (err) {
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
