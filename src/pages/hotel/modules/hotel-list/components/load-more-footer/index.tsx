import { Button, Spin } from "antd";
import type { RefObject } from "react";

import { FetchStatus } from "@/lib/fetch-status";

import { hotelListActions } from "../../actions";

import styles from "./index.module.scss";

interface LoadMoreFooterProps {
  status: FetchStatus;
  /** 由父组件算好传入，与喂给观察器的是同一个值，避免渲染条件和观察条件分叉 */
  showSentinel: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
}

export default function LoadMoreFooter(props: LoadMoreFooterProps) {
  const { status, showSentinel, sentinelRef } = props;

  if (status === FetchStatus.Error) {
    return (
      <div className={styles.loadMoreBox}>
        <span className={styles.errorText}>下一页加载失败</span>
        <Button size="small" onClick={hotelListActions.loadMore}>
          重试
        </Button>
      </div>
    );
  }

  if (status === FetchStatus.Loading) {
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
