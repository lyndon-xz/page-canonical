import { useEffect } from "react";

import { pageActions } from "./actions";
import { parseFilters } from "./shared/params";

export function usePageEffects() {
  // 首屏：从 URL query 解析初始筛选条件并发起一次取数
  useEffect(() => {
    const filters = parseFilters(window.location.search);
    pageActions.loadFlights(filters);
  }, []);
}
