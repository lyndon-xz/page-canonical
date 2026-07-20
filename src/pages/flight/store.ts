import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { flightResultsReducer } from "./modules/flight-results/slice";
import { searchBarReducer } from "./modules/search-bar/slice";
import type { Flight } from "./shared/types";

/** 页面级结构化状态：跨模块共享、需序列化的数据（活对象走 liveStore，不进此处） */
interface FlightPageState {
  flightList: Flight[];
  isLoadingList: boolean;
  listError: Error | null;
  selectedFlightId: string | null;
  // 预订提交态（可序列化派生态，由全局 submitBooking action 写，booking-form 模块只读派生）
  isSubmittingBooking: boolean;
  bookingError: Error | null;
  bookingSubmitted: boolean;
}

/** RootState 用 `typeof store` 前向引用，放在 store 之上以满足「type 先于 const」的排序约束。 */
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

/** 页面 slice：结构化状态 + 原子 setter（Immer 支持直接赋值，setter 只赋值、不含业务逻辑） */
export const flightPageSlice = createSlice({
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

/**
 * 页面级 store：reducer map 直接注册「页面 slice + 各模块 slice」，configureStore 自动 combine。
 * 无全局 src/store；<Provider> 在页面入口包一次，store 随页面挂载 / 卸载。新增模块只改这个 map。
 */
export const store = configureStore({
  reducer: {
    page: flightPageSlice.reducer,
    searchBar: searchBarReducer,
    flightResults: flightResultsReducer,
  },
});

/** 类型化 hook —— 本页统一用它，不直接用 react-redux 原始 hook（写入经 store.dispatch 直调）。 */
export const useAppSelector = useSelector.withTypes<RootState>();

/** 页面 slice 切片入口：供模块 model 读页面共享数据。 */
export const selectPageState = (state: RootState) => state.page;
