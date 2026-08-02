import { useEffect } from "react";

import { pageActions } from "./actions";
import { parseSearchParams } from "./shared/params";

export function usePageEffects() {
  useEffect(() => {
    const params = parseSearchParams(window.location.search);
    pageActions.loadHotelList(params);
  }, []);
}
