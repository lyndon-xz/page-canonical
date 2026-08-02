import { useEffect } from "react";

import { usePageActions } from "./actions";
import { parseFilters } from "./shared/params";

export function usePageEffects() {
  const { loadListings } = usePageActions();

  useEffect(() => {
    const filters = parseFilters(window.location.search);
    loadListings(filters);
  }, [loadListings]);
}
