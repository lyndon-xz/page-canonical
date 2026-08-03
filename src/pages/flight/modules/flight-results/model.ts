import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import type { Flight, SortBy } from "../../shared/types";
import { PageStore } from "../../store";

const comparators: Record<SortBy, (a: Flight, b: Flight) => number> = {
  price: (a, b) => a.price - b.price,
  departTime: (a, b) => a.departTime.localeCompare(b.departTime),
};

function useFlightResultsModelHook() {
  const [sortBy, setSortBy] = useState<SortBy>("price");

  const { flights, flightsStatus, selectedFlightId } = PageStore.useContainer();

  // 先展开再排：sort 原地改数组，直接排会改掉 store 里那一份且不触发重渲染
  const sortedFlights = useMemo(
    () => [...flights].sort(comparators[sortBy]),
    [flights, sortBy],
  );

  return {
    sortedFlights,
    flightsStatus,
    selectedFlightId,
    sortBy,
    setSortBy,
  };
}

export const FlightResultsModel = createContainer(useFlightResultsModelHook);
