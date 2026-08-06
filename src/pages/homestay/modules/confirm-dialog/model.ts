import { shallowEqual } from "react-redux";

import { ConfirmScene } from "../../shared/confirm";
import { useAppSelector, type RootState } from "../../store";

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
