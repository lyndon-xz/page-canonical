import { Empty, Spin } from "antd";

import ListingCard from "./components/listing-card";
import { ListingListModel } from "./model";

import styles from "./index.module.scss";

/** 组装层：消费本模块 model 渲染房源列表 */
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

/** unstated-next 需在模块入口包裹 Provider（PageStore.Provider 之内、Model.Provider 之层） */
export default function ListingList() {
  return (
    <ListingListModel.Provider>
      <ListingListInner />
    </ListingListModel.Provider>
  );
}
