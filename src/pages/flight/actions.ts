import { useCallback, useRef } from "react";

import { FetchStatus } from "@/lib/fetch-status";

import {
  fetchBookingEligibility,
  fetchFareBlockReasons,
  fetchFareRules,
  fetchFlights,
  submitBooking as submitBookingService,
} from "./data/services";
import { isBookingAllowed } from "./gate";
import { serializeFilters } from "./params";
import type { BookingForm, FlightFilters } from "./shared/types";
import { PageStore } from "./store";

export function usePageActions() {
  const {
    setFlights,
    setFlightsStatus,
    appliedFilters,
    setAppliedFilters,
    selectedFlightId,
    setSelectedFlightId,
    setEligibility,
    setFareRules,
    setFareRulesStatus,
    setFareBlockReasons,
    setIsSubmittingBooking,
    setBookingSubmitted,
  } = PageStore.useContainer();

  /** 快速切换航班时先发的请求可能后到，只有最新序号的响应允许落库 */
  const latestFareRulesRequestIdRef = useRef(0);

  // ── 航班列表 ──

  // 被 effect 的依赖数组间接依赖，需稳定引用
  const loadFlights = useCallback(
    async (filters: FlightFilters) => {
      setAppliedFilters(filters);
      setFlightsStatus(FetchStatus.Loading);

      // 先作废上一轮结果，否则 loading 期间的航班数与选中航班仍指向上一次的班次
      setFlights([]);
      setSelectedFlightId(null);
      // 推进序号让未返回的规则请求过期，否则它会把规则写回这里刚清空的 store
      latestFareRulesRequestIdRef.current += 1;
      setFareRules([]);
      setFareBlockReasons([]);
      setFareRulesStatus(FetchStatus.Ready);

      try {
        const flights = await fetchFlights(filters);
        setFlights(flights);
        setFlightsStatus(FetchStatus.Ready);
      } catch {
        setFlightsStatus(FetchStatus.Error);
      }
    },
    [
      setAppliedFilters,
      setFareBlockReasons,
      setFareRules,
      setFareRulesStatus,
      setFlights,
      setFlightsStatus,
      setSelectedFlightId,
    ],
  );

  /** 资格接口失败按「不通过」处理，宁可少展示，也不给出可能无效的预订入口 */
  const initPage = useCallback(
    async (filters: FlightFilters) => {
      try {
        const eligibility = await fetchBookingEligibility();
        setEligibility(eligibility);

        if (!isBookingAllowed(eligibility)) {
          return;
        }

        await loadFlights(filters);
      } catch {
        setEligibility(null);
      }
    },
    [loadFlights, setEligibility],
  );

  const applyFilters = (filters: FlightFilters) => {
    void loadFlights(filters);
    const query = new URLSearchParams(serializeFilters(filters)).toString();

    history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  };

  const retryFlights = () => {
    void loadFlights(appliedFilters);
  };

  // ── 运价规则 ──

  const loadFareRules = async (flightId: string) => {
    const requestId = (latestFareRulesRequestIdRef.current += 1);
    // 过期请求连状态都不该动，否则会把仍进行中的那次请求的 loading 提前收掉
    const isCurrent = () => requestId === latestFareRulesRequestIdRef.current;

    setFareRulesStatus(FetchStatus.Loading);
    try {
      const [rules, blockReasons] = await Promise.all([
        fetchFareRules(flightId),
        fetchFareBlockReasons(flightId),
      ]);

      if (!isCurrent()) {
        return;
      }

      setFareRules(rules);
      setFareBlockReasons(blockReasons);
      setFareRulesStatus(FetchStatus.Ready);
    } catch {
      if (!isCurrent()) {
        return;
      }

      setFareRulesStatus(FetchStatus.Error);
    }
  };

  const selectFlight = async (flightId: string) => {
    setSelectedFlightId(flightId);
    await loadFareRules(flightId);
  };

  const retryFareRules = () => {
    if (!selectedFlightId) {
      return;
    }

    void loadFareRules(selectedFlightId);
  };

  // ── 提交预订 ──

  // 不接错误，只保证 loading 收尾：字段级错误要回填到表单，得由调用方拿到原错误分流
  const submitBooking = async (values: BookingForm) => {
    setIsSubmittingBooking(true);
    setBookingSubmitted(false);
    try {
      await submitBookingService(values);
      setBookingSubmitted(true);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // 只暴露模块层与 effects 真正消费的操作，取数实现留在内部
  return {
    initPage,
    applyFilters,
    retryFlights,
    selectFlight,
    retryFareRules,
    submitBooking,
  };
}
