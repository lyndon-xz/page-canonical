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
    getLive("flightResultsRef")?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return { changeCabin, submit };
}
