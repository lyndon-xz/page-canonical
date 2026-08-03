import { message } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import {
  cancelInquiry as cancelInquiryService,
  fetchListingDetail,
  fetchListings,
  submitInquiry as submitInquiryService,
  toggleFavorite as toggleFavoriteService,
} from "./data/services";
import {
  ConfirmScene,
  type InquiryForm,
  type ListingFilters,
} from "./shared/types";
import {
  clearDetailContext,
  setAppliedFilters,
  setConfirmScene,
  setDetailListingId,
  setDetailStatus,
  setFavoriteIds,
  setInquirySubmitted,
  setIsDetailDrawerOpen,
  setIsSubmittingInquiry,
  setListingDetail,
  setListings,
  setListingsStatus,
  setSelectedListingId,
} from "./slice";
import { reportTrace } from "./shared/trace";
import { selectTraceCommonTag, store } from "./store";

/**
 * 详情请求的序号守卫：连续点开不同房源时，先发的请求可能后到，
 * 直接写入会让详情与当前选中的房源不符。每次请求领取自增序号，过期序号的响应一律丢弃。
 *
 * 不放进 store 是因为它只服务请求编排、UI 从不消费；
 * 用自增序号而非「参数去重」，是为了让重复点开同一房源仍能重新拉取（去重会漏掉重试场景）。
 * 它只管「谁是最新请求」，「结果还有人要吗」由 loadListingDetail 另行校验。
 */
let latestDetailRequestId = 0;

export const pageActions = {
  /**
   * 埋点的唯一出口：通用参数从 store 取，调用方只给事件名与本次操作特有的参数。
   *
   * 须在状态变更之前调用：通用参数表达「点击发生时页面处于什么上下文」，
   * 本次操作的目标由 extra 带。先改状态再上报，选中类事件就会把新选中当成旧上下文。
   */
  trackClick(event: string, extra: Record<string, string> = {}) {
    reportTrace(event, {
      ...selectTraceCommonTag(store.getState()),
      ...extra,
    });
  },

  async loadListings(filters: ListingFilters) {
    store.dispatch(setAppliedFilters(filters));
    store.dispatch(setListingsStatus(FetchStatus.Loading));

    /*
     * 请求发出前先把上一轮结果作废。
     *
     * store 是页面级单例、不随页面卸载重置，重进本页或换筛选条件时旧值都还在：
     * 少了这段，loading 期间「共 N 套」会报上一次的数字，选中态与详情也会指向
     * 已经不在结果里的房源。收藏（favoriteIds）不清——那是跨结果集的用户数据。
     */
    store.dispatch(setListings([]));
    store.dispatch(setSelectedListingId(null));
    store.dispatch(clearDetailContext());
    store.dispatch(setConfirmScene(null));

    try {
      const listings = await fetchListings(filters);
      store.dispatch(setListings(listings));
      store.dispatch(setListingsStatus(FetchStatus.Ready));
    } catch {
      store.dispatch(setListingsStatus(FetchStatus.Error));
    }
  },

  /** 供错误态的重试入口调用：沿用已生效的筛选条件，不必让用户重走一遍 URL */
  retryListings() {
    void pageActions.loadListings(store.getState().page.appliedFilters);
  },

  async loadListingDetail(listingId: string) {
    const requestId = (latestDetailRequestId += 1);

    /*
     * 本次响应是否还该落库，两个条件缺一不可：
     * 序号最新排掉被后续请求顶掉的，目标未变排掉详情已被清空或已换房源的。
     * 少了后者，请求在飞时清空详情（如提交询价成功）仍会把这份详情写回空掉的 store。
     */
    const isCurrent = () =>
      requestId === latestDetailRequestId &&
      store.getState().page.detailListingId === listingId;

    store.dispatch(setDetailStatus(FetchStatus.Loading));
    try {
      const detail = await fetchListingDetail(listingId);
      if (!isCurrent()) {
        return;
      }
      store.dispatch(setListingDetail(detail));
      store.dispatch(setDetailStatus(FetchStatus.Ready));
    } catch {
      // 过期请求连状态都不该动，否则会把仍在飞的那次请求的 loading 提前收掉
      if (!isCurrent()) {
        return;
      }
      store.dispatch(setDetailStatus(FetchStatus.Error));
    }
  },

  /**
   * 切换「看哪个房源的详情」：详情先落在列表下方的内联区。
   * detailListingId 决定看谁，isDetailDrawerOpen 决定在哪看，两者分开，
   * 抽屉便能直接复用已拉到的同一份数据，不必二次请求。
   */
  async viewDetail(listingId: string) {
    store.dispatch(setDetailListingId(listingId));
    await pageActions.loadListingDetail(listingId);
  },

  openDetailDrawer() {
    store.dispatch(setIsDetailDrawerOpen(true));
  },

  closeDetailDrawer() {
    store.dispatch(setIsDetailDrawerOpen(false));
  },

  retryDetail() {
    const { detailListingId } = store.getState().page;

    if (!detailListingId) {
      return;
    }
    void pageActions.loadListingDetail(detailListingId);
  },

  openConfirm(scene: ConfirmScene) {
    store.dispatch(setConfirmScene(scene));
  },

  closeConfirm() {
    store.dispatch(setConfirmScene(null));
  },

  /**
   * 收藏写入的唯一出口，失败向上抛。
   * 两条调用路径对失败的处置不同，故错误处理留给调用方：
   * 确认弹窗要把错误留在弹窗内，直接收藏走 toast（见 addFavorite）。
   */
  async commitFavorite(listingId: string) {
    const { favoriteIds } = store.getState().page;
    const wasFavorite = favoriteIds.includes(listingId);

    await toggleFavoriteService(listingId);
    store.dispatch(
      setFavoriteIds(
        wasFavorite
          ? favoriteIds.filter((id) => id !== listingId)
          : [...favoriteIds, listingId],
      ),
    );
  },

  /**
   * 新增收藏无需二次确认，失败也不改变界面结构，故用 toast 反馈。
   * 不吞掉——没人接的 rejection 等于失败静默。
   */
  async addFavorite(listingId: string) {
    try {
      await pageActions.commitFavorite(listingId);
    } catch (err) {
      message.error(err instanceof Error ? err.message : String(err));
    }
  },

  // 不接错误，只保证 loading 收尾：字段级错误要回填到表单，得由调用方拿到原错误分流
  async submitInquiry(values: InquiryForm) {
    store.dispatch(setIsSubmittingInquiry(true));
    store.dispatch(setInquirySubmitted(false));
    try {
      await submitInquiryService(values);
      store.dispatch(setInquirySubmitted(true));
    } finally {
      store.dispatch(setIsSubmittingInquiry(false));
    }
  },

  async cancelInquiry() {
    await cancelInquiryService();
    store.dispatch(setInquirySubmitted(false));
  },
};
