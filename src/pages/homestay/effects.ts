import { useEffect } from "react";

import { pageActions } from "./actions";
import type { ListingFilters } from "./shared/types";

function parseFilters(search: string): ListingFilters {
  const query = new URLSearchParams(search);
  const keyword = query.get("keyword") ?? "";
  const roomType = query.get("roomType") ?? "";
  return { keyword, roomType };
}

export function usePageEffects() {
  useEffect(() => {
    const filters = parseFilters(window.location.search);

    void pageActions.loadListings(filters);
  }, []);
}
