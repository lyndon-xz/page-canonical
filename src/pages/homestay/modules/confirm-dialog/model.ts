import { createSelector } from "@reduxjs/toolkit";
import { shallowEqual } from "react-redux";

import { ConfirmScene } from "../../shared/confirm";
import { selectListings, useAppSelector, type RootState } from "../../store";

// 破坏性操作的确认要指名对象，否则这次确认只是一次多余的点击
const selectConfirmTarget = createSelector(
  selectListings,
  (state: RootState) => state.page.confirmRequest,
  (state: RootState) => state.page.submittedInquiry,
  (listings, request, submittedInquiry) => {
    if (!request) {
      return null;
    }

    if (request.scene === ConfirmScene.RemoveFavorite) {
      const { listingId } = request;

      return (
        listings.find((listing) => listing.id === listingId)?.title ?? null
      );
    }

    return submittedInquiry?.listingTitle ?? null;
  },
);

export function useConfirmDialogModel() {
  return useAppSelector(
    (s) => ({
      scene: s.page.confirmRequest?.scene ?? null,
      target: selectConfirmTarget(s),
      isConfirming: s.confirmDialog.isConfirming,
      confirmError: s.confirmDialog.confirmError,
    }),
    shallowEqual,
  );
}
