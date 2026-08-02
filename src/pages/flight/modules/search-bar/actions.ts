import { pageActions } from "../../actions";
import { getLive } from "../../live";
import { store } from "../../store";

import { setCabinDraft } from "./slice";

export const searchBarActions = {
  changeCabin(cabin: string) {
    store.dispatch(setCabinDraft(cabin));
  },

  submit() {
    const { cabinDraft } = store.getState().searchBar;
    pageActions.applyFilters({ cabin: cabinDraft });
    // 经 liveStore 取 flight-results 的句柄，避免两模块互相 import
    getLive("flightResults")?.current?.scrollToTop();
  },
};
