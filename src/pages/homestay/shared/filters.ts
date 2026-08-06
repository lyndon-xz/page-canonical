import { ROOM_TYPE_VALUES, type RoomType } from "./listing";

/** 本页暂无筛选 UI，目前只由 URL query 填充 */
export interface ListingFilters {
  keyword: string;
  /** 房型筛选，空串表示不限 */
  roomType: RoomType | "";
}

// URL 来的值到手是 string，校验须引用同一份取值来源，另抄一份迟早漏同步
const isRoomType = (value: string): value is RoomType =>
  (ROOM_TYPE_VALUES as readonly string[]).includes(value);

export function parseFilters(search: string): ListingFilters {
  const query = new URLSearchParams(search);
  const keyword = query.get("keyword") ?? "";
  const rawRoomType = query.get("roomType") ?? "";
  // 非法房型回落为不限，而不是原样落库——那样会得到一个永远匹配不上的空列表
  const roomType = isRoomType(rawRoomType) ? rawRoomType : "";

  return { keyword, roomType };
}
