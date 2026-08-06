import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { resetResultSet, setConfirmRequest } from "../../slice";

interface ConfirmDialogLocalState {
  isConfirming: boolean;
  confirmError: string | null;
}

const initialState: ConfirmDialogLocalState = {
  isConfirming: false,
  confirmError: null,
};

const confirmDialogSlice = createSlice({
  name: "confirmDialog",
  initialState,
  reducers: {
    setIsConfirming(state, action: PayloadAction<boolean>) {
      state.isConfirming = action.payload;
    },
    setConfirmError(state, action: PayloadAction<string | null>) {
      state.confirmError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setConfirmRequest, () => initialState)
      .addCase(resetResultSet, () => initialState);
  },
});

export const { setIsConfirming, setConfirmError } = confirmDialogSlice.actions;

export const confirmDialogReducer = confirmDialogSlice.reducer;
