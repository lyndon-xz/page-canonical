import { shallowEqual } from "react-redux";

import { useAppSelector } from "../../store";

export function useListingListModel() {
  return useAppSelector((s) => {
    const {
      listings,
      listingsStatus,
      selectedListingId,
      favoriteIds,
      favoritingIds,
    } = s.page;

    return {
      listings,
      listingsStatus,
      selectedListingId,
      favoriteIds,
      favoritingIds,
    };
  }, shallowEqual);
}
