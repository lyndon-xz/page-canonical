import { pageActions } from "../../actions";
import { ConfirmScene } from "../../shared/types";
import { store } from "../../store";

export const listingDetailActions = {
  openDetailDrawer() {
    pageActions.trackClick("detail_drawer_open");
    pageActions.openDetailDrawer();
  },

  closeDetailDrawer() {
    pageActions.closeDetailDrawer();
  },

  retryDetail() {
    pageActions.retryDetail();
  },

  /** 收藏是新增操作、即点即改；取消收藏是破坏性的，转交二次确认 */
  toggleFavorite() {
    const { detailListingId, favoriteIds } = store.getState().page;

    if (!detailListingId) {
      return;
    }

    if (favoriteIds.includes(detailListingId)) {
      pageActions.openConfirm(ConfirmScene.RemoveFavorite);
      return;
    }

    void pageActions.addFavorite(detailListingId);
  },

  requestCancelInquiry() {
    pageActions.openConfirm(ConfirmScene.CancelInquiry);
  },
};
