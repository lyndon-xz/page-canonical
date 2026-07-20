import { pageActions } from "../../actions";
import { getLive } from "../../live";
import { store } from "../../store";

import { setCabinDraft } from "./slice";

/** 模块 actions：纯对象，通过 store.dispatch() 在组件外调用 */
export const searchBarActions = {
  // 改本模块草稿：直接 dispatch 本模块 slice action
  changeCabin(cabin: string) {
    store.dispatch(setCabinDraft(cabin));
  },

  // 提交：读本模块草稿 → 调页面级 applyFilters 落 store → 跨模块命令式滚动到结果区
  submit() {
    const { cabinDraft } = store.getState().searchBar;
    pageActions.applyFilters({ cabin: cabinDraft });
    // 跨模块命令式协作：经 liveStore 取 flight-results 暴露的句柄调用 scrollToTop，两模块互不 import（§3.3）
    getLive("flightResults")?.current?.scrollToTop();
  },
};
