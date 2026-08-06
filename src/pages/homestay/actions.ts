import { message } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import {
  cancelInquiry as cancelInquiryService,
  fetchListingDetail,
  fetchListings,
  submitInquiry as submitInquiryService,
  toggleFavorite as toggleFavoriteService,
} from "./data/services";
import { ConfirmScene, type ConfirmRequest } from "./shared/confirm";
import type { ListingFilters } from "./shared/filters";
import type { InquiryForm } from "./shared/inquiry";
import { reportTrace } from "./shared/trace";
import {
  addFavoriteId,
  finishFavoriting,
  removeFavoriteId,
  resetResultSet,
  setAppliedFilters,
  setConfirmRequest,
  setDetailStatus,
  setIsDetailDrawerOpen,
  setIsSubmittingInquiry,
  setListingDetail,
  setListings,
  setListingsStatus,
  setSelectedListingId,
  setSubmittedInquiry,
  startFavoriting,
} from "./slice";
import { selectTraceCommonTag, store } from "./store";

/** 连续点开不同房源时先发的请求可能后到，只有最新序号的响应允许落库 */
let latestDetailRequestId = 0;

/** 调用前须先把 selectedListingId 对齐到该房源，否则响应会被 isCurrent 判为过期丢弃 */
async function loadListingDetail(listingId: string) {
  const requestId = (latestDetailRequestId += 1);

  /*
   * 两个条件缺一不可：序号最新排掉被后续请求顶掉的，选中未变排掉已退出该房源的。
   * 少了后者，请求进行中时退出房源（如提交询价成功）仍会把详情写回已清空的 store。
   */
  const isCurrent = () =>
    requestId === latestDetailRequestId &&
    store.getState().page.selectedListingId === listingId;

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
}

export const pageActions = {
  // ── 埋点 ──

  /** 须在状态变更之前调用：通用参数表达「点击发生时页面处于什么上下文」 */
  trackClick(event: string, extra: Record<string, string> = {}) {
    reportTrace(event, {
      ...selectTraceCommonTag(store.getState()),
      ...extra,
    });
  },

  // ── 列表 ──

  async loadListings(filters: ListingFilters) {
    store.dispatch(setAppliedFilters(filters));
    store.dispatch(setListingsStatus(FetchStatus.Loading));
    store.dispatch(resetResultSet());

    try {
      const listings = await fetchListings(filters);
      store.dispatch(setListings(listings));
      store.dispatch(setListingsStatus(FetchStatus.Ready));
    } catch {
      // 结果态已在请求前清空，这里只翻状态
      store.dispatch(setListingsStatus(FetchStatus.Error));
    }
  },

  retryListings() {
    void pageActions.loadListings(store.getState().page.appliedFilters);
  },

  // ── 详情 ──

  /** 选中即切换详情：详情区跟着卡片走，避免用户还要再点一次「看详情」 */
  selectListing(listingId: string) {
    store.dispatch(setSelectedListingId(listingId));
    void loadListingDetail(listingId);
  },

  openDetailDrawer() {
    store.dispatch(setIsDetailDrawerOpen(true));
  },

  closeDetailDrawer() {
    store.dispatch(setIsDetailDrawerOpen(false));
  },

  retryDetail() {
    const { selectedListingId } = store.getState().page;

    if (!selectedListingId) {
      return;
    }
    void loadListingDetail(selectedListingId);
  },

  // ── 确认弹窗 ──

  openConfirm(request: ConfirmRequest) {
    store.dispatch(setConfirmRequest(request));
  },

  closeConfirm() {
    store.dispatch(setConfirmRequest(null));
  },

  // ── 收藏 ──

  /** 收藏写入的唯一出口，失败向上抛：两条调用路径对失败的处置不同 */
  async commitFavorite(listingId: string) {
    const { favoriteIds } = store.getState().page;
    // 点击那一刻的收藏态决定本次是收还是取消；落库走增删 reducer，不拿这份快照做覆盖
    const wasFavorite = favoriteIds.includes(listingId);

    store.dispatch(startFavoriting(listingId));
    try {
      await toggleFavoriteService(listingId);
      store.dispatch(
        wasFavorite ? removeFavoriteId(listingId) : addFavoriteId(listingId),
      );
    } finally {
      store.dispatch(finishFavoriting(listingId));
    }
  },

  /** 在这里接住 commitFavorite 的抛错：失败不改变界面结构，故用 toast 提示 */
  async addFavorite(listingId: string) {
    try {
      await pageActions.commitFavorite(listingId);
    } catch (err) {
      message.error(err instanceof Error ? err.message : String(err));
    }
  },

  /**
   * 收藏是新增操作、即点即改；取消收藏是破坏性的，转交二次确认。
   * 规则收在页面层：列表卡片与详情抽屉都要它，各写一份必然漂移。
   */
  toggleFavorite(listingId: string) {
    const { favoriteIds, favoritingIds } = store.getState().page;

    // 悲观更新期间心标不动，不挡住会让用户以为没点上而重复提交
    if (favoritingIds.includes(listingId)) {
      return;
    }

    const willFavorite = !favoriteIds.includes(listingId);

    pageActions.trackClick("listing_favorite_toggle", {
      listingId,
      willFavorite: String(willFavorite),
    });

    if (willFavorite) {
      void pageActions.addFavorite(listingId);
      return;
    }

    pageActions.openConfirm({
      scene: ConfirmScene.RemoveFavorite,
      listingId,
    });
  },

  // ── 询价 ──

  // 不接错误，只保证 loading 收尾：字段级错误要回填到表单，得由调用方拿到原错误分流
  async submitInquiry(values: InquiryForm) {
    // 询价的房源取自选中态，不进表单。UI 侧的禁用只是可用性，选中态随时可能被列表刷新清掉
    const { selectedListingId } = store.getState().page;

    if (!selectedListingId) {
      throw new Error("请先选择要询价的房源");
    }

    store.dispatch(setIsSubmittingInquiry(true));
    store.dispatch(setSubmittedInquiry(null));
    try {
      const submitted = await submitInquiryService({
        ...values,
        listingId: selectedListingId,
      });

      store.dispatch(setSubmittedInquiry(submitted));
    } finally {
      store.dispatch(setIsSubmittingInquiry(false));
    }
  },

  async cancelInquiry() {
    const { submittedInquiry } = store.getState().page;

    if (!submittedInquiry) {
      return;
    }

    await cancelInquiryService(submittedInquiry.inquiryId);
    store.dispatch(setSubmittedInquiry(null));
  },
};
