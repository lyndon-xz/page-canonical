import { pageActions } from "../../actions";

import { useSearchFilterLocal } from "./model";

export const searchFilterActions = {
  updateKeyword(keyword: string) {
    useSearchFilterLocal.getState().setKeyword(keyword);
  },

  updateStar(star: number) {
    useSearchFilterLocal.getState().setStar(star);
  },

  // 滚回列表顶部由 applySearchParams 统一负责，排序改动也要这行为
  submit() {
    const { keyword, star } = useSearchFilterLocal.getState();

    pageActions.applySearchParams({ keyword, star });
  },
};
