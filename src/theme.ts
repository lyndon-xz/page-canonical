import type { ThemeConfig } from "antd";

/** antd 主题 token。色值取自 global.scss 并重复声明：antd 走 cssinjs，取不到 CSS 变量 */
export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#c17a4f",
    colorLink: "#a9603a",
    colorLinkHover: "#c17a4f",
    colorText: "#3b3129",
    colorTextSecondary: "#8a7c6d",
    colorBorder: "#ece2d4",

    // 不配则退回 antd 默认的高饱和红绿黄，在这套低饱和暖色里会显得刺眼
    colorError: "#b04a3a",
    colorErrorBg: "#f7e4de",
    colorSuccess: "#6f8f5e",
    colorSuccessBg: "#eaf0e4",
    colorWarning: "#d99a4a",
    colorWarningBg: "#faeedb",

    // 浮层背景：message、Modal、Drawer、下拉面板共用，默认纯白在暖底上偏冷
    colorBgElevated: "#fffdf9",

    borderRadius: 11,
    // 浮层与卡片用的大圆角，对齐 --radius；不配会从 borderRadius 推导出 13
    borderRadiusLG: 16,
    boxShadow: "0 16px 30px -20px rgb(59 49 41 / 30%)",
    controlHeight: 46,
    fontSize: 15,
    fontFamily: "'Inter', 'Noto Sans SC', system-ui, -apple-system, sans-serif",
  },
};
