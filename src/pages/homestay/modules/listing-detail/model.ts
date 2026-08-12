import { shallowEqual } from "react-redux";

import { selectSelectedListing, useAppSelector } from "../../store";

export function useListingDetailModel() {
  return useAppSelector((s) => {
    const {
      selectedListingId,
      detail,
      detailStatus,
      isDetailDrawerOpen,
      favoriteIds,
      favoritingIds,
    } = s.page;

    return {
      isVisible: !!selectedListingId,
      listing: selectSelectedListing(s),
      detail,
      detailStatus,
      isDrawerOpen: isDetailDrawerOpen,
      isFavorite:
        !!selectedListingId && favoriteIds.includes(selectedListingId),
      isFavoriting:
        !!selectedListingId && favoritingIds.includes(selectedListingId),
    };
  }, shallowEqual);
}
