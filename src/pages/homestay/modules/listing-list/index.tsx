import { Alert, Empty, Spin } from "antd";

import { listingListActions } from "./actions";
import ListingCard from "./components/listing-card";
import { useListingListModel } from "./model";

import styles from "./index.module.scss";

export default function ListingList() {
  const {
    listings,
    listingsCount,
    isLoadingListings,
    selectedListingId,
    favoriteError,
  } = useListingListModel();

  return (
    <section className={styles.listingList}>
      <header className={styles.header}>
        <h2 className={styles.title}>民宿房源</h2>
        <span className={styles.count}>共 {listingsCount} 套</span>
      </header>

      {favoriteError && (
        <Alert
          type="warning"
          showIcon
          closable
          className={styles.favoriteAlert}
          message={favoriteError}
          onClose={listingListActions.dismissFavoriteError}
        />
      )}

      {isLoadingListings ? (
        <div className={styles.stateBox}>
          <Spin />
        </div>
      ) : listings.length === 0 ? (
        <div className={styles.stateBox}>
          <Empty description="暂无匹配的民宿" />
        </div>
      ) : (
        <div className={styles.grid}>
          {listings.map((listing) => (
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
