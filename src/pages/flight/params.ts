import type { FlightFilters } from "./shared/types";

export function parseFilters(search: string): FlightFilters {
  const query = new URLSearchParams(search);
  const cabin = query.get("cabin") ?? "";
  return { cabin: ["经济舱", "商务舱", "头等舱"].includes(cabin) ? cabin : "" };
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
