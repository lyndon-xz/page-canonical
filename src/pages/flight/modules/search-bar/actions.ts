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
    // 经页面 live 表取 flight-results 的容器，避免两模块互相 import
    getLive("flightResultsRef")?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return { changeCabin, submit };
}
