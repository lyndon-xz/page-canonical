import {
  configureStore,
  createListenerMiddleware,
  createSelector,
} from "@reduxjs/toolkit";
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

export const selectListings = (state: RootState) => state.page.listings;

const selectPageState = (state: RootState) => state.page;

/** 埋点通用参数从 store 派生，不在各调用点各拼一遍 */
export const selectTraceCommonTag = createSelector(
  selectPageState,
  (page): TraceCommonTag => {
    const { appliedFilters, selectedListingId } = page;
    const { keyword, roomType } = appliedFilters;

    return {
      page: "homestay",
      keyword,
      roomType,
      selectedListingId: selectedListingId ?? "",
    };
  },
);
