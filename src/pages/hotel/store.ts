import { create } from "zustand";

import type { Hotel, SearchParams } from "./shared/types";

const DEFAULT_PARAMS: SearchParams = { keyword: "", star: 0 };

interface PageStore {
  hotelList: Hotel[];
  isLoadingHotelList: boolean;
  hotelListError: Error | null;
  selectedHotelId: string | null;
  appliedParams: SearchParams;

  setHotelList: (list: Hotel[]) => void;
  setIsLoadingHotelList: (loading: boolean) => void;
  setHotelListError: (error: Error | null) => void;
  setSelectedHotelId: (id: string | null) => void;
  setAppliedParams: (searchParams: SearchParams) => void;
}

export const usePageStore = create<PageStore>((set) => ({
  hotelList: [],
  isLoadingHotelList: false,
  hotelListError: null,
  selectedHotelId: null,
  appliedParams: DEFAULT_PARAMS,

  setHotelList: (list) => set({ hotelList: list }),
  setIsLoadingHotelList: (loading) => set({ isLoadingHotelList: loading }),
  setHotelListError: (error) => set({ hotelListError: error }),
  setSelectedHotelId: (id) => set({ selectedHotelId: id }),
  setAppliedParams: (searchParams) => set({ appliedParams: searchParams }),
}));
