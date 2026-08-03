export interface TraceCommonTag {
  page: string;
  /** 当前生效的筛选条件，空串表示不限 */
  keyword: string;
  roomType: string;
  /** 上报时点选中的房源，未选中为空串 */
  selectedListingId: string;
}

/** 演示用出口；真实项目里换成埋点 SDK 的上报方法 */
export function reportTrace(
  event: string,
  tag: TraceCommonTag & Record<string, string>,
) {
  console.info("[trace]", event, tag);
}
