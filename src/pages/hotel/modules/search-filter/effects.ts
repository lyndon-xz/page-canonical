import { useEffect } from "react";

import { usePageStore } from "../../store";

import { useSearchFilterLocal } from "./model";

export function useSearchFilterEffects() {
  const keyword = usePageStore((s) => s.appliedParams.keyword);

  useEffect(() => {
    useSearchFilterLocal.getState().setKeyword(keyword);
  }, [keyword]);
}
