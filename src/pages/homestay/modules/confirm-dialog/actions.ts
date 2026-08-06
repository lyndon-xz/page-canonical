import { pageActions } from "../../actions";
import { ConfirmScene, type ConfirmRequest } from "../../shared/confirm";
import { store } from "../../store";

import { setConfirmError, setIsConfirming } from "./slice";

async function runByScene(request: ConfirmRequest) {
  if (request.scene === ConfirmScene.RemoveFavorite) {
    await pageActions.commitFavorite(request.listingId);
    return;
  }

  await pageActions.cancelInquiry();
}

export const confirmDialogActions = {
  async confirm() {
    const { confirmRequest } = store.getState().page;

    if (!confirmRequest) {
      return;
    }

    pageActions.trackClick("confirm_ok", { scene: confirmRequest.scene });

    store.dispatch(setIsConfirming(true));
    store.dispatch(setConfirmError(null));
    try {
      await runByScene(confirmRequest);
      pageActions.closeConfirm();
    } catch (err) {
      store.dispatch(
        setConfirmError(err instanceof Error ? err.message : String(err)),
      );
    } finally {
      store.dispatch(setIsConfirming(false));
    }
  },

  cancel() {
    const { confirmRequest } = store.getState().page;

    if (confirmRequest) {
      pageActions.trackClick("confirm_cancel", {
        scene: confirmRequest.scene,
      });
    }

    pageActions.closeConfirm();
  },
};
