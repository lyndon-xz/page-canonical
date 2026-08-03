import { pageActions } from "../../actions";
import type { SortBy } from "../../shared/types";
import { usePageStore } from "../../store";

export const hotelListActions = {
  changeSortBy(sortBy: SortBy) {
    pageActions.applySearchParams({ sortBy });
  },

  selectHotel(id: string) {
    usePageStore.getState().setSelectedHotelId(id);
  },

  loadMore() {
    void pageActions.loadMoreHotels();
  },

  retry() {
    pageActions.retryHotels();
  },

  toggleFavorite(id: string) {
    void pageActions.toggleFavorite(id);
  },

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

  batchFavorite() {
    void pageActions.batchFavorite();
  },

  dismissBatchFavoriteFailures() {
    pageActions.dismissBatchFavoriteFailures();
  },
};
