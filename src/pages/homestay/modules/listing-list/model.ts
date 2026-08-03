import { createSelector } from "@reduxjs/toolkit";

import { selectListings, selectPageState, useAppSelector } from "../../store";

const selectListingListModel = createSelector(
  selectPageState,
  selectListings,
  (page, listings) => {
    const { listingsStatus, selectedListingId, favoriteIds } = page;

    return {
      listings,
      listingsCount: listings.length,
      listingsStatus,
      selectedListingId,
      favoriteIds,
    };
  },
);

export function useListingListModel() {
  return useAppSelector(selectListingListModel);
}
