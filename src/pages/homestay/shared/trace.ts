export interface TraceCommonTag {
  page: string;
  keyword: string;
  roomType: string;
  selectedListingId: string;
}

export function reportTrace(
  event: string,
  tag: TraceCommonTag & Record<string, string>,
) {
  // 埋点槽：示范页用 info 打出事件，不是告警
  // eslint-disable-next-line no-console
  console.info("[trace]", event, tag);
}
