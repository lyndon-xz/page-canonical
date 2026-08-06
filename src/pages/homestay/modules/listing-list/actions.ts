import { pageActions } from "../../actions";

export const listingListActions = {
  selectListing(id: string) {
    pageActions.trackClick("listing_select", { listingId: id });
    pageActions.selectListing(id);
  },

  toggleFavorite(id: string) {
    pageActions.toggleFavorite(id);
  },

  retry() {
    pageActions.trackClick("listing_list_retry");
    pageActions.retryListings();
  },
};
