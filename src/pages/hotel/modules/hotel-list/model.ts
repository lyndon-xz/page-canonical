import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { FetchStatus } from "@/lib/fetch-status";

import { usePageStore } from "../../store";

export function useHotelListModel() {
  const state = usePageStore(
    useShallow((s) => ({
      hotels: s.hotels,
      hotelsStatus: s.hotelsStatus,
      selectedHotelId: s.selectedHotelId,
      sortBy: s.appliedParams.sortBy,
      hasMore: s.hasMore,
      loadMoreStatus: s.loadMoreStatus,
      favoriteIds: s.favoriteIds,
      selectedHotelIds: s.selectedHotelIds,
      isBatchFavoriting: s.isBatchFavoriting,
      batchFavoriteFailures: s.batchFavoriteFailures,
    })),
  );
  const { batchFavoriteFailures, ...rest } = state;
  const { hotels, hotelsStatus, hasMore, loadMoreStatus, selectedHotelIds } =
    rest;

  const batchFailureNames = useMemo(
    () =>
      batchFavoriteFailures.map((failure) => {
        const { hotelId, reason } = failure;
        const hotel = hotels.find((item) => item.id === hotelId);

        return `${hotel?.name ?? hotelId}（${reason}）`;
      }),
    [batchFavoriteFailures, hotels],
  );

  return {
    ...rest,
    batchFailureNames,
    isAllLoadedSelected:
      hotels.length > 0 && selectedHotelIds.length === hotels.length,
    showSentinel:
      hotelsStatus === FetchStatus.Ready &&
      loadMoreStatus === FetchStatus.Ready &&
      hotels.length > 0 &&
      hasMore,
  };
}
