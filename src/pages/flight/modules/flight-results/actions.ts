import type { SortBy } from "../../shared/types";
import { setSelectedFlightId, store } from "../../store";

import { setSortBy } from "./slice";

export const flightResultsActions = {
  changeSortBy(sortBy: SortBy) {
    store.dispatch(setSortBy(sortBy));
  },

  selectFlight(id: string) {
    store.dispatch(setSelectedFlightId(id));
  },
};
