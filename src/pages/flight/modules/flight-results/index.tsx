import { Empty, Spin } from "antd";
import { useImperativeHandle, useRef } from "react";

import { useRegisterLive } from "@/lib/live";

import FlightCard from "./components/flight-card";
import SortBar from "./components/sort-bar";
import { useFlightResultsModel } from "./model";
import type { FlightResultsHandle } from "../../shared/types";

import styles from "./index.module.scss";

/** 多组件模块：index.tsx 只做组装，并向 liveStore 暴露命令式句柄 */
export default function FlightResults() {
  const { sortedList, isLoading, selectedFlightId } = useFlightResultsModel();

  // 本模块容器 ref（命令式滚动目标）
  const containerRef = useRef<HTMLElement>(null);
  // 承载命令式句柄的 ref
  const handleRef = useRef<FlightResultsHandle>(null);

  // 用 useImperativeHandle 建立命令式句柄：把「滚动到本模块容器顶部」封装为 scrollToTop
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

  // 句柄 ref 作为活对象登记进 liveStore，供 search-bar 提交后跨模块命令式调用（两模块互不 import）
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
