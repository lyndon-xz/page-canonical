import { Empty, Spin } from "antd";

import ListingCard from "./components/listing-card";
import { ListingListModel } from "./model";

import styles from "./index.module.scss";

function ListingListInner() {
  const { listingList, isLoadingList, selectedListingId } =
    ListingListModel.useContainer();

  return (
    <section className={styles.listingList}>
      <header className={styles.header}>
        <h2 className={styles.title}>民宿房源</h2>
        <span className={styles.count}>共 {listingList.length} 套</span>
      </header>

      {isLoadingList ? (
        <div className={styles.stateBox}>
          <Spin />
        </div>
      ) : listingList.length === 0 ? (
        <div className={styles.stateBox}>
          <Empty description="暂无匹配的民宿" />
        </div>
      ) : (
        <div className={styles.grid}>
          {listingList.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              selected={listing.id === selectedListingId}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function ListingList() {
  return (
    <ListingListModel.Provider>
      <ListingListInner />
    </ListingListModel.Provider>
  );
}
