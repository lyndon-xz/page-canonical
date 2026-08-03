import { Button, Empty, Spin, Tag } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import { listingDetailActions } from "../../actions";
import { useListingDetailModel } from "../../model";

import styles from "./index.module.scss";

interface DetailBodyProps {
  /**
   * 是否渲染在抽屉内。
   *
   * 同一份详情在列表下方与抽屉里各渲染一次：内联区只读，抽屉里才给操作。
   * 用位置参数分流而不是复制两份组件——字段一变两份都要改，迟早漂移。
   */
  inDrawer?: boolean;
}

export default function DetailBody(props: DetailBodyProps) {
  const { inDrawer = false } = props;
  const { listing, detail, detailStatus, isFavorite } = useListingDetailModel();
  const {
    openDetailDrawer,
    retryDetail,
    toggleFavorite,
    requestCancelInquiry,
  } = listingDetailActions;

  if (detailStatus === FetchStatus.Loading) {
    return (
      <div className={styles.stateBox}>
        <Spin />
      </div>
    );
  }

  if (detailStatus === FetchStatus.Error) {
    return (
      <div className={styles.stateBox}>
        <p className={styles.errorText}>详情加载失败</p>
        <Button size="small" onClick={retryDetail}>
          重试
        </Button>
      </div>
    );
  }

  // 模块只在选中房源后渲染，走到这里意味着选中的房源已不在当前列表里（如列表重新拉过）
  if (!listing || !detail) {
    return (
      <div className={styles.stateBox}>
        <Empty description="该房源已不在当前列表，请重新选择" />
      </div>
    );
  }

  return (
    <div>
      <h3 className={styles.title}>{listing.title}</h3>
      <p className={styles.meta}>
        {listing.city} · {listing.roomType} · 房东 {detail.hostName}
      </p>
      <p className={styles.description}>{detail.description}</p>

      <div className={styles.amenities}>
        {detail.amenities.map((amenity) => (
          <Tag key={amenity} className={styles.amenity}>
            {amenity}
          </Tag>
        ))}
      </div>

      <p className={styles.policyLabel}>退订政策</p>
      <p className={styles.policy}>{detail.cancellationPolicy}</p>

      {inDrawer ? (
        <div className={styles.actions}>
          <Button onClick={toggleFavorite}>
            {isFavorite ? "取消收藏" : "收藏房源"}
          </Button>
          <Button danger onClick={requestCancelInquiry}>
            撤回询价
          </Button>
        </div>
      ) : (
        <Button
          type="link"
          className={styles.expandLink}
          onClick={openDetailDrawer}
        >
          展开完整详情
        </Button>
      )}
    </div>
  );
}
