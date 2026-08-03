import { createSelector } from "@reduxjs/toolkit";

import {
  selectListings,
  selectListingsCount,
  selectPageState,
  useAppSelector,
} from "../../store";

/*
 * 本模块没有私有状态：卡片的 hover 反馈由 CSS :hover 承担，不进状态层。
 */
const selectListingListModel = createSelector(
  selectPageState,
  selectListings,
  selectListingsCount,
  (page, listings, listingsCount) => {
    const { isLoadingListings, selectedListingId, favoriteIds, favoriteError } =
      page;

    return {
      listings,
      listingsCount,
      isLoadingListings,
      selectedListingId,
      favoriteIds,
      favoriteError,
    };
  },
);

export function useListingListModel() {
  return useAppSelector(selectListingListModel);
}
