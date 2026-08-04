import { Button, Empty, Spin } from "antd";
import type { RefObject } from "react";

import { FetchStatus } from "@/lib/fetch-status";

import { hotelListActions } from "../../actions";
import { useHotelListModel } from "../../model";
import HotelCard from "../hotel-card";
import LoadMoreFooter from "../load-more-footer";

import styles from "./index.module.scss";

const { retry } = hotelListActions;

interface ListBodyProps {
  /** 由父组件算好传入，与喂给观察器的是同一个值，避免渲染条件和观察条件分叉 */
  showSentinel: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
}

export default function ListBody(props: ListBodyProps) {
  const { showSentinel, sentinelRef } = props;
  const {
    hotels,
    hotelsStatus,
    selectedHotelId,
    loadMoreStatus,
    favoriteIds,
    selectedHotelIds,
  } = useHotelListModel();

  if (hotelsStatus === FetchStatus.Loading) {
    return (
      <div className={styles.stateBox}>
        <Spin />
      </div>
    );
  }

  if (hotelsStatus === FetchStatus.Error) {
    return (
      <div className={styles.stateBox}>
        <p className={styles.errorText}>酒店列表加载失败</p>
        <Button size="small" onClick={retry}>
          重试
        </Button>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className={styles.stateBox}>
        <Empty description="暂无匹配的酒店" />
      </div>
    );
  }

  return (
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

      <LoadMoreFooter
        status={loadMoreStatus}
        showSentinel={showSentinel}
        sentinelRef={sentinelRef}
      />
    </>
  );
}
