import { PageStore } from "../../store";

import { ListingListModel } from "./model";

export function useListingListActions() {
  const { setSelectedListingId } = PageStore.useContainer();
  const { setHoveredId } = ListingListModel.useContainer();

  const selectListing = (id: string) => {
    setSelectedListingId(id);
  };

  const hoverListing = (id: string | null) => {
    setHoveredId(id);
  };

  return { selectListing, hoverListing };
}
