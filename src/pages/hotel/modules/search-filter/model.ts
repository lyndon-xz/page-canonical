import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import { usePageStore } from "../../store";

/** 模块本地草稿状态：用户编辑中、尚未提交的搜索条件 */
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

/** 统一入口 hook：本地草稿 + 从页面 store 派生结果数与加载态 */
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
