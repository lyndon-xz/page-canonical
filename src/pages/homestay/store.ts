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

export const selectSelectedListing = (state: RootState) => {
  const { listings, selectedListingId } = state.page;

  return listings.find((listing) => listing.id === selectedListingId) ?? null;
};

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
