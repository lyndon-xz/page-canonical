import { pageActions } from "../../actions";
import { ConfirmScene } from "../../shared/types";
import { store } from "../../store";

import { setConfirmError, setIsConfirming } from "./slice";

/** 分派与编排分开：场景分支收在这里，confirm 只管 loading 与关闭时机 */
async function runByScene(scene: ConfirmScene, listingId: string | null) {
  if (scene === ConfirmScene.RemoveFavorite) {
    if (!listingId) {
      return;
    }
    await pageActions.commitFavorite(listingId);
    return;
  }

  await pageActions.cancelInquiry();
}

export const confirmDialogActions = {
  async confirm() {
    const { confirmScene, detailListingId } = store.getState().page;

    if (!confirmScene) {
      return;
    }

    store.dispatch(setIsConfirming(true));
    store.dispatch(setConfirmError(null));
    try {
      await runByScene(confirmScene, detailListingId);
      pageActions.closeConfirm();
    } catch (err) {
      // 失败时不关弹窗，把原因摆在用户眼前，让他能原地重试
      store.dispatch(
        setConfirmError(err instanceof Error ? err.message : String(err)),
      );
    } finally {
      store.dispatch(setIsConfirming(false));
    }
  },

  cancel() {
    store.dispatch(setConfirmError(null));
    pageActions.closeConfirm();
  },
};
