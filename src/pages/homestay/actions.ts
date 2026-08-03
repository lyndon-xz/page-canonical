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

/** 连续点开不同房源时先发的请求可能后到，只有最新序号的响应允许落库 */
let latestDetailRequestId = 0;

export const pageActions = {
  /** 须在状态变更之前调用：通用参数表达「点击发生时页面处于什么上下文」 */
  trackClick(event: string, extra: Record<string, string> = {}) {
    reportTrace(event, {
      ...selectTraceCommonTag(store.getState()),
      ...extra,
    });
  },

  async loadListings(filters: ListingFilters) {
    store.dispatch(setAppliedFilters(filters));
    store.dispatch(setListingsStatus(FetchStatus.Loading));

    // 先作废上一轮结果；favoriteIds 不清，那是跨结果集的用户数据
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

  retryListings() {
    void pageActions.loadListings(store.getState().page.appliedFilters);
  },

  async loadListingDetail(listingId: string) {
    const requestId = (latestDetailRequestId += 1);

    /*
     * 两个条件缺一不可：序号最新排掉被后续请求顶掉的，目标未变排掉详情已被清空的。
     * 少了后者，请求进行中时清空详情（如提交询价成功）仍会把它写回空掉的 store。
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
      // 过期请求连状态都不该动，否则会把仍进行中的那次请求的 loading 提前收掉
      if (!isCurrent()) {
        return;
      }
      store.dispatch(setDetailStatus(FetchStatus.Error));
    }
  },

  /** detailListingId 决定看谁、isDetailDrawerOpen 决定在哪看，分开则抽屉可复用同一份数据 */
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

  /** 收藏写入的唯一出口，失败向上抛：两条调用路径对失败的处置不同 */
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

  /** 失败不改变界面结构，故用 toast；不吞掉——没人接的 rejection 等于失败静默 */
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
