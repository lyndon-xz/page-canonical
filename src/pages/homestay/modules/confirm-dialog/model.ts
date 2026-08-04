import { createSelector } from "@reduxjs/toolkit";

import { selectPageState, useAppSelector, type RootState } from "../../store";

const selectConfirmDialogModel = createSelector(
  selectPageState,
  (state: RootState) => state.confirmDialog,
  (page, local) => {
    const { confirmScene } = page;
    const { isConfirming, confirmError } = local;

    return {
      scene: confirmScene,
      isConfirming,
      confirmError,
    };
  },
);

export function useConfirmDialogModel() {
  return useAppSelector(selectConfirmDialogModel);
}
