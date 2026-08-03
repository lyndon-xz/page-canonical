import { pageActions } from "../../actions";

import { useSearchFilterLocal } from "./model";

export const searchFilterActions = {
  updateKeyword(keyword: string) {
    useSearchFilterLocal.getState().setKeyword(keyword);
  },

  updateStar(star: number) {
    useSearchFilterLocal.getState().setStar(star);
  },

  submit() {
    const { keyword, star } = useSearchFilterLocal.getState();

    pageActions.applySearchParams({ keyword, star });
  },
};
