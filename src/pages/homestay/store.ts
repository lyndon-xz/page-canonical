import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { registerPageListeners, type AppStartListening } from "./listeners";
import { confirmDialogReducer } from "./modules/confirm-dialog/slice";
import type { TraceCommonTag } from "./shared/trace";
import { homestayPageReducer } from "./slice";

const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    page: homestayPageReducer,
    confirmDialog: confirmDialogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

registerPageListeners(listenerMiddleware.startListening as AppStartListening);

export const useAppSelector = useSelector.withTypes<RootState>();

/**
 * 详情与询价都要「当前在看哪一间」，find 一份放页面层，模块各取所需。
 * 房源基本信息一律认列表项：详情接口只返回描述类字段，标题价格不在那儿。
 */
export const selectSelectedListing = (state: RootState) => {
  const { listings, selectedListingId } = state.page;

  return listings.find((listing) => listing.id === selectedListingId) ?? null;
};

/** 埋点通用参数从 store 派生，不在各调用点各拼一遍 */
export const selectTraceCommonTag = (state: RootState): TraceCommonTag => {
  const { appliedFilters, selectedListingId } = state.page;
  const { keyword, roomType } = appliedFilters;

  return {
    page: "homestay",
    keyword,
    roomType,
    selectedListingId: selectedListingId ?? "",
  };
};
