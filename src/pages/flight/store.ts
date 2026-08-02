import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { flightResultsReducer } from "./modules/flight-results/slice";
import { searchBarReducer } from "./modules/search-bar/slice";
import type { Flight } from "./shared/types";

interface FlightPageState {
  flightList: Flight[];
  isLoadingList: boolean;
  listError: Error | null;
  selectedFlightId: string | null;
  isSubmittingBooking: boolean;
  bookingError: Error | null;
  bookingSubmitted: boolean;
}

/** 前向引用下方的 store，以满足「type 先于 const」的排序约束 */
export type RootState = ReturnType<typeof store.getState>;

const initialState: FlightPageState = {
  flightList: [],
  isLoadingList: false,
  listError: null,
  selectedFlightId: null,
  isSubmittingBooking: false,
  bookingError: null,
  bookingSubmitted: false,
};

const flightPageSlice = createSlice({
  name: "flightPage",
  initialState,
  reducers: {
    setFlightList(state, action: PayloadAction<Flight[]>) {
      state.flightList = action.payload;
    },
    setIsLoadingList(state, action: PayloadAction<boolean>) {
      state.isLoadingList = action.payload;
    },
    setListError(state, action: PayloadAction<Error | null>) {
      state.listError = action.payload;
    },
    setSelectedFlightId(state, action: PayloadAction<string | null>) {
      state.selectedFlightId = action.payload;
    },
    setIsSubmittingBooking(state, action: PayloadAction<boolean>) {
      state.isSubmittingBooking = action.payload;
    },
    setBookingError(state, action: PayloadAction<Error | null>) {
      state.bookingError = action.payload;
    },
    setBookingSubmitted(state, action: PayloadAction<boolean>) {
      state.bookingSubmitted = action.payload;
    },
  },
});

export const {
  setFlightList,
  setIsLoadingList,
  setListError,
  setSelectedFlightId,
  setIsSubmittingBooking,
  setBookingError,
  setBookingSubmitted,
} = flightPageSlice.actions;

export const store = configureStore({
  reducer: {
    page: flightPageSlice.reducer,
    searchBar: searchBarReducer,
    flightResults: flightResultsReducer,
  },
});

export const useAppSelector = useSelector.withTypes<RootState>();

export const selectPageState = (state: RootState) => state.page;
