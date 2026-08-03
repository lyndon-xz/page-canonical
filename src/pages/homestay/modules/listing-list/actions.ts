import { pageActions } from "../../actions";
import { ConfirmScene } from "../../shared/types";
import { setDetailListingId, setSelectedListingId } from "../../slice";
import { store } from "../../store";

export const listingListActions = {
  // 选中即切换详情：详情区跟着卡片走，避免用户还要再点一次「看详情」
  selectListing(id: string) {
    pageActions.trackClick("listing_select", { listingId: id });
    store.dispatch(setSelectedListingId(id));
    void pageActions.viewDetail(id);
  },

  /** 确认弹窗按 detailListingId 定位房源，故取消收藏前先把它对齐到当前卡片 */
  toggleFavorite(id: string) {
    const { favoriteIds } = store.getState().page;

    pageActions.trackClick("listing_favorite_toggle", {
      listingId: id,
      willFavorite: String(!favoriteIds.includes(id)),
    });

    if (favoriteIds.includes(id)) {
      store.dispatch(setDetailListingId(id));
      pageActions.openConfirm(ConfirmScene.RemoveFavorite);
      return;
    }

    void pageActions.addFavorite(id);
  },

  retry() {
    pageActions.retryListings();
  },
};
