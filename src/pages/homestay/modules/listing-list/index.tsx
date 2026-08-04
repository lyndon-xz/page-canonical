import { Button, Empty, Spin } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import { listingListActions } from "./actions";
import ListingCard from "./components/listing-card";
import { useListingListModel } from "./model";

import styles from "./index.module.scss";

const { retry } = listingListActions;

function ListingListBody() {
  const { listings, listingsStatus, selectedListingId } = useListingListModel();

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
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          selected={listing.id === selectedListingId}
        />
      ))}
    </div>
  );
}

export default function ListingList() {
  const { listingsCount } = useListingListModel();

  return (
    <section className={styles.listingList}>
      <header className={styles.header}>
        <h2 className={styles.title}>民宿房源</h2>
        <span className={styles.count}>共 {listingsCount} 套</span>
      </header>

      <ListingListBody />
    </section>
  );
}
