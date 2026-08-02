import { pageActions } from "../../actions";
import { getLive } from "../../live";

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
    // 经 liveStore 取 hotel-list 的容器，避免两模块互相 import
    getLive("hotelListRef")?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  },
};
