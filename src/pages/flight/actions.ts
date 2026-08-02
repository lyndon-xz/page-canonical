import { useCallback, useRef } from "react";

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
    setIsLoadingFlights,
    setFlightsError,
    selectedFlightId,
    setSelectedFlightId,
    setEligibility,
    setIsLoadingEligibility,
    setFareRules,
    setIsLoadingFareRules,
    setFareRulesError,
    setFareBlockReasons,
    setIsSubmittingBooking,
    setBookingError,
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
      setIsLoadingFlights(true);
      setFlightsError(null);

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
      setFareRulesError(null);

      try {
        const flights = await fetchFlights(filters);
        setFlights(flights);
      } catch (err) {
        setFlightsError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoadingFlights(false);
      }
    },
    [
      setFareBlockReasons,
      setFareRules,
      setFareRulesError,
      setFlights,
      setFlightsError,
      setIsLoadingFlights,
      setSelectedFlightId,
    ],
  );

  /**
   * 首屏编排：先判预订资格，闸门不通过就不再拉航班与退改规则。
   * 资格接口失败按「不通过」处理，宁可少展示，也不给出可能无效的预订入口。
   */
  const initPage = useCallback(
    async (filters: FlightFilters) => {
      setIsLoadingEligibility(true);
      try {
        const eligibility = await fetchBookingEligibility();
        setEligibility(eligibility);

        if (!isBookingAllowed(eligibility)) {
          return;
        }

        await loadFlights(filters);
      } catch {
        setEligibility(null);
      } finally {
        setIsLoadingEligibility(false);
      }
    },
    [loadFlights, setEligibility, setIsLoadingEligibility],
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

  /** 规则与阻断原因来自两个接口、互不依赖，并行取回后一起落库 */
  const loadFareRules = async (flightId: string) => {
    const requestId = (latestFareRulesRequestIdRef.current += 1);

    setIsLoadingFareRules(true);
    setFareRulesError(null);
    try {
      const [rules, blockReasons] = await Promise.all([
        fetchFareRules(flightId),
        fetchFareBlockReasons(flightId),
      ]);

      if (requestId !== latestFareRulesRequestIdRef.current) {
        return;
      }

      setFareRules(rules);
      setFareBlockReasons(blockReasons);
    } catch (err) {
      if (requestId !== latestFareRulesRequestIdRef.current) {
        return;
      }

      setFareRulesError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      // loading 只由最新请求关闭，否则过期请求会提前收掉进行中请求的 loading
      if (requestId === latestFareRulesRequestIdRef.current) {
        setIsLoadingFareRules(false);
      }
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

  // 记下 error 后仍要 rethrow：调用方 action 需要拿到原错误把字段级错误回填到表单
  const submitBooking = async (values: BookingForm) => {
    setIsSubmittingBooking(true);
    setBookingError(null);
    setBookingSubmitted(false);
    try {
      await submitBookingService(values);
      setBookingSubmitted(true);
    } catch (err) {
      setBookingError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return {
    initPage,
    loadFlights,
    applyFilters,
    selectFlight,
    loadFareRules,
    retryFareRules,
    submitBooking,
  };
}
