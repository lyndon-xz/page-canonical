import { useEffect } from "react";

import { usePageActions } from "./actions";
import { parseFilters } from "./params";

export function usePageEffects() {
  const { initPage } = usePageActions();

  useEffect(() => {
    const filters = parseFilters(window.location.search);

    void initPage(filters);
  }, [initPage]);
}
