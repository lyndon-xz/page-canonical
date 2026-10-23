import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { FetchStatus } from '@/constants/fetch-status';

import { usePageStore } from '../../store';

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
  const { hotels, ...rest } = state;
  const { batchFavoriteFailures } = rest;

  const batchFailureNames = useMemo(
    () =>
      batchFavoriteFailures.map((failure) => {
        const { hotelId, reason } = failure;
        const hotel = hotels.find((item) => item.id === hotelId);

        return `${hotel?.name ?? hotelId}（${reason}）`;
      }),
    [batchFavoriteFailures, hotels],
  );

  const { hotelsStatus, loadMoreStatus, selectedHotelIds, hasMore } = rest;
  const hotelsLength = hotels.length;
  const selectedCount = selectedHotelIds.length;
  const isAllLoadedSelected = hotelsLength > 0 && selectedCount === hotelsLength;

  return {
    hotels,
    ...rest,
    batchFailureNames,
    isAllLoadedSelected,
    isPartiallySelected: selectedCount > 0 && !isAllLoadedSelected,
    shouldShowSentinel:
      hotelsStatus === FetchStatus.Ready &&
      loadMoreStatus === FetchStatus.Ready &&
      hotelsLength > 0 &&
      hasMore,
  };
}
