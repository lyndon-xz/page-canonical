import { useMemo } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type { Hotel, SortBy } from "../../shared/types";
import { usePageStore } from "../../store";

const comparators: Record<SortBy, (a: Hotel, b: Hotel) => number> = {
  price: (a, b) => a.pricePerNight - b.pricePerNight,
  rating: (a, b) => b.rating - a.rating,
  distance: (a, b) => a.distanceKm - b.distanceKm,
};

interface HotelListLocalState {
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
}

export const useHotelListLocal = create<HotelListLocalState>((set) => ({
  sortBy: "price",
  setSortBy: (sortBy) => set({ sortBy }),
}));

export function useHotelListModel() {
  const sortBy = useHotelListLocal((s) => s.sortBy);

  const { hotelList, isLoading, selectedHotelId } = usePageStore(
    useShallow((s) => ({
      hotelList: s.hotelList,
      isLoading: s.isLoadingHotelList,
      selectedHotelId: s.selectedHotelId,
    })),
  );

  const sortedList = useMemo(
    () => [...hotelList].sort(comparators[sortBy]),
    [hotelList, sortBy],
  );

  return { sortedList, isLoading, selectedHotelId, sortBy };
}
