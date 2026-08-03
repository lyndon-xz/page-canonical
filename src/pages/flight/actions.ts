import { useCallback, useRef } from "react";

import { FetchStatus } from "@/lib/fetch-status";

import {
  fetchBookingEligibility,
  fetchFareBlockReasons,
  fetchFareRules,
  fetchFlights,
  submitBooking as submitBookingService,
} from "./data/services";
import { isBookingAllowed } from "./shared/gate";
import { serializeFilters } from "./shared/params";
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

  /**
   * 退改规则请求的序号守卫：快速切换选中航班时，先发的请求可能后到，
   * 直接写入会让规则与当前选中的航班不符。每次请求领取自增序号，只有最新序号的响应允许落库。
   *
   * 放 ref 而非 state——它只服务请求编排、UI 从不读它，进 state 会白白多一次渲染；
   * 用自增序号而非「参数去重」，是为了让重复选中同一航班仍能重新拉取（去重会漏掉重试场景）。
   */
  const latestFareRulesRequestIdRef = useRef(0);

  // 被 initPage 依赖、并间接被 usePageEffects 的 useEffect 依赖，需要稳定引用
  const loadFlights = useCallback(
    async (filters: FlightFilters) => {
      setAppliedFilters(filters);
      setFlightsStatus(FetchStatus.Loading);

      /*
       * 请求发出前先把上一轮结果作废，否则 loading 期间「找到 N 个航班」报的是上一次的数字，
       * 选中航班与其退改规则也会指向已经不在结果里的班次。
       *
       * 本页换栈到 unstated-next 后，重进页面时 Provider 重建、useState 天然回到初值，
       * 这段只为「换筛选条件」这条路径而写——zustand 与 RTK 的 store 是模块单例，两条路径都需要它。
       */
      setFlights([]);
      setSelectedFlightId(null);
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

  /**
   * 首屏编排：先判预订资格，闸门不通过就不再拉航班与退改规则。
   * 资格接口失败按「不通过」处理，宁可少展示，也不给出可能无效的预订入口。
   */
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
        // 重进页面或重试时要清掉上一次的资格，否则闸门会沿用已失效的结论
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

  /** 供错误态的重试入口调用：沿用已生效的筛选条件，不必让用户重走一遍 URL */
  const retryFlights = () => {
    void loadFlights(appliedFilters);
  };

  /** 规则与阻断原因来自两个接口、互不依赖，并行取回后一起落库 */
  const loadFareRules = async (flightId: string) => {
    const requestId = (latestFareRulesRequestIdRef.current += 1);
    // 过期请求连状态都不该动，否则会把仍在飞的那次请求的 loading 提前收掉
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

  /** 选中航班连带拉取其退改规则：选中态与规则必须同步变更，故收在同一个 action */
  const selectFlight = async (flightId: string) => {
    setSelectedFlightId(flightId);
    await loadFareRules(flightId);
  };

  /** 供错误态的重试入口调用，避免用户只能刷新整页 */
  const retryFareRules = () => {
    if (!selectedFlightId) {
      return;
    }

    void loadFareRules(selectedFlightId);
  };

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

  return {
    loadFlights,
    initPage,
    applyFilters,
    retryFlights,
    loadFareRules,
    selectFlight,
    retryFareRules,
    submitBooking,
  };
}
