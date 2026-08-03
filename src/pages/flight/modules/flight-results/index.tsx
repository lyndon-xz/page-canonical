import { Button, Empty, Spin } from "antd";
import { useRef } from "react";

import { FetchStatus } from "@/lib/fetch-status";

import { useRegisterLive } from "../../live";

import { useFlightResultsActions } from "./actions";
import FlightCard from "./components/flight-card";
import SortBar from "./components/sort-bar";
import { FlightResultsModel } from "./model";

import styles from "./index.module.scss";

function FlightResultsInner() {
  const { sortedFlights, flightsStatus, selectedFlightId } =
    FlightResultsModel.useContainer();
  const { retry } = useFlightResultsActions();

  // 经页面 live 表交给 search-bar 滚动定位，避免两模块互相 import
  const containerRef = useRef<HTMLElement>(null);
  useRegisterLive("flightResultsRef", containerRef);

  return (
    <section ref={containerRef} className={styles.flightResults}>
      <header className={styles.header}>
        <h2 className={styles.title}>航班列表</h2>
        <SortBar />
      </header>

      {flightsStatus === FetchStatus.Loading ? (
        <div className={styles.stateBox}>
          <Spin />
        </div>
      ) : flightsStatus === FetchStatus.Error ? (
        <div className={styles.stateBox}>
          <p className={styles.errorText}>航班列表加载失败</p>
          <Button size="small" onClick={retry}>
            重试
          </Button>
        </div>
      ) : sortedFlights.length === 0 ? (
        <div className={styles.stateBox}>
          <Empty description="暂无匹配的航班" />
        </div>
      ) : (
        <div className={styles.list}>
          {sortedFlights.map((flight) => (
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

export default function FlightResults() {
  return (
    <FlightResultsModel.Provider>
      <FlightResultsInner />
    </FlightResultsModel.Provider>
  );
}
