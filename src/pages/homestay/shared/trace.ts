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
  console.info("[trace]", event, tag);
}
