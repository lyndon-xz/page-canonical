import { ROOM_TYPE_VALUES, type RoomType } from "./listing";

export interface ListingFilters {
  keyword: string;
  roomType: RoomType | "";
}

const isRoomType = (value: string): value is RoomType =>
  (ROOM_TYPE_VALUES as readonly string[]).includes(value);

export function parseFilters(search: string): ListingFilters {
  const query = new URLSearchParams(search);
  const keyword = query.get("keyword") ?? "";
  const rawRoomType = query.get("roomType") ?? "";
  const roomType = isRoomType(rawRoomType) ? rawRoomType : "";

  return { keyword, roomType };
}
