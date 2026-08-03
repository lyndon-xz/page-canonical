import { pageActions } from "../../actions";
import { store } from "../../store";

export const listingListActions = {
  selectListing(id: string) {
    pageActions.trackClick("listing_select", { listingId: id });
    pageActions.selectListing(id);
  },

  /** 收藏是新增操作、即点即改；取消收藏是破坏性的，转交二次确认 */
  toggleFavorite(id: string) {
    const { favoriteIds } = store.getState().page;

    pageActions.trackClick("listing_favorite_toggle", {
      listingId: id,
      willFavorite: String(!favoriteIds.includes(id)),
    });

    if (favoriteIds.includes(id)) {
      pageActions.requestRemoveFavorite(id);
      return;
    }

    void pageActions.addFavorite(id);
  },

  retry() {
    pageActions.retryListings();
  },
};
