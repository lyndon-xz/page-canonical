import { createSelector } from "@reduxjs/toolkit";
import { shallowEqual } from "react-redux";

import { selectListings, useAppSelector, type RootState } from "../../store";

/** 详情接口只返回描述类字段，标题价格仍取列表项，避免两处各存一份房源基本信息 */
const selectDetailListing = createSelector(
  selectListings,
  (state: RootState) => state.page.selectedListingId,
  (listings, selectedListingId) =>
    listings.find((listing) => listing.id === selectedListingId) ?? null,
);

export function useListingDetailModel() {
  return useAppSelector((s) => {
    const {
      selectedListingId,
      listingDetail,
      detailStatus,
      isDetailDrawerOpen,
      favoriteIds,
      favoritingIds,
    } = s.page;

    return {
      isVisible: !!selectedListingId,
      listing: selectDetailListing(s),
      detail: listingDetail,
      detailStatus,
      isDrawerOpen: isDetailDrawerOpen,
      isFavorite:
        !!selectedListingId && favoriteIds.includes(selectedListingId),
      isFavoriting:
        !!selectedListingId && favoritingIds.includes(selectedListingId),
    };
  }, shallowEqual);
}
