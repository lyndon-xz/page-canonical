import { shallowEqual } from "react-redux";

import { ConfirmScene } from "../../shared/confirm";
import { useAppSelector, type RootState } from "../../store";

// 破坏性操作的确认要指名对象，否则这次确认只是一次多余的点击
const selectConfirmTarget = (state: RootState) => {
  const { confirmRequest, listings, submittedInquiry } = state.page;

  if (!confirmRequest) {
    return null;
  }

  if (confirmRequest.scene === ConfirmScene.RemoveFavorite) {
    const { listingId } = confirmRequest;

    return listings.find((listing) => listing.id === listingId)?.title ?? null;
  }

  return submittedInquiry?.listingTitle ?? null;
};

export function useConfirmDialogModel() {
  return useAppSelector((s) => {
    const { confirmRequest } = s.page;
    const { isConfirming, confirmError } = s.confirmDialog;

    return {
      scene: confirmRequest?.scene ?? null,
      target: selectConfirmTarget(s),
      isConfirming,
      confirmError,
    };
  }, shallowEqual);
}
