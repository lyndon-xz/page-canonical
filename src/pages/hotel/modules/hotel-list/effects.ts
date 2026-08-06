import { useEffect, type RefObject } from "react";

import { hotelListActions } from "./actions";

const { loadMore } = hotelListActions;

export function useHotelListEffects(
  sentinelRef: RefObject<HTMLElement | null>,
  isMounted: boolean,
) {
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!isMounted || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore();
      }
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [sentinelRef, isMounted]);
}
