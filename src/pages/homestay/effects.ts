import { useEffect } from "react";

import { usePageActions } from "./actions";
import { parseFilters } from "./shared/params";

/**
 * 全局 effects：只触发副作用，不做业务编排（编排在 actions）。
 * 首屏从 URL query 解析初始筛选并发起一次取数。
 */
export function usePageEffects() {
  const { loadListings } = usePageActions();

  useEffect(() => {
    const filters = parseFilters(window.location.search);
    loadListings(filters);
  }, [loadListings]);
}
