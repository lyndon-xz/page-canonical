import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { FetchStatus } from "@/lib/fetch-status";

import { usePageStore } from "../../store";

interface SearchFilterLocalState {
  keyword: string;
  setKeyword: (keyword: string) => void;
}

export const useSearchFilterLocal = create<SearchFilterLocalState>((set) => ({
  keyword: usePageStore.getState().appliedParams.keyword,
  setKeyword: (keyword) => set({ keyword }),
}));

export function useSearchFilterModel() {
  const keyword = useSearchFilterLocal((s) => s.keyword);
  const state = usePageStore(
    useShallow((s) => ({
      star: s.appliedParams.star,
      resultCount: s.hotelsTotal,
      isLoadingHotels: s.hotelsStatus === FetchStatus.Loading,
    })),
  );

  return {
    keyword,
    ...state,
  };
}
