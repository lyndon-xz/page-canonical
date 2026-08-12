import { pageActions } from "../../actions";
import type { Star } from "../../shared/params";

import { useSearchFilterLocal } from "./model";

export const searchFilterActions = {
  updateKeyword(keyword: string) {
    useSearchFilterLocal.getState().setKeyword(keyword);
  },

  submit() {
    const { keyword } = useSearchFilterLocal.getState();

    pageActions.applySearchParams({ keyword });
  },

  updateStar(star: Star) {
    const { keyword } = useSearchFilterLocal.getState();

    pageActions.applySearchParams({ keyword, star });
  },
};
