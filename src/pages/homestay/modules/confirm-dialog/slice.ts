import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { resetResultSet, setConfirmRequest } from "../../slice";

// 被页面 store.ts import 注册 reducer，故禁止 import store 的运行时内容。
// 取页面 slice 的 action creator 不在此列：页面 slice 不认识任何模块，方向是单向的。

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
  /**
   * 本地态只在一次弹窗的生命周期里有意义，所以生命周期直接挂在弹窗开关上。
   * 靠关闭方各自记得清的话，绕过 cancel 的那几条路径（确认成功后关闭、
   * 换结果集时关闭）都会把上次的报错留到下次开弹窗时显示出来。
   */
  extraReducers: (builder) => {
    builder
      .addCase(setConfirmRequest, () => initialState)
      .addCase(resetResultSet, () => initialState);
  },
});

export const { setIsConfirming, setConfirmError } = confirmDialogSlice.actions;

export const confirmDialogReducer = confirmDialogSlice.reducer;
