import { useEffect, type RefObject } from "react";

import { usePageStore } from "../../store";

import { hotelListActions } from "./actions";

const { loadMore } = hotelListActions;

export function useScrollBackOnResultSet(
  listRef: RefObject<HTMLElement | null>,
) {
  const appliedParams = usePageStore((s) => s.appliedParams);

  useEffect(() => {
    const list = listRef.current;

    if (!list || list.getBoundingClientRect().top >= 0) {
      return;
    }

    list.scrollIntoView({ behavior: "auto", block: "start" });
  }, [appliedParams, listRef]);
}

export function useLoadMoreOnSentinel(
  sentinelRef: RefObject<HTMLElement | null>,
  showSentinel: boolean,
) {
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!showSentinel || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore();
      }
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [sentinelRef, showSentinel]);
}
