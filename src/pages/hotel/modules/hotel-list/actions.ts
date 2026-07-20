import type { SortBy } from "../../shared/types";
import { usePageStore } from "../../store";

import { useHotelListLocal } from "./model";

/** 模块 actions：排序写本地 setter；选中写页面 store（本模块属主字段，直调 setter） */
export const hotelListActions = {
  changeSortBy(sortBy: SortBy) {
    useHotelListLocal.getState().setSortBy(sortBy);
  },

  selectHotel(id: string) {
    usePageStore.getState().setSelectedHotelId(id);
  },
};
