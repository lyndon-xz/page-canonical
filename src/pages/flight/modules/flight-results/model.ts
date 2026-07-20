import { createSelector } from "@reduxjs/toolkit";

import type { Flight, SortBy } from "../../shared/types";
import { selectPageState, useAppSelector, type RootState } from "../../store";

/** 各排序维度的比较器：价格升序、起飞时间升序 */
const comparators: Record<SortBy, (a: Flight, b: Flight) => number> = {
  price: (a, b) => a.price - b.price,
  departTime: (a, b) => a.departTime.localeCompare(b.departTime),
};

/**
 * 单一 model selector：合并页面切片与本模块 flightResults 切片，
 * combiner 里派生 sortedList（按 sortBy 排序 page.flightList）并返回整个 model 对象。
 */
export const selectFlightResultsModel = createSelector(
  selectPageState,
  (state: RootState) => state.flightResults,
  (page, local) => {
    const { flightList, isLoadingList, selectedFlightId } = page;
    const { sortBy } = local;
    const sortedList = [...flightList].sort(comparators[sortBy]);
    return {
      sortedList,
      isLoading: isLoadingList,
      selectedFlightId,
      sortBy,
    };
  },
);

/** 统一入口 hook：一行消费 */
export function useFlightResultsModel() {
  return useAppSelector(selectFlightResultsModel);
}
