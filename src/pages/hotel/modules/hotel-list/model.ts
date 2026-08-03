import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { usePageStore } from "../../store";

/*
 * 本模块没有私有状态：排序是取数参数、归页面层（见 shared/types.ts 的 SearchParams.sortBy），
 * 列表也不在前端排序，服务端每页都返回全量排序后的切片。
 */
export function useHotelListModel() {
  const {
    hotels,
    hotelsStatus,
    selectedHotelId,
    sortBy,
    hasMore,
    loadMoreStatus,
    favoriteIds,
    selectedHotelIds,
    isBatchFavoriting,
    batchFavoriteFailures,
  } = usePageStore(
    useShallow((s) => ({
      hotels: s.hotels,
      hotelsStatus: s.hotelsStatus,
      selectedHotelId: s.selectedHotelId,
      sortBy: s.appliedParams.sortBy,
      hasMore: s.hasMore,
      loadMoreStatus: s.loadMoreStatus,
      favoriteIds: s.favoriteIds,
      selectedHotelIds: s.selectedHotelIds,
      isBatchFavoriting: s.isBatchFavoriting,
      batchFavoriteFailures: s.batchFavoriteFailures,
    })),
  );

  // 失败提示要点名酒店，故在此把 id 换成名字；store 只存 id，不存会过期的名字快照
  const batchFailureNames = useMemo(
    () =>
      batchFavoriteFailures.map((failure) => {
        const hotel = hotels.find((item) => item.id === failure.hotelId);

        return `${hotel?.name ?? failure.hotelId}（${failure.reason}）`;
      }),
    [batchFavoriteFailures, hotels],
  );

  return {
    hotels,
    hotelsStatus,
    selectedHotelId,
    sortBy,
    hasMore,
    loadMoreStatus,
    favoriteIds,
    selectedHotelIds,
    isBatchFavoriting,
    batchFailureNames,
    /** 已加载的都勾上了才算全选；空列表不算 */
    isAllLoadedSelected:
      hotels.length > 0 && selectedHotelIds.length === hotels.length,
  };
}
