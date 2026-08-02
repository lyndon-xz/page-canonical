import { Empty, Spin } from "antd";
import { useImperativeHandle, useRef } from "react";

import { useRegisterLive } from "@/lib/live";

import FlightCard from "./components/flight-card";
import SortBar from "./components/sort-bar";
import { useFlightResultsModel } from "./model";
import type { FlightResultsHandle } from "../../shared/types";

import styles from "./index.module.scss";

export default function FlightResults() {
  const { sortedList, isLoading, selectedFlightId } = useFlightResultsModel();

  const containerRef = useRef<HTMLElement>(null);
  const handleRef = useRef<FlightResultsHandle>(null);

  useImperativeHandle(
    handleRef,
    () => ({
      scrollToTop() {
        containerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      },
    }),
    [],
  );

  // 经 liveStore 交给 search-bar 调用，避免两模块互相 import
  useRegisterLive("flightResults", handleRef);

  return (
    <section ref={containerRef} className={styles.flightResults}>
      <header className={styles.header}>
        <h2 className={styles.title}>航班列表</h2>
        <SortBar />
      </header>

      {isLoading ? (
        <div className={styles.stateBox}>
          <Spin />
        </div>
      ) : sortedList.length === 0 ? (
        <div className={styles.stateBox}>
          <Empty description="暂无匹配的航班" />
        </div>
      ) : (
        <div className={styles.list}>
          {sortedList.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              selected={flight.id === selectedFlightId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
