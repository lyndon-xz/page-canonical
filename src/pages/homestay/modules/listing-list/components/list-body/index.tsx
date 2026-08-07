import { Button, Empty, Spin } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import { listingListActions } from "../../actions";
import { useListingListModel } from "../../model";
import ListingCard from "../listing-card";

import styles from "./index.module.scss";

const { retry } = listingListActions;

export default function ListBody() {
  const {
    listings,
    listingsStatus,
    selectedListingId,
    favoriteIds,
    favoritingIds,
  } = useListingListModel();

  if (listingsStatus === FetchStatus.Loading) {
    return (
      <div className={styles.stateBox}>
        <Spin />
      </div>
    );
  }

  if (listingsStatus === FetchStatus.Error) {
    return (
      <div className={styles.stateBox}>
        <p className={styles.errorText}>房源列表加载失败</p>
        <Button size="small" onClick={retry}>
          重试
        </Button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className={styles.stateBox}>
        <Empty description="暂无匹配的民宿" />
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {listings.map((listing) => {
        const { id } = listing;

        return (
          <ListingCard
            key={id}
            listing={listing}
            isSelected={id === selectedListingId}
            isFavorite={favoriteIds.includes(id)}
            isFavoriting={favoritingIds.includes(id)}
          />
        );
      })}
    </div>
  );
}
