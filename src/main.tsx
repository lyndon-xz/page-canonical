import { ConfigProvider } from "antd";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import FlightPage from "@/pages/flight";
import HomestayPage from "@/pages/homestay";
import HotelPage from "@/pages/hotel";

import styles from "./main.module.scss";

type PageKey = "hotel" | "homestay" | "flight";

const OPTIONS: { value: PageKey; name: string; lib: string }[] = [
  { value: "hotel", name: "酒店", lib: "zustand" },
  { value: "homestay", name: "民宿", lib: "unstated-next" },
  { value: "flight", name: "机票", lib: "redux toolkit" },
];

const PAGE_KEYS: readonly PageKey[] = ["hotel", "homestay", "flight"];

function isPageKey(value: string): value is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(value);
}

// 从 URL 路径解析当前页（history 路由），非法值回落到酒店页
function readPathPage(): PageKey {
  const segment =
    window.location.pathname.replace(/^\/+/, "").split("/")[0] ?? "";
  return isPageKey(segment) ? segment : "hotel";
}

function renderPage(key: PageKey) {
  switch (key) {
    case "homestay":
      return <HomestayPage />;
    case "flight":
      return <FlightPage />;
    case "hotel":
    default:
      return <HotelPage />;
  }
}

// 行程台品牌图标：分层堆叠，呼应 store / model / actions / effects 的分层
function BrandMark() {
  return (
    <span className={styles.mark}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="#fff"
        strokeWidth={2.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M16 5 26 10.5 16 16 6 10.5Z" />
        <path d="M6 15.5 16 21 26 15.5" />
        <path d="M6 20.5 16 26 26 20.5" />
      </svg>
    </span>
  );
}

function PreviewApp() {
  const [active, setActive] = useState<PageKey>(readPathPage);

  // 前进 / 后退时按路径同步当前页
  useEffect(() => {
    const syncFromPath = () => setActive(readPathPage());
    window.addEventListener("popstate", syncFromPath);
    return () => window.removeEventListener("popstate", syncFromPath);
  }, []);

  const handleChange = (value: PageKey) => {
    window.history.pushState(null, "", `/${value}`);
    setActive(value);
  };

  return (
    <div className={styles.app}>
      <header className={styles.rail}>
        <div className={styles.railInner}>
          <div className={styles.brand}>
            <BrandMark />
            <span className={styles.name}>行程台</span>
            <span className={styles.sub}>page-canonical</span>
          </div>
          <nav className={styles.switch}>
            {OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  option.value === active
                    ? `${styles.stub} ${styles.stubActive}`
                    : styles.stub
                }
                onClick={() => handleChange(option.value)}
              >
                {option.name}
                <span className={styles.stubSub}>{option.lib}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        {/* key 保证切换页面时组件重新挂载，首屏 effects 重新执行 */}
        <div key={active}>{renderPage(active)}</div>
      </main>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#c17a4f",
          colorLink: "#a9603a",
          colorLinkHover: "#c17a4f",
          colorText: "#3b3129",
          colorTextSecondary: "#8a7c6d",
          colorBorder: "#ece2d4",
          borderRadius: 11,
          controlHeight: 46,
          fontSize: 15,
          fontFamily:
            "'Inter', 'Noto Sans SC', system-ui, -apple-system, sans-serif",
        },
      }}
    >
      <PreviewApp />
    </ConfigProvider>,
  );
}
