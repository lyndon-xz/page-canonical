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

  // 记下 error 后仍要 rethrow：调用方 action 需要拿到原错误把字段级错误回填到表单
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
