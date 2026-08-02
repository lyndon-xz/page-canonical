import type { ListingFilters } from "./types";

export function parseFilters(search: string): ListingFilters {
  const query = new URLSearchParams(search);
  const keyword = query.get("keyword") ?? "";
  const roomType = query.get("roomType") ?? "";
  return { keyword, roomType };
}
