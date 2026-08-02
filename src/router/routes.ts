import type { ComponentType } from "react";

import FlightPage from "@/pages/flight";
import HomestayPage from "@/pages/homestay";
import HotelPage from "@/pages/hotel";

type Route = {
  /** URL 首段 */
  path: string;
  name: string;
  /** 该页示范的状态库 */
  lib: string;
  Component: ComponentType;
};

/** 页面清单的唯一来源：类型、导航项、渲染组件都从这张表推导 */
export const routes = [
  {
    path: "hotel",
    name: "酒店",
    lib: "zustand",
    Component: HotelPage,
  },
  {
    path: "homestay",
    name: "民宿",
    lib: "unstated-next",
    Component: HomestayPage,
  },
  {
    path: "flight",
    name: "机票",
    lib: "redux toolkit",
    Component: FlightPage,
  },
] as const satisfies readonly Route[];

export type PageKey = (typeof routes)[number]["path"];

export const DEFAULT_PAGE: PageKey = routes[0].path;

export function isPageKey(value: string): value is PageKey {
  return routes.some((route) => route.path === value);
}

export function resolveRoute(page: PageKey): Route {
  return routes.find((route) => route.path === page) ?? routes[0];
}
