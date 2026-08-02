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
  setAppliedFilters,
  setConfirmScene,
  setDetailError,
  setDetailListingId,
  setFavoriteError,
  setFavoriteIds,
  setInquiryError,
  setInquirySubmitted,
  setIsDetailDrawerOpen,
  setIsLoadingDetail,
  setIsLoadingListings,
  setIsSubmittingInquiry,
  setListingDetail,
  setListings,
  setListingsError,
} from "./slice";
import { reportTrace } from "./shared/trace";
import { selectTraceCommonTag, store } from "./store";

/**
 * 详情请求的序号守卫：连续点开不同房源时，先发的请求可能后到，
 * 直接写入会让详情与当前选中的房源不符。每次请求领取自增序号，只有最新序号的响应允许落库。
 *
 * 不放进 store 是因为它只服务请求编排、UI 从不消费；
 * 用自增序号而非「参数去重」，是为了让重复点开同一房源仍能重新拉取（去重会漏掉重试场景）。
 */
let latestDetailRequestId = 0;

/** store 只存可序列化值，故错误统一收成消息字符串 */
function toMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

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
    store.dispatch(setIsLoadingListings(true));
    store.dispatch(setListingsError(null));
    try {
      const listings = await fetchListings(filters);
      store.dispatch(setListings(listings));
    } catch (err) {
      store.dispatch(setListingsError(toMessage(err)));
    } finally {
      store.dispatch(setIsLoadingListings(false));
    }
  },

  async loadListingDetail(listingId: string) {
    const requestId = (latestDetailRequestId += 1);

    store.dispatch(setIsLoadingDetail(true));
    store.dispatch(setDetailError(null));
    try {
      const detail = await fetchListingDetail(listingId);
      if (requestId !== latestDetailRequestId) {
        return;
      }
      store.dispatch(setListingDetail(detail));
    } catch (err) {
      if (requestId !== latestDetailRequestId) {
        return;
      }
      store.dispatch(setDetailError(toMessage(err)));
    } finally {
      // loading 只由最新请求关闭，否则过期请求会提前收掉进行中请求的 loading
      if (requestId === latestDetailRequestId) {
        store.dispatch(setIsLoadingDetail(false));
      }
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
   * 确认弹窗要把错误留在弹窗内，直接收藏要把错误落到列表顶部（见 addFavorite）。
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

  /** 新增收藏无需二次确认，但失败必须有反馈——否则就成了没人接的 rejection */
  async addFavorite(listingId: string) {
    store.dispatch(setFavoriteError(null));
    try {
      await pageActions.commitFavorite(listingId);
    } catch (err) {
      store.dispatch(setFavoriteError(toMessage(err)));
    }
  },

  dismissFavoriteError() {
    store.dispatch(setFavoriteError(null));
  },

  async cancelInquiry() {
    await cancelInquiryService();
    store.dispatch(setInquirySubmitted(false));
    store.dispatch(setInquiryError(null));
  },

  // 记下 error 后仍要 rethrow：调用方 action 需要拿到原错误把字段级错误回填到表单
  async submitInquiry(values: InquiryForm) {
    store.dispatch(setIsSubmittingInquiry(true));
    store.dispatch(setInquiryError(null));
    store.dispatch(setInquirySubmitted(false));
    try {
      await submitInquiryService(values);
      store.dispatch(setInquirySubmitted(true));
    } catch (err) {
      store.dispatch(setInquiryError(toMessage(err)));
      throw err;
    } finally {
      store.dispatch(setIsSubmittingInquiry(false));
    }
  },
};
