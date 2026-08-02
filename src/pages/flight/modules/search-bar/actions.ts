import { usePageActions } from "../../actions";
import { getLive } from "../../live";

import { SearchBarModel } from "./model";

export function useSearchBarActions() {
  const { cabinDraft, setCabinDraft } = SearchBarModel.useContainer();
  const { applyFilters } = usePageActions();

  const changeCabin = (cabin: string) => {
    setCabinDraft(cabin);
  };

  const submit = () => {
    applyFilters({ cabin: cabinDraft });
    // 经 liveStore 取 flight-results 的句柄，避免两模块互相 import
    getLive("flightResults")?.current?.scrollToTop();
  };

  return { changeCabin, submit };
}
