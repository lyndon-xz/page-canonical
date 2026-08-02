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

  const { flights, isLoadingFlights, selectedFlightId } =
    PageStore.useContainer();

  const sortedFlights = useMemo(
    () => [...flights].sort(comparators[sortBy]),
    [flights, sortBy],
  );

  return {
    sortedFlights,
    isLoading: isLoadingFlights,
    selectedFlightId,
    sortBy,
    setSortBy,
  };
}

export const FlightResultsModel = createContainer(useFlightResultsModelHook);
