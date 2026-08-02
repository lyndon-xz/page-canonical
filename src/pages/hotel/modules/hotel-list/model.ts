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

  const {
    hotels,
    isLoading,
    error,
    selectedHotelId,
    hasMore,
    isLoadingMore,
    loadMoreError,
    favoriteIds,
    favoriteError,
    selectedHotelIds,
    isBatchFavoriting,
    batchFavoriteFailures,
  } = usePageStore(
    useShallow((s) => ({
      hotels: s.hotels,
      isLoading: s.isLoadingHotels,
      error: s.hotelsError,
      selectedHotelId: s.selectedHotelId,
      hasMore: s.hasMore,
      isLoadingMore: s.isLoadingMore,
      loadMoreError: s.loadMoreError,
      favoriteIds: s.favoriteIds,
      favoriteError: s.favoriteError,
      selectedHotelIds: s.selectedHotelIds,
      isBatchFavoriting: s.isBatchFavoriting,
      batchFavoriteFailures: s.batchFavoriteFailures,
    })),
  );

  // 只对已加载的部分排序：分页下的排序本应由服务端做，
  // 这里仅演示前端排序，故明确它作用于已加载数据
  const sortedHotels = useMemo(
    () => [...hotels].sort(comparators[sortBy]),
    [hotels, sortBy],
  );

  // 失败提示要点名酒店，故在此把 id 换成名字；store 只存 id，不存会过期的名字快照
  const batchFailureNames = useMemo(
    () =>
      batchFavoriteFailures.map((failure) => {
        const hotel = hotels.find((item) => item.id === failure.hotelId);

        return `${hotel?.name ?? failure.hotelId}（${failure.reason}）`;
      }),
    [batchFavoriteFailures, hotels],
  );

  return {
    sortedHotels,
    isLoading,
    error,
    selectedHotelId,
    sortBy,
    hasMore,
    isLoadingMore,
    loadMoreError,
    favoriteIds,
    favoriteError,
    selectedHotelIds,
    isBatchFavoriting,
    batchFailureNames,
    /** 已加载的都勾上了才算全选；空列表不算 */
    isAllLoadedSelected:
      hotels.length > 0 && selectedHotelIds.length === hotels.length,
  };
}
