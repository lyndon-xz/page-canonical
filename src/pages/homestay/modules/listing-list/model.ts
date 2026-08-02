import { createSelector } from "@reduxjs/toolkit";

import {
  selectListings,
  selectListingsCount,
  selectPageState,
  useAppSelector,
  type RootState,
} from "../../store";

const selectListingListModel = createSelector(
  selectPageState,
  selectListings,
  selectListingsCount,
  (state: RootState) => state.listingList,
  (page, listings, listingsCount, local) => {
    const { isLoadingListings, selectedListingId, favoriteIds, favoriteError } =
      page;

    return {
      listings,
      listingsCount,
      isLoadingListings,
      selectedListingId,
      favoriteIds,
      favoriteError,
      hoveredId: local.hoveredId,
    };
  },
);

export function useListingListModel() {
  return useAppSelector(selectListingListModel);
}
