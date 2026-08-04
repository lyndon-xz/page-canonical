import type { FlightFilters } from "./shared/types";

export function parseFilters(search: string): FlightFilters {
  const query = new URLSearchParams(search);
  const cabin = query.get("cabin") ?? "";
  return { cabin: ["经济舱", "商务舱", "头等舱"].includes(cabin) ? cabin : "" };
}

export function serializeFilters(
  filters: FlightFilters,
): Record<string, string> {
  const { cabin } = filters;
  const result: Record<string, string> = {};
  if (cabin !== "") {
    result.cabin = cabin;
  }
  return result;
}
