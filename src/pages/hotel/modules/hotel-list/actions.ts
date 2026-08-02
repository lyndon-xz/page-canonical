import { pageActions } from "../../actions";
import type { SortBy } from "../../shared/types";
import { usePageStore } from "../../store";

export const hotelListActions = {
  // 排序由服务端执行，换排序等于换一次取数条件，故回到第一页重新拉
  changeSortBy(sortBy: SortBy) {
    pageActions.applySearchParams({ sortBy });
  },

  selectHotel(id: string) {
    usePageStore.getState().setSelectedHotelId(id);
  },

  // 下面三条都是页面级取数与写入，模块只做转交
  loadMore() {
    void pageActions.loadMoreHotels();
  },

  retry() {
    pageActions.retryHotels();
  },

  toggleFavorite(id: string) {
    void pageActions.toggleFavorite(id);
  },

  dismissFavoriteError() {
    pageActions.dismissFavoriteError();
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
