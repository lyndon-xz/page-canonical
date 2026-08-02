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
    borderRadius: 11,
    controlHeight: 46,
    fontSize: 15,
    fontFamily: "'Inter', 'Noto Sans SC', system-ui, -apple-system, sans-serif",
  },
};
