import {
  configureStore,
  createListenerMiddleware,
  createSelector,
} from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { registerPageListeners, type AppStartListening } from "./listeners";
import { confirmDialogReducer } from "./modules/confirm-dialog/slice";
import { listingListReducer } from "./modules/listing-list/slice";
import type { TraceCommonTag } from "./shared/trace";
import { homestayPageReducer, listingsAdapter } from "./slice";

const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    page: homestayPageReducer,
    listingList: listingListReducer,
    confirmDialog: confirmDialogReducer,
  },
  // 前置：让监听器在其它中间件处理该 action 之前就登记上
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

/** RootState 与 AppDispatch 由 store 推导，按依赖方向紧跟其后 */
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

registerPageListeners(listenerMiddleware.startListening as AppStartListening);

export const useAppSelector = useSelector.withTypes<RootState>();

export const selectPageState = (state: RootState) => state.page;

const listingsSelectors = listingsAdapter.getSelectors(
  (state: RootState) => state.page.listings,
);

export const selectListings = listingsSelectors.selectAll;

export const selectListingsCount = listingsSelectors.selectTotal;

/** 按 id 取单条：字典查，不遍历列表 */
export const selectListingById = listingsSelectors.selectById;

/**
 * 埋点通用参数从 store 派生，不在各调用点各拼一遍。
 *
 * 各处手拼的下场是漏字段与口径不一：有的带筛选条件有的不带，
 * 同一个字段在两处叫不同的名字，最后没法在报表里对齐。
 */
export const selectTraceCommonTag = createSelector(
  selectPageState,
  (page): TraceCommonTag => ({
    page: "homestay",
    keyword: page.appliedFilters.keyword,
    roomType: page.appliedFilters.roomType,
    selectedListingId: page.selectedListingId ?? "",
  }),
);
