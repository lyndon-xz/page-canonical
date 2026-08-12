import { create } from "zustand";
import { persist } from "zustand/middleware";

import { FetchStatus } from "@/lib/fetch-status";

import type { BookingContact } from "./shared/booking";
import type { BatchFavoriteFailure } from "./shared/favorite";
import type { Hotel, HotelPageResult } from "./shared/hotel";
import {
  DEFAULT_SEARCH_PARAMS,
  isSortBy,
  isStar,
  type SearchParams,
} from "./shared/params";

const DEFAULT_CONTACT: BookingContact = {
  guestName: "",
  phone: "",
};

interface PersistedPageState {
  appliedParams: SearchParams;
  favoriteIds: string[];
  contact: BookingContact;
}

const {
  keyword: defaultKeyword,
  star: defaultStar,
  sortBy: defaultSortBy,
} = DEFAULT_SEARCH_PARAMS;

/** storage 里的值不可信：逐字段收窄，任一不合法就回落到默认值 */
const readPersistedSearchParams = (value: unknown): SearchParams => {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_SEARCH_PARAMS;
  }

  const keyword =
    "keyword" in value && typeof value.keyword === "string"
      ? value.keyword
      : defaultKeyword;
  const star =
    "star" in value && typeof value.star === "number" && isStar(value.star)
      ? value.star
      : defaultStar;
  const sortBy =
    "sortBy" in value &&
    typeof value.sortBy === "string" &&
    isSortBy(value.sortBy)
      ? value.sortBy
      : defaultSortBy;

  return {
    keyword,
    star,
    sortBy,
  };
};

const { guestName: defaultGuestName, phone: defaultPhone } = DEFAULT_CONTACT;

const readPersistedContact = (value: unknown): BookingContact => {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_CONTACT;
  }

  const guestName =
    "guestName" in value && typeof value.guestName === "string"
      ? value.guestName
      : defaultGuestName;
  const phone =
    "phone" in value && typeof value.phone === "string"
      ? value.phone
      : defaultPhone;

  return {
    guestName,
    phone,
  };
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

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

  setFirstPage: (page: HotelPageResult) => void;
  appendPage: (page: HotelPageResult) => void;

  setHotelsStatus: (status: FetchStatus) => void;
  setSelectedHotelId: (id: string | null) => void;
  setAppliedParams: (searchParams: SearchParams) => void;
  setLoadMoreStatus: (status: FetchStatus) => void;
  setFavoriteIds: (ids: string[]) => void;
  setSelectedHotelIds: (ids: string[]) => void;
  setIsBatchFavoriting: (isBatchFavoriting: boolean) => void;
  setBatchFavoriteFailures: (failures: BatchFavoriteFailure[]) => void;
  setContact: (contact: BookingContact) => void;
  setIsSubmittingBooking: (isSubmittingBooking: boolean) => void;
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
      setIsBatchFavoriting: (isBatchFavoriting) => set({ isBatchFavoriting }),
      setBatchFavoriteFailures: (failures) =>
        set({ batchFavoriteFailures: failures }),
      setContact: (contact) => set({ contact }),
      setIsSubmittingBooking: (isSubmittingBooking) =>
        set({ isSubmittingBooking }),
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
      version: 1,
      partialize: (state) => {
        const { appliedParams, favoriteIds, contact } = state;

        return { appliedParams, favoriteIds, contact };
      },
      merge: (persisted, current) => {
        if (typeof persisted !== "object" || persisted === null) {
          return current;
        }

        const savedParams =
          "appliedParams" in persisted ? persisted.appliedParams : undefined;
        const savedFavoriteIds =
          "favoriteIds" in persisted ? persisted.favoriteIds : undefined;
        const savedContact =
          "contact" in persisted ? persisted.contact : undefined;

        return {
          ...current,
          appliedParams: readPersistedSearchParams(savedParams),
          favoriteIds: isStringArray(savedFavoriteIds)
            ? savedFavoriteIds
            : current.favoriteIds,
          contact: readPersistedContact(savedContact),
        };
      },
      // 落盘形状变更时提升 version；旧数据不做兼容，直接回落默认值
      migrate: (): PersistedPageState => ({
        appliedParams: DEFAULT_SEARCH_PARAMS,
        favoriteIds: [],
        contact: DEFAULT_CONTACT,
      }),
    },
  ),
);
