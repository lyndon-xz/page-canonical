import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// 本文件被页面 store.ts import 用于注册 reducer。
// 因此这里禁止 import store 的运行时内容，需要类型时一律 type-only import。
import type { SortBy } from '../../shared/types';

/** 模块本地状态：当前排序维度 */
interface FlightResultsLocalState {
  sortBy: SortBy;
}

const initialState: FlightResultsLocalState = {
  sortBy: 'price',
};

export const flightResultsSlice = createSlice({
  name: 'flightResults',
  initialState,
  reducers: {
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload;
    },
  },
});

export const { setSortBy } = flightResultsSlice.actions;
export const flightResultsReducer = flightResultsSlice.reducer;
