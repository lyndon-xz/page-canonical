import { useEffect } from "react";

import { pageActions } from "./actions";
import { parseSearchParams } from "./shared/params";

export function usePageEffects() {
  // 首屏：从 URL query 解析初始搜索条件并发起一次取数
  useEffect(() => {
    const params = parseSearchParams(window.location.search);
    pageActions.loadHotelList(params);
  }, []);
}
