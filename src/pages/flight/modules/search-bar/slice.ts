import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// 本文件被页面 store.ts import 用于注册 reducer。
// 因此这里禁止 import store 的运行时内容（store 实例 / useAppSelector），需要类型时一律 type-only import。

/** 模块本地草稿状态：用户编辑中、尚未提交的筛选条件 */
interface SearchBarLocalState {
  cabinDraft: string;
}

const initialState: SearchBarLocalState = {
  cabinDraft: "",
};

export const searchBarSlice = createSlice({
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
