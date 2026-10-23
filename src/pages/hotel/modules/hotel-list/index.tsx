import { Alert, Button, Checkbox } from 'antd';
import { useRef } from 'react';

import { hotelListActions } from './actions';
import ListBody from './components/list-body';
import SortBar from './components/sort-bar';
import { useLoadMoreOnSentinel, useScrollBackOnResultSet } from './effects';
import { useHotelListModel } from './model';

import styles from './index.module.scss';

const { toggleSelectAll, clearSelection, batchFavorite, dismissBatchFavoriteFailures } =
  hotelListActions;

export default function HotelList() {
  const {
    hotels,
    selectedHotelIds,
    isBatchFavoriting,
    batchFailureNames,
    isAllLoadedSelected,
    isPartiallySelected,
    shouldShowSentinel,
  } = useHotelListModel();
  const selectedCount = selectedHotelIds.length;
  const batchFailureCount = batchFailureNames.length;

  const listRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useScrollBackOnResultSet(listRef);
  useLoadMoreOnSentinel(sentinelRef, shouldShowSentinel);

  return (
    <section ref={listRef} className={styles.hotelList}>
      <header className={styles.header}>
        <div className={styles.headLeft}>
          <h2 className={styles.title}>酒店列表</h2>
          {hotels.length > 0 && (
            <Checkbox
              checked={isAllLoadedSelected}
              indeterminate={isPartiallySelected}
              onChange={() => {
                toggleSelectAll(isAllLoadedSelected);
              }}
            >
              全选本页
            </Checkbox>
          )}
        </div>
        <SortBar />
      </header>

      {batchFailureCount > 0 && (
        <Alert
          type="warning"
          showIcon
          className={styles.batchAlert}
          title={`${batchFailureCount} 家收藏失败，已保留勾选可重试`}
          description={batchFailureNames.join('；')}
          closable={{ onClose: dismissBatchFavoriteFailures }}
        />
      )}

      {selectedCount > 0 && (
        <div className={styles.batchBar}>
          <span className={styles.batchCount}>已选 {selectedCount} 家</span>
          <Button size="small" type="primary" loading={isBatchFavoriting} onClick={batchFavorite}>
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
