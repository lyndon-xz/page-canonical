import { useRef } from "react";

import { useRegisterLive } from "../../live";

import ResultsBody from "./components/results-body";
import SortBar from "./components/sort-bar";
import { FlightResultsModel } from "./model";

import styles from "./index.module.scss";

function FlightResultsInner() {
  const containerRef = useRef<HTMLElement>(null);
  useRegisterLive("flightResultsRef", containerRef);

  return (
    <section ref={containerRef} className={styles.flightResults}>
      <header className={styles.header}>
        <h2 className={styles.title}>航班列表</h2>
        <SortBar />
      </header>

      <ResultsBody />
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
