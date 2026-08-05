import ListBody from "./components/list-body";
import { useListingListModel } from "./model";

import styles from "./index.module.scss";

export default function ListingList() {
  const { listingsCount } = useListingListModel();

  return (
    <section className={styles.listingList}>
      <header className={styles.header}>
        <h2 className={styles.title}>民宿房源</h2>
        <span className={styles.count}>共 {listingsCount} 套</span>
      </header>

      <ListBody />
    </section>
  );
}
