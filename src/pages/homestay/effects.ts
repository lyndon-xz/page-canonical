import { useEffect } from "react";

import { pageActions } from "./actions";
import { parseFilters } from "./shared/params";

export function usePageEffects() {
  useEffect(() => {
    const filters = parseFilters(window.location.search);

    void pageActions.loadListings(filters);
  }, []);
}
