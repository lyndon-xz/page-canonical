import { pageActions } from "../../actions";

import { useSearchFilterLocal } from "./model";

export const searchFilterActions = {
  updateKeyword(keyword: string) {
    useSearchFilterLocal.getState().setKeyword(keyword);
  },

  submit() {
    const { keyword } = useSearchFilterLocal.getState();

    pageActions.applySearchParams({ keyword });
  },

  updateStar(star: number) {
    const { keyword } = useSearchFilterLocal.getState();

    pageActions.applySearchParams({ keyword, star });
  },
};
