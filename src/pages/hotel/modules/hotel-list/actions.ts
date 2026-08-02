import type { SortBy } from "../../shared/types";
import { usePageStore } from "../../store";

import { useHotelListLocal } from "./model";

export const hotelListActions = {
  changeSortBy(sortBy: SortBy) {
    useHotelListLocal.getState().setSortBy(sortBy);
  },

  selectHotel(id: string) {
    usePageStore.getState().setSelectedHotelId(id);
  },
};
