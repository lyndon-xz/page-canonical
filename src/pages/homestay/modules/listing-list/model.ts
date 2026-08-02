import { useState } from "react";
import { createContainer } from "unstated-next";

import { PageStore } from "../../store";

function useListingListModelHook() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { listingList, isLoadingList, selectedListingId } =
    PageStore.useContainer();

  return {
    listingList,
    isLoadingList,
    selectedListingId,
    hoveredId,
    setHoveredId,
  };
}

export const ListingListModel = createContainer(useListingListModelHook);
