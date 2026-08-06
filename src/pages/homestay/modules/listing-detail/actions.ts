import { pageActions } from "../../actions";
import { store } from "../../store";

export const listingDetailActions = {
  openDetailDrawer() {
    pageActions.trackClick("detail_drawer_open");
    pageActions.openDetailDrawer();
  },

  closeDetailDrawer() {
    pageActions.trackClick("detail_drawer_close");
    pageActions.closeDetailDrawer();
  },

  retryDetail() {
    pageActions.trackClick("detail_retry");
    pageActions.retryDetail();
  },

  toggleFavorite() {
    const { selectedListingId } = store.getState().page;

    if (!selectedListingId) {
      return;
    }

    pageActions.toggleFavorite(selectedListingId);
  },
};
