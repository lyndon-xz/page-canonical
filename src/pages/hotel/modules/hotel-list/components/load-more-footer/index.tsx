import { Button, Spin } from "antd";
import type { RefObject } from "react";

import { FetchStatus } from "@/lib/fetch-status";

import { hotelListActions } from "../../actions";
import { useHotelListModel } from "../../model";

import styles from "./index.module.scss";

const { loadMore } = hotelListActions;

interface LoadMoreFooterProps {
  sentinelRef: RefObject<HTMLDivElement | null>;
}

export default function LoadMoreFooter(props: LoadMoreFooterProps) {
  const { sentinelRef } = props;
  const { loadMoreStatus, showSentinel } = useHotelListModel();

  if (loadMoreStatus === FetchStatus.Error) {
    return (
      <div className={styles.loadMoreBox}>
        <span className={styles.errorText}>下一页加载失败</span>
        <Button size="small" onClick={loadMore}>
          重试
        </Button>
      </div>
    );
  }

  if (loadMoreStatus === FetchStatus.Loading) {
    return (
      <div className={styles.loadMoreBox}>
        <Spin size="small" />
      </div>
    );
  }

  if (showSentinel) {
    return <div ref={sentinelRef} className={styles.sentinel} />;
  }

  return <p className={styles.listEnd}>没有更多了</p>;
}
