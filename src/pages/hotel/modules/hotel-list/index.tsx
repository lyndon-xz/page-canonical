import { Alert, Button, Checkbox, Empty, Spin } from "antd";
import { useRef } from "react";

import { FetchStatus } from "@/lib/fetch-status";

import { useRegisterLive } from "../../live";

import { hotelListActions } from "./actions";
import HotelCard from "./components/hotel-card";
import SortBar from "./components/sort-bar";
import { useHotelListEffects } from "./effects";
import { useHotelListModel } from "./model";

import styles from "./index.module.scss";

export default function HotelList() {
  const {
    hotels,
    hotelsStatus,
    selectedHotelId,
    hasMore,
    loadMoreStatus,
    favoriteIds,
    selectedHotelIds,
    isBatchFavoriting,
    batchFailureNames,
    isAllLoadedSelected,
  } = useHotelListModel();

  const listRef = useRef<HTMLElement>(null);
  useRegisterLive("hotelListRef", listRef);

  // 哨兵的渲染条件与观察器的挂载条件必须是同一个表达式，各写一遍会出现哨兵在 DOM 里但没人观察
  const showSentinel =
    hotelsStatus === FetchStatus.Ready &&
    loadMoreStatus === FetchStatus.Ready &&
    hotels.length > 0 &&
    hasMore;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useHotelListEffects(sentinelRef, showSentinel);

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
              onChange={() =>
                hotelListActions.toggleSelectAll(isAllLoadedSelected)
              }
            >
              全选本页
            </Checkbox>
          )}
        </div>
        <SortBar />
      </header>

      {/* 点名失败项而不是只说「部分失败」：用户需要知道该重试哪几家 */}
      {batchFailureNames.length > 0 && (
        <Alert
          type="warning"
          showIcon
          closable
          className={styles.batchAlert}
          message={`${batchFailureNames.length} 家收藏失败，已保留勾选可重试`}
          description={batchFailureNames.join("；")}
          onClose={hotelListActions.dismissBatchFavoriteFailures}
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
            onClick={hotelListActions.batchFavorite}
          >
            批量收藏
          </Button>
          <Button size="small" onClick={hotelListActions.clearSelection}>
            清空
          </Button>
        </div>
      )}

      {hotelsStatus === FetchStatus.Loading ? (
        <div className={styles.stateBox}>
          <Spin />
        </div>
      ) : hotelsStatus === FetchStatus.Error ? (
        <div className={styles.stateBox}>
          <p className={styles.errorText}>酒店列表加载失败</p>
          <Button size="small" onClick={hotelListActions.retry}>
            重试
          </Button>
        </div>
      ) : hotels.length === 0 ? (
        <div className={styles.stateBox}>
          <Empty description="暂无匹配的酒店" />
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                selected={hotel.id === selectedHotelId}
                favorite={favoriteIds.includes(hotel.id)}
                checked={selectedHotelIds.includes(hotel.id)}
              />
            ))}
          </div>

          {loadMoreStatus === FetchStatus.Error ? (
            <div className={styles.loadMoreBox}>
              <span className={styles.errorText}>下一页加载失败</span>
              <Button size="small" onClick={hotelListActions.loadMore}>
                重试
              </Button>
            </div>
          ) : loadMoreStatus === FetchStatus.Loading ? (
            <div className={styles.loadMoreBox}>
              <Spin size="small" />
            </div>
          ) : showSentinel ? (
            <div ref={sentinelRef} className={styles.sentinel} />
          ) : (
            <p className={styles.listEnd}>没有更多了</p>
          )}
        </>
      )}
    </section>
  );
}
