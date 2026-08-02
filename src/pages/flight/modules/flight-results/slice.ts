// 本文件被页面 store.ts import 用于注册 reducer，禁止反向 import store 的运行时内容，
// 需要类型时一律 type-only import，否则形成循环依赖。
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { SortBy } from "../../shared/types";

interface FlightResultsLocalState {
  sortBy: SortBy;
}

const initialState: FlightResultsLocalState = {
  sortBy: "price",
};

export const flightResultsSlice = createSlice({
  name: "flightResults",
  initialState,
  reducers: {
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload;
    },
  },
});

export const { setSortBy } = flightResultsSlice.actions;
export const flightResultsReducer = flightResultsSlice.reducer;
