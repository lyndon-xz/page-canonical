import { createSelector } from "@reduxjs/toolkit";

import {
  selectListingById,
  selectPageState,
  useAppSelector,
  type RootState,
} from "../../store";

/*
 * 详情接口只返回描述类字段，标题价格仍取列表项，避免两处各存一份房源基本信息。
 * 规范化存储下这是一次字典查，不必遍历列表。
 */
const selectDetailListing = (state: RootState) => {
  const { detailListingId } = state.page;

  if (!detailListingId) {
    return null;
  }

  return selectListingById(state, detailListingId) ?? null;
};

const selectListingDetailModel = createSelector(
  selectPageState,
  selectDetailListing,
  (page, listing) => {
    const {
      listingDetail,
      detailListingId,
      isLoadingDetail,
      detailError,
      isDetailDrawerOpen,
      favoriteIds,
    } = page;

    return {
      // 没选房源时整个模块不渲染：一个只写着「点选卡片切换」的空壳标题没有信息量
      isVisible: !!detailListingId,
      listing,
      detail: listingDetail,
      isLoading: isLoadingDetail,
      error: detailError,
      isDrawerOpen: isDetailDrawerOpen,
      isFavorite: !!detailListingId && favoriteIds.includes(detailListingId),
    };
  },
);

export function useListingDetailModel() {
  return useAppSelector(selectListingDetailModel);
}
