import { createSelector } from "@reduxjs/toolkit";

import { selectPageState, useAppSelector, type RootState } from "../../store";

const selectConfirmDialogModel = createSelector(
  selectPageState,
  (state: RootState) => state.confirmDialog,
  (page, local) => ({
    scene: page.confirmScene,
    isConfirming: local.isConfirming,
    confirmError: local.confirmError,
  }),
);

export function useConfirmDialogModel() {
  return useAppSelector(selectConfirmDialogModel);
}
