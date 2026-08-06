import { pageActions } from "../../actions";
import type { SortBy } from "../../shared/params";

export const hotelListActions = {
  // ── 列表 ──

  changeSortBy(sortBy: SortBy) {
    pageActions.applySearchParams({ sortBy });
  },

  loadMore() {
    void pageActions.loadMoreHotels();
  },

  retry() {
    pageActions.retryHotels();
  },

  // ── 选中 ──

  selectHotel(id: string) {
    pageActions.selectHotel(id);
  },

  // ── 多选 ──

  toggleSelect(id: string) {
    pageActions.toggleSelect(id);
  },

  /** 勾满了再点即取消全选，符合表头复选框的惯例 */
  toggleSelectAll(allSelected: boolean) {
    if (allSelected) {
      pageActions.clearSelection();
      return;
    }
    pageActions.selectAllLoaded();
  },

  clearSelection() {
    pageActions.clearSelection();
  },

  // ── 收藏 ──

  toggleFavorite(id: string) {
    void pageActions.toggleFavorite(id);
  },

  batchFavorite() {
    void pageActions.batchFavorite();
  },

  dismissBatchFavoriteFailures() {
    pageActions.dismissBatchFavoriteFailures();
  },
};
