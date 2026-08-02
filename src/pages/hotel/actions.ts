import { fetchHotels } from "./services";
import { serializeParams } from "./shared/params";
import type { SearchParams } from "./shared/types";
import { usePageStore } from "./store";

export const pageActions = {
  async loadHotelList(searchParams: SearchParams) {
    const { setIsLoadingHotelList, setHotelList, setHotelListError } =
      usePageStore.getState();
    setIsLoadingHotelList(true);
    setHotelListError(null);
    try {
      const list = await fetchHotels(searchParams);
      setHotelList(list);
    } catch (err) {
      setHotelListError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoadingHotelList(false);
    }
  },

  applySearchParams(searchParams: SearchParams) {
    usePageStore.getState().setAppliedParams(searchParams);
    pageActions.loadHotelList(searchParams);
    const query = new URLSearchParams(serializeParams(searchParams)).toString();
    history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  },
};
