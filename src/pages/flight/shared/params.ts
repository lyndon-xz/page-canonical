import type { FlightFilters } from "./types";

const VALID_CABINS = ["经济舱", "商务舱", "头等舱"];

export function parseFilters(search: string): FlightFilters {
  const query = new URLSearchParams(search);
  const cabin = query.get("cabin") ?? "";
  return { cabin: VALID_CABINS.includes(cabin) ? cabin : "" };
}

export function serializeFilters(
  filters: FlightFilters,
): Record<string, string> {
  const result: Record<string, string> = {};
  if (filters.cabin !== "") {
    result.cabin = filters.cabin;
  }
  return result;
}
