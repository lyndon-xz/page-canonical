import { PageStore } from "../../store";

import { ListingListModel } from "./model";

/**
 * 模块 actions：unstated-next 下是 hook（需消费 Container）。
 * 选中 → 写页面 store 的 selectedListingId（本模块属主字段，直调 setter）；
 * hover → 写本模块 model local state。均只在事件里调用 → 普通函数即可。
 */
export function useListingListActions() {
  const { setSelectedListingId } = PageStore.useContainer();
  const { setHoveredId } = ListingListModel.useContainer();

  const selectListing = (id: string) => {
    setSelectedListingId(id);
  };

  const hoverListing = (id: string | null) => {
    setHoveredId(id);
  };

  return { selectListing, hoverListing };
}
