import type { SortBy } from "../../shared/types";
import { setSelectedFlightId, store } from "../../store";

import { setSortBy } from "./slice";

/** 模块 actions：排序写本模块 slice；选中写页面 slice（selectedFlightId 本模块属主字段，直调 setter） */
export const flightResultsActions = {
  changeSortBy(sortBy: SortBy) {
    store.dispatch(setSortBy(sortBy));
  },

  selectFlight(id: string) {
    store.dispatch(setSelectedFlightId(id));
  },
};
