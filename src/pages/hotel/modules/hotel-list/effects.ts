import { useEffect, type RefObject } from "react";

import { hotelListActions } from "./actions";

/**
 * 列表末尾哨兵进入视口即拉下一页。
 *
 * 用 IntersectionObserver 而非 scroll 事件：后者要自己算容器高度与阈值、还得节流，
 * 换个滚动容器就失效。并发与「有没有下一页」的判断不放这里，
 * 统一由 pageActions.loadMoreHotels 守卫——哨兵可能连续触发，闸门只该有一处。
 *
 * 必须把 isMounted（哨兵当前是否在 DOM 里）作为依赖传进来：哨兵是条件渲染的，
 * 首屏 loading 时并不存在，此时 ref.current 为 null；只依赖 ref 的话 effect 只跑一次、
 * 且那一次什么都没观察到，之后哨兵出现也不会补挂观察器。
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
        hotelListActions.loadMore();
      }
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [sentinelRef, isMounted]);
}
