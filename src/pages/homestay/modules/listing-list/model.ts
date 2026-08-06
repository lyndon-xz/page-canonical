import { shallowEqual } from "react-redux";

import { useAppSelector } from "../../store";

/**
 * 投影 + shallowEqual，而不是 createSelector(selectPageState, ...)：
 * 后者以整块 page 为输入，page 里任一字段变更都会顶掉缓存、返回新对象字面量，
 * 引用相等判定必然失败，等于每次 dispatch 都重渲染全部订阅方。
 */
export function useListingListModel() {
  return useAppSelector(
    (s) => ({
      listings: s.page.listings,
      listingsCount: s.page.listings.length,
      listingsStatus: s.page.listingsStatus,
      selectedListingId: s.page.selectedListingId,
      favoriteIds: s.page.favoriteIds,
      favoritingIds: s.page.favoritingIds,
    }),
    shallowEqual,
  );
}
