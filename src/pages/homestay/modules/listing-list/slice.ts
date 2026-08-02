import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// 本文件被页面 store.ts import 用于注册 reducer，
// 因此禁止 import store 的运行时内容，需要类型时一律 type-only import。

interface ListingListLocalState {
  /** 只本模块自己用，故留在模块 slice */
  hoveredId: string | null;
}

const initialState: ListingListLocalState = {
  hoveredId: null,
};

const listingListSlice = createSlice({
  name: "listingList",
  initialState,
  reducers: {
    setHoveredId(state, action: PayloadAction<string | null>) {
      state.hoveredId = action.payload;
    },
  },
});

export const { setHoveredId } = listingListSlice.actions;

export const listingListReducer = listingListSlice.reducer;
