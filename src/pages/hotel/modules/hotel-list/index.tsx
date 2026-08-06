import { Alert, Button, Checkbox } from "antd";
import { useRef } from "react";

import { hotelListActions } from "./actions";
import ListBody from "./components/list-body";
import SortBar from "./components/sort-bar";
import { useLoadMoreOnSentinel, useScrollBackOnResultSet } from "./effects";
import { useHotelListModel } from "./model";

import styles from "./index.module.scss";

const {
  toggleSelectAll,
  dismissBatchFavoriteFailures,
  batchFavorite,
  clearSelection,
} = hotelListActions;

export default function HotelList() {
  const {
    hotels,
    selectedHotelIds,
    isBatchFavoriting,
    batchFailureNames,
    isAllLoadedSelected,
    showSentinel,
  } = useHotelListModel();

  const listRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useScrollBackOnResultSet(listRef);
  useLoadMoreOnSentinel(sentinelRef, showSentinel);

  return (
    <section ref={listRef} className={styles.hotelList}>
      <header className={styles.header}>
        <div className={styles.headLeft}>
          <h2 className={styles.title}>酒店列表</h2>
          {hotels.length > 0 && (
            <Checkbox
              checked={isAllLoadedSelected}
              indeterminate={
                selectedHotelIds.length > 0 && !isAllLoadedSelected
              }
              onChange={() => toggleSelectAll(isAllLoadedSelected)}
            >
              全选本页
            </Checkbox>
          )}
        </div>
        <SortBar />
      </header>

      {batchFailureNames.length > 0 && (
        <Alert
          type="warning"
          showIcon
          closable
          className={styles.batchAlert}
          message={`${batchFailureNames.length} 家收藏失败，已保留勾选可重试`}
          description={batchFailureNames.join("；")}
          onClose={dismissBatchFavoriteFailures}
        />
      )}

      {selectedHotelIds.length > 0 && (
        <div className={styles.batchBar}>
          <span className={styles.batchCount}>
            已选 {selectedHotelIds.length} 家
          </span>
          <Button
            size="small"
            type="primary"
            loading={isBatchFavoriting}
            onClick={batchFavorite}
          >
            批量收藏
          </Button>
          <Button size="small" onClick={clearSelection}>
            清空
          </Button>
        </div>
      )}

      <ListBody sentinelRef={sentinelRef} />
    </section>
  );
}
