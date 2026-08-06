import { create } from "zustand";
import { persist } from "zustand/middleware";

import { FetchStatus } from "@/lib/fetch-status";

import type { BookingContact } from "./shared/booking";
import type { BatchFavoriteFailure } from "./shared/favorite";
import type { Hotel, HotelPage } from "./shared/hotel";
import { DEFAULT_SEARCH_PARAMS, type SearchParams } from "./shared/params";

const DEFAULT_CONTACT: BookingContact = {
  guestName: "",
  phone: "",
};

interface PersistedPageState {
  appliedParams: SearchParams;
  favoriteIds: string[];
  contact: BookingContact;
}

interface PageStore {
  hotels: Hotel[];
  hotelsTotal: number;
  hotelsStatus: FetchStatus;
  selectedHotelId: string | null;
  appliedParams: SearchParams;

  loadedPage: number;
  hasMore: boolean;
  loadMoreStatus: FetchStatus;

  favoriteIds: string[];

  selectedHotelIds: string[];
  isBatchFavoriting: boolean;
  batchFavoriteFailures: BatchFavoriteFailure[];

  contact: BookingContact;
  isSubmittingBooking: boolean;
  bookedHotelId: string | null;

  setFirstPage: (page: HotelPage) => void;
  appendPage: (page: HotelPage) => void;

  setHotelsStatus: (status: FetchStatus) => void;
  setSelectedHotelId: (id: string | null) => void;
  setAppliedParams: (searchParams: SearchParams) => void;
  setLoadMoreStatus: (status: FetchStatus) => void;
  setFavoriteIds: (ids: string[]) => void;
  setSelectedHotelIds: (ids: string[]) => void;
  setIsBatchFavoriting: (batchFavoriting: boolean) => void;
  setBatchFavoriteFailures: (failures: BatchFavoriteFailure[]) => void;
  setContact: (contact: BookingContact) => void;
  setIsSubmittingBooking: (submitting: boolean) => void;
  setBookedHotelId: (hotelId: string | null) => void;

  resetResultSet: () => void;
}

export const usePageStore = create<PageStore>()(
  persist<PageStore, [], [], PersistedPageState>(
    (set) => ({
      hotels: [],
      hotelsTotal: 0,
      hotelsStatus: FetchStatus.Loading,
      selectedHotelId: null,
      appliedParams: DEFAULT_SEARCH_PARAMS,

      loadedPage: 0,
      hasMore: false,
      loadMoreStatus: FetchStatus.Ready,

      favoriteIds: [],

      selectedHotelIds: [],
      isBatchFavoriting: false,
      batchFavoriteFailures: [],

      contact: DEFAULT_CONTACT,
      isSubmittingBooking: false,
      bookedHotelId: null,

      setFirstPage: (page) => {
        const { items, total, hasMore } = page;

        set({
          hotels: items,
          hotelsTotal: total,
          hasMore,
          loadedPage: 1,
        });
      },
      appendPage: (page) =>
        set((state) => {
          const { items, total, hasMore } = page;
          const { hotels, loadedPage } = state;

          return {
            hotels: [...hotels, ...items],
            hotelsTotal: total,
            hasMore,
            loadedPage: loadedPage + 1,
          };
        }),

      setHotelsStatus: (status) => set({ hotelsStatus: status }),
      setSelectedHotelId: (id) => set({ selectedHotelId: id }),
      setAppliedParams: (searchParams) => set({ appliedParams: searchParams }),
      setLoadMoreStatus: (status) => set({ loadMoreStatus: status }),
      setFavoriteIds: (ids) => set({ favoriteIds: ids }),
      setSelectedHotelIds: (ids) => set({ selectedHotelIds: ids }),
      setIsBatchFavoriting: (batchFavoriting) =>
        set({ isBatchFavoriting: batchFavoriting }),
      setBatchFavoriteFailures: (failures) =>
        set({ batchFavoriteFailures: failures }),
      setContact: (contact) => set({ contact }),
      setIsSubmittingBooking: (submitting) =>
        set({ isSubmittingBooking: submitting }),
      setBookedHotelId: (hotelId) => set({ bookedHotelId: hotelId }),

      resetResultSet: () =>
        set({
          hotels: [],
          hotelsTotal: 0,
          loadedPage: 0,
          hasMore: false,
          loadMoreStatus: FetchStatus.Ready,
          selectedHotelId: null,
          selectedHotelIds: [],
          batchFavoriteFailures: [],
          bookedHotelId: null,
        }),
    }),
    {
      name: "hotel-page",
      partialize: (state) => {
        const { appliedParams, favoriteIds, contact } = state;

        return { appliedParams, favoriteIds, contact };
      },
      merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedPageState> | undefined;

        return {
          ...current,
          ...saved,
          appliedParams: { ...DEFAULT_SEARCH_PARAMS, ...saved?.appliedParams },
          contact: { ...DEFAULT_CONTACT, ...saved?.contact },
        };
      },
    },
  ),
);
