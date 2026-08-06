import type { TypedStartListening } from "@reduxjs/toolkit";

import { exitListing, setSubmittedInquiry } from "./slice";
import type { AppDispatch, RootState } from "./store";

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

/** 只放「结果的旁路反应」，提交自身必须完成的状态变更留在 action 内 */
export function registerPageListeners(startListening: AppStartListening) {
  startListening({
    actionCreator: setSubmittedInquiry,
    effect: (action, api) => {
      // 该 action 也被用于撤回与重置，只有带上询价才是「提交成功」
      if (!action.payload) {
        return;
      }

      api.dispatch(exitListing());
    },
  });
}
