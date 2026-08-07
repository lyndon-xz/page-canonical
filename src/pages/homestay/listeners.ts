import type { TypedStartListening } from "@reduxjs/toolkit";

import { exitListing, setSubmittedInquiry } from "./slice";
import type { AppDispatch, RootState } from "./store";

type AppStartListening = TypedStartListening<RootState, AppDispatch>;

export function registerPageListeners(startListening: AppStartListening) {
  startListening({
    actionCreator: setSubmittedInquiry,
    effect: (action, api) => {
      if (!action.payload) {
        return;
      }

      api.dispatch(exitListing());
    },
  });
}
