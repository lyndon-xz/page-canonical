import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// 被页面 store.ts import 注册 reducer，故禁止 import store 的运行时内容

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
});

export const { setIsConfirming, setConfirmError } = confirmDialogSlice.actions;

export const confirmDialogReducer = confirmDialogSlice.reducer;
