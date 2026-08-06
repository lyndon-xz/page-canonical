import { useEffect } from "react";

import { pageActions } from "./actions";
import { parseFilters } from "./shared/filters";

const { loadListings } = pageActions;

export function usePageEffects() {
  useEffect(() => {
    void loadListings(parseFilters(window.location.search));
  }, []);
}
