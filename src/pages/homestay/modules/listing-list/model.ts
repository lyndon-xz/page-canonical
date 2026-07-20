import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import { PageStore } from "../../store";

/**
 * 模块 model：unstated-next 下是 Container，作为模块数据的统一入口。
 * 本地 state（hoveredId）+ 从页面 store 透传 listingList / isLoadingList / selectedListingId + 派生 selectedListing。
 */
function useListingListModelHook() {
  // 模块本地状态：仅本模块消费的 hover 态（§0.2 消费范围 → model local state）
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 从 store 透传（UI 需要的 store 数据必须经 model 暴露）
  const { listingList, isLoadingList, selectedListingId } =
    PageStore.useContainer();

  // 派生：当前选中的房源
  const selectedListing = useMemo(
    () =>
      listingList.find((listing) => listing.id === selectedListingId) ?? null,
    [listingList, selectedListingId],
  );

  return {
    listingList,
    isLoadingList,
    selectedListingId,
    selectedListing,
    hoveredId,
    setHoveredId,
  };
}

export const ListingListModel = createContainer(useListingListModelHook);
