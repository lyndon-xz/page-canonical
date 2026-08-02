import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { usePageStore } from "../../store";

/** 用户编辑中、尚未提交的搜索条件（已提交的在页面 store 的 appliedParams） */
interface SearchFilterLocalState {
  keyword: string;
  star: number;
  setKeyword: (keyword: string) => void;
  setStar: (star: number) => void;
}

export const useSearchFilterLocal = create<SearchFilterLocalState>((set) => ({
  keyword: "",
  star: 0,
  setKeyword: (keyword) => set({ keyword }),
  setStar: (star) => set({ star }),
}));

export function useSearchFilterModel() {
  const { keyword, star } = useSearchFilterLocal(
    useShallow((s) => ({ keyword: s.keyword, star: s.star })),
  );

  const { resultCount, isLoading } = usePageStore(
    useShallow((s) => ({
      resultCount: s.hotelList.length,
      isLoading: s.isLoadingHotelList,
    })),
  );

  return { keyword, star, resultCount, isLoading };
}
