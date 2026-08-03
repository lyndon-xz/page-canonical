import type { TypedStartListening } from "@reduxjs/toolkit";

import {
  clearDetailContext,
  setInquirySubmitted,
  setSelectedListingId,
} from "./slice";
import type { AppDispatch, RootState } from "./store";

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

/**
 * 跨模块联动收在监听器里。
 *
 * 「询价提交成功 → 退出当前房源」牵涉 listing-list 的选中态与 listing-detail 的详情内容，
 * 触发它的却是 inquiry-submit。写进提交 action 会让提交方知道另外两个模块的存在；
 * 落在监听器里，三方都只认这条 action，互不相识。
 *
 * 代价是因果变隐式：读提交 action 看不到选中会被清掉。故这里只放「结果的旁路反应」，
 * 提交自身必须完成的状态变更仍留在 action 内。
 */
export function registerPageListeners(startListening: AppStartListening) {
  startListening({
    actionCreator: setInquirySubmitted,
    effect: (action, api) => {
      // 该 action 也被用于重置，只有置为已提交时才是「提交成功」
      if (!action.payload) {
        return;
      }

      api.dispatch(setSelectedListingId(null));
      api.dispatch(clearDetailContext());
    },
  });
}
