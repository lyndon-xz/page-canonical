import { pageActions } from "../../actions";
import { getLive } from "../../live";

import { useSearchFilterLocal } from "./model";

/** 模块 actions：写本模块草稿 local state，提交时经 global action 落 store */
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
    // 跨模块命令式协作：经 liveStore 取 hotel-list 的容器 ref 滚动定位，两模块互不 import（§3.3）
    getLive("hotelListRef")?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  },
};
