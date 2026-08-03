import { Alert, Button, Checkbox, Empty, Spin } from "antd";
import { useRef } from "react";

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
    isLoading,
    error,
    selectedHotelId,
    hasMore,
    isLoadingMore,
    loadMoreError,
    favoriteIds,
    favoriteError,
    selectedHotelIds,
    isBatchFavoriting,
    batchFailureNames,
    isAllLoadedSelected,
  } = useHotelListModel();

  // 经 liveStore 交给 search-filter 滚动定位，避免两模块互相 import
  const listRef = useRef<HTMLElement>(null);
  useRegisterLive("hotelListRef", listRef);

  // 三个分支共用一处判定：哨兵渲染条件与观察器挂载条件必须同一个表达式，
  // 各写一遍就会出现「哨兵在 DOM 里但没人观察」的哑火
  const showSentinel =
    !isLoading &&
    !error &&
    hotels.length > 0 &&
    hasMore &&
    !isLoadingMore &&
    !loadMoreError;

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
              // 勾了一部分时给半选态，否则表头会谎称「一个都没选」
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

      {favoriteError && (
        <Alert
          type="warning"
          showIcon
          closable
          className={styles.favoriteAlert}
          message={favoriteError.message}
          onClose={hotelListActions.dismissFavoriteError}
        />
      )}

      {/* 点名失败项，而不是只说「部分失败」——用户需要知道该重试哪几家 */}
      {batchFailureNames.length > 0 && (
        <Alert
          type="warning"
          showIcon
          closable
          className={styles.favoriteAlert}
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

      {isLoading ? (
        <div className={styles.stateBox}>
          <Spin />
        </div>
      ) : error ? (
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

          {loadMoreError ? (
            <div className={styles.loadMoreBox}>
              <span className={styles.errorText}>下一页加载失败</span>
              <Button size="small" onClick={hotelListActions.loadMore}>
                重试
              </Button>
            </div>
          ) : isLoadingMore ? (
            <div className={styles.loadMoreBox}>
              <Spin size="small" />
            </div>
          ) : showSentinel ? (
            // 哨兵：进入视口即触发下一页，不占视觉空间
            <div ref={sentinelRef} className={styles.sentinel} />
          ) : (
            <p className={styles.listEnd}>没有更多了</p>
          )}
        </>
      )}
    </section>
  );
}
