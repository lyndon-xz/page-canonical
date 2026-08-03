import { createSelector } from "@reduxjs/toolkit";

import {
  selectListings,
  selectPageState,
  useAppSelector,
  type RootState,
} from "../../store";

/** 详情接口只返回描述类字段，标题价格仍取列表项，避免两处各存一份房源基本信息 */
const selectDetailListing = createSelector(
  selectListings,
  (state: RootState) => state.page.detailListingId,
  (listings, detailListingId) =>
    listings.find((listing) => listing.id === detailListingId) ?? null,
);

const selectListingDetailModel = createSelector(
  selectPageState,
  selectDetailListing,
  (page, listing) => {
    const {
      listingDetail,
      detailStatus,
      detailListingId,
      isDetailDrawerOpen,
      favoriteIds,
    } = page;

    return {
      isVisible: !!detailListingId,
      listing,
      detail: listingDetail,
      detailStatus,
      isDrawerOpen: isDetailDrawerOpen,
      isFavorite: !!detailListingId && favoriteIds.includes(detailListingId),
    };
  },
);

export function useListingDetailModel() {
  return useAppSelector(selectListingDetailModel);
}
