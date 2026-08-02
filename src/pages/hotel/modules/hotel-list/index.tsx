import { Empty, Spin } from "antd";
import { useRef } from "react";

import { useRegisterLive } from "@/lib/live";

import HotelCard from "./components/hotel-card";
import SortBar from "./components/sort-bar";
import { useHotelListModel } from "./model";

import styles from "./index.module.scss";

export default function HotelList() {
  const { sortedList, isLoading, selectedHotelId } = useHotelListModel();

  // 经 liveStore 交给 search-filter 滚动定位，避免两模块互相 import
  const listRef = useRef<HTMLElement>(null);
  useRegisterLive("hotelListRef", listRef);

  return (
    <section ref={listRef} className={styles.hotelList}>
      <header className={styles.header}>
        <h2 className={styles.title}>酒店列表</h2>
        <SortBar />
      </header>

      {isLoading ? (
        <div className={styles.stateBox}>
          <Spin />
        </div>
      ) : sortedList.length === 0 ? (
        <div className={styles.stateBox}>
          <Empty description="暂无匹配的酒店" />
        </div>
      ) : (
        <div className={styles.grid}>
          {sortedList.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              selected={hotel.id === selectedHotelId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
