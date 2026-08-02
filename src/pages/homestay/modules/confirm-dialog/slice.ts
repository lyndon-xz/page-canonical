import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// 本文件被页面 store.ts import 用于注册 reducer，
// 因此禁止 import store 的运行时内容，需要类型时一律 type-only import。

/*
 * 「确认中」与提交失败信息归本模块：它们只在弹窗自身生命周期内有意义，
 * 触发方（列表卡片、详情抽屉）既不读也不该读。
 * 与之相对，弹窗开不开由页面 slice 的 confirmScene 决定——那是跨模块的开关。
 */
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
