import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { usePageStore } from "../../store";

import { useSearchFilterLocal } from "./model";

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
