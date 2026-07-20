import {
  fetchFlights,
  submitBooking as submitBookingService,
} from "./services";
import { serializeFilters } from "./shared/params";
import type { BookingForm, FlightFilters } from "./shared/types";
import {
  setBookingError,
  setBookingSubmitted,
  setFlightList,
  setIsLoadingList,
  setIsSubmittingBooking,
  setListError,
  store,
} from "./store";

/**
 * 页面级 actions：纯对象，通过 store.dispatch() 在组件外调用。
 * 负责页面级 / 跨模块的业务编排，不碰任何模块的 model / actions。
 */
export const pageActions = {
  async loadFlights(filters: FlightFilters) {
    store.dispatch(setIsLoadingList(true));
    store.dispatch(setListError(null));
    try {
      const list = await fetchFlights(filters);
      store.dispatch(setFlightList(list));
    } catch (err) {
      store.dispatch(
        setListError(err instanceof Error ? err : new Error(String(err))),
      );
    } finally {
      store.dispatch(setIsLoadingList(false));
    }
  },

  applyFilters(filters: FlightFilters) {
    pageActions.loadFlights(filters);
    const query = new URLSearchParams(serializeFilters(filters)).toString();
    history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  },

  // 预订提交编排：置提交态、调 service；成功置 submitted；失败写 error 并 rethrow，
  // 让 booking-form 的 module action 捕获后经 getLive 回填字段错误（编排在 action，不进 UI）。
  async submitBooking(values: BookingForm) {
    store.dispatch(setIsSubmittingBooking(true));
    store.dispatch(setBookingError(null));
    store.dispatch(setBookingSubmitted(false));
    try {
      await submitBookingService(values);
      store.dispatch(setBookingSubmitted(true));
    } catch (err) {
      store.dispatch(
        setBookingError(err instanceof Error ? err : new Error(String(err))),
      );
      throw err;
    } finally {
      store.dispatch(setIsSubmittingBooking(false));
    }
  },
};
