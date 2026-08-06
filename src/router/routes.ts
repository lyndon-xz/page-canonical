import type { ComponentType } from "react";

import HomestayPage from "@/pages/homestay";
import HotelPage from "@/pages/hotel";

type Route = {
  path: string;
  name: string;
  lib: string;
  Component: ComponentType;
};

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
    lib: "redux toolkit",
    Component: HomestayPage,
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
