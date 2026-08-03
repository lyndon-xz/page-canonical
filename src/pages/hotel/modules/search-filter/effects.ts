import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { usePageStore } from "../../store";

import { useSearchFilterLocal } from "./model";

/**
 * 把已提交的筛选条件同步进草稿。
 *
 * 草稿初值不能硬编码默认值：appliedParams 首屏就可能非默认（持久化恢复或 URL 带参），
 * 那时筛选器会显示「不限」而列表是五星的结果。
 */
export function useSearchFilterEffects() {
  const { keyword, star } = usePageStore(
    useShallow((s) => ({
      keyword: s.appliedParams.keyword,
      star: s.appliedParams.star,
    })),
  );

  useEffect(() => {
    const { setKeyword, setStar } = useSearchFilterLocal.getState();

    setKeyword(keyword);
    setStar(star);
  }, [keyword, star]);
}
