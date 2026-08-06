import { useEffect, type RefObject } from "react";

import { hotelListActions } from "./actions";

const { loadMore } = hotelListActions;

/**
 * 列表末尾哨兵进入视口即拉下一页。
 *
 * isMounted 必须作为依赖传进来：哨兵是条件渲染的，首屏 loading 时不在 DOM 里，
 * 此时 ref.current 为 null。只依赖 ref 的话 effect 只跑一次且什么都没观察到，
 * 之后哨兵出现也不会补挂观察器。
 */
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
