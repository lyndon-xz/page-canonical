import { usePageActions } from "../../actions";
import type { SortBy } from "../../shared/types";

import { FlightResultsModel } from "./model";

export function useFlightResultsActions() {
  const { setSortBy } = FlightResultsModel.useContainer();
  const { selectFlight: selectFlightOnPage, retryFlights } = usePageActions();

  const changeSortBy = (sortBy: SortBy) => {
    setSortBy(sortBy);
  };

  const selectFlight = (id: string) => {
    void selectFlightOnPage(id);
  };

  const retry = () => {
    retryFlights();
  };

  return { changeSortBy, selectFlight, retry };
}
