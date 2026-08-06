import { pageActions } from "../../actions";
import type { SortBy } from "../../shared/params";

export const hotelListActions = {

  changeSortBy(sortBy: SortBy) {
    pageActions.applySearchParams({ sortBy });
  },

  loadMore() {
    void pageActions.loadMoreHotels();
  },

  retry() {
    pageActions.retryHotels();
  },

  selectHotel(id: string) {
    pageActions.selectHotel(id);
  },

  toggleSelect(id: string) {
    pageActions.toggleSelect(id);
  },

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
