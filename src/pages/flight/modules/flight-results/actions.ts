import { usePageActions } from "../../actions";
import type { SortBy } from "../../shared/types";

import { FlightResultsModel } from "./model";

export function useFlightResultsActions() {
  const { setSortBy } = FlightResultsModel.useContainer();
  const { selectFlight: selectFlightOnPage, retryFlights } = usePageActions();

  const changeSortBy = (sortBy: SortBy) => {
    setSortBy(sortBy);
  };

  // 选中要连带拉取退改规则，属页面级编排，故转交页面 action
  const selectFlight = (id: string) => {
    void selectFlightOnPage(id);
  };

  // 重试属页面级取数，转交页面 action
  const retry = () => {
    retryFlights();
  };

  return { changeSortBy, selectFlight, retry };
}
