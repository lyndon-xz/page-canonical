import { Button, Empty, Spin, Tag } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import { listingDetailActions } from "../../actions";
import { useListingDetailModel } from "../../model";

import styles from "./index.module.scss";

const { openDetailDrawer, retryDetail, toggleFavorite } = listingDetailActions;

interface DetailBodyProps {
  isInDrawer?: boolean;
}

export default function DetailBody(props: DetailBodyProps) {
  const { isInDrawer = false } = props;
  const { listing, detail, detailStatus, isFavorite, isFavoriting } =
    useListingDetailModel();

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

  if (!listing || !detail) {
    return (
      <div className={styles.stateBox}>
        <Empty description="该房源已不在当前列表，请重新选择" />
      </div>
    );
  }

  const { title, city, roomType } = listing;
  const { description, amenities, hostName, cancellationPolicy } = detail;

  return (
    <div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.meta}>
        {city} · {roomType} · 房东 {hostName}
      </p>
      <p className={styles.description}>{description}</p>

      <div className={styles.amenities}>
        {amenities.map((amenity) => (
          <Tag key={amenity} className={styles.amenity}>
            {amenity}
          </Tag>
        ))}
      </div>

      <p className={styles.policyLabel}>退订政策</p>
      <p className={styles.policy}>{cancellationPolicy}</p>

      {isInDrawer ? (
        <div className={styles.actions}>
          <Button loading={isFavoriting} onClick={toggleFavorite}>
            {isFavorite ? "取消收藏" : "收藏房源"}
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
