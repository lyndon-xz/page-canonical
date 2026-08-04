import { Button, Empty, Spin } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import { useFlightResultsActions } from "../../actions";
import { FlightResultsModel } from "../../model";
import FlightCard from "../flight-card";

import styles from "./index.module.scss";

export default function ResultsBody() {
  const { sortedFlights, flightsStatus, selectedFlightId } =
    FlightResultsModel.useContainer();
  const { retry } = useFlightResultsActions();

  if (flightsStatus === FetchStatus.Loading) {
    return (
      <div className={styles.stateBox}>
        <Spin />
      </div>
    );
  }

  if (flightsStatus === FetchStatus.Error) {
    return (
      <div className={styles.stateBox}>
        <p className={styles.errorText}>航班列表加载失败</p>
        <Button size="small" onClick={retry}>
          重试
        </Button>
      </div>
    );
  }

  if (sortedFlights.length === 0) {
    return (
      <div className={styles.stateBox}>
        <Empty description="暂无匹配的航班" />
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {sortedFlights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          selected={flight.id === selectedFlightId}
        />
      ))}
    </div>
  );
}
