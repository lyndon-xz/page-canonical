import { pageActions } from "../../actions";
import { ConfirmScene, type ConfirmRequest } from "../../shared/confirm";
import { store } from "../../store";

import { setConfirmError, setIsConfirming } from "./slice";

/** 分派与编排分开：场景分支收在这里，confirm 只管 loading 与关闭时机 */
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
    // 本次重试前清掉上次的报错；跨弹窗的复位由 slice 挂在开关上，两者管的不是同一件事
    store.dispatch(setConfirmError(null));
    try {
      await runByScene(confirmRequest);
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
    const { confirmRequest } = store.getState().page;

    if (confirmRequest) {
      pageActions.trackClick("confirm_cancel", {
        scene: confirmRequest.scene,
      });
    }

    pageActions.closeConfirm();
  },
};
