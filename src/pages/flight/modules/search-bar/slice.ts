// 本文件被页面 store.ts import 用于注册 reducer，禁止反向 import store 的运行时内容，
// 需要类型时一律 type-only import，否则形成循环依赖。
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** 用户编辑中、尚未提交的筛选条件（已提交的在页面 slice） */
interface SearchBarLocalState {
  cabinDraft: string;
}

const initialState: SearchBarLocalState = {
  cabinDraft: "",
};

const searchBarSlice = createSlice({
  name: "searchBar",
  initialState,
  reducers: {
    setCabinDraft(state, action: PayloadAction<string>) {
      state.cabinDraft = action.payload;
    },
  },
});

export const { setCabinDraft } = searchBarSlice.actions;
export const searchBarReducer = searchBarSlice.reducer;
