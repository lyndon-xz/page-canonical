export interface TraceCommonTag {
  page: string;
  keyword: string;
  roomType: string;
  selectedListingId: string;
}

export function reportTrace(event: string, tag: TraceCommonTag & Record<string, string>) {
  // eslint-disable-next-line no-console -- 示范页把埋点打到 info，不是告警
  console.info('[trace]', event, tag);
}
