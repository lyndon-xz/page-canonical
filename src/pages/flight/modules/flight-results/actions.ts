import { usePageActions } from "../../actions";
import type { SortBy } from "../../shared/types";

import { FlightResultsModel } from "./model";

export function useFlightResultsActions() {
  const { setSortBy } = FlightResultsModel.useContainer();
  const { selectFlight: selectFlightOnPage } = usePageActions();

  const changeSortBy = (sortBy: SortBy) => {
    setSortBy(sortBy);
  };

  // 选中要连带拉取退改规则，属页面级编排，故转交页面 action
  const selectFlight = (id: string) => {
    void selectFlightOnPage(id);
  };

  return { changeSortBy, selectFlight };
}
