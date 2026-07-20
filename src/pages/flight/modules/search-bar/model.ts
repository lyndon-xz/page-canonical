import { createSelector } from "@reduxjs/toolkit";

import { selectPageState, useAppSelector, type RootState } from "../../store";

/**
 * 单一 model selector：输入 selector 内联（页面切片 + 本模块 searchBar 切片），
 * combiner 里一次性解构、派生并返回整个 model 对象。createSelector 记忆化，无需 useShallow。
 */
export const selectSearchBarModel = createSelector(
  selectPageState,
  (state: RootState) => state.searchBar,
  (page, local) => {
    const { flightList, isLoadingList } = page;
    const { cabinDraft } = local;
    return {
      cabinDraft,
      resultCount: flightList.length,
      isLoading: isLoadingList,
    };
  },
);

/** 统一入口 hook：一行消费 */
export function useSearchBarModel() {
  return useAppSelector(selectSearchBarModel);
}
