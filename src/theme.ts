import type { ThemeConfig } from "antd";

const palette = {
  ink: "#3b3129",
  inkRgb: "59 49 41",
  paper: "#f7f2ea",
  card: "#fffdf9",
  cardRgb: "255 253 249",
  primary: "#c17a4f",
  primaryStrong: "#a9603a",
  primarySoft: "#f3e6d9",
  primaryWarm: "#d99a6b",
  amber: "#d99a4a",
  amberSoft: "#faeedb",
  ok: "#6f8f5e",
  okSoft: "#eaf0e4",
  danger: "#b04a3a",
  dangerSoft: "#f7e4de",
  line: "#ece2d4",
  lineSoft: "#f1e9dd",
  lineHover: "#e2d5c4",
  muted: "#8a7c6d",
};

const fontStack = {
  display: '"Fraunces", "Noto Serif SC", Georgia, serif',
  body: '"Inter", "Noto Sans SC", system-ui, -apple-system, sans-serif',
  mono: '"IBM Plex Mono", "Noto Sans Mono", ui-monospace, monospace',
};

const shadow = {
  shadowCard: `0 8px 24px -18px rgb(${palette.inkRgb} / 28%)`,
  shadowLift: `0 16px 30px -20px rgb(${palette.inkRgb} / 30%)`,
};

const CARD_RADIUS_PX = 16;
const CHIP_RADIUS_PX = 9;
const TAG_RADIUS_PX = 7;
const CONTROL_RADIUS_PX = 11;
const CONTROL_HEIGHT_PX = 46;
const BASE_FONT_SIZE_PX = 15;

const cssTokens = {
  ...palette,
  ...fontStack,
  ...shadow,
  radius: `${CARD_RADIUS_PX}px`,
  radiusSm: `${CHIP_RADIUS_PX}px`,
  radiusXs: `${TAG_RADIUS_PX}px`,
  fontSizeBase: `${BASE_FONT_SIZE_PX}px`,
};

const toCssVariableName = (token: string) =>
  `--${token.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

/** 把设计令牌写进 :root，样式表以 var(--xxx) 消费同一份值 */
export function applyTokensToRoot() {
  const { style } = document.documentElement;

  Object.entries(cssTokens).forEach(([token, value]) => {
    style.setProperty(toCssVariableName(token), value);
  });
}

export const theme: ThemeConfig = {
  token: {
    colorPrimary: palette.primary,
    colorLink: palette.primaryStrong,
    colorLinkHover: palette.primary,
    colorText: palette.ink,
    colorTextSecondary: palette.muted,
    colorBorder: palette.line,

    colorError: palette.danger,
    colorErrorBg: palette.dangerSoft,
    colorSuccess: palette.ok,
    colorSuccessBg: palette.okSoft,
    colorWarning: palette.amber,
    colorWarningBg: palette.amberSoft,

    colorBgElevated: palette.card,

    borderRadius: CONTROL_RADIUS_PX,
    borderRadiusLG: CARD_RADIUS_PX,
    boxShadow: shadow.shadowLift,
    controlHeight: CONTROL_HEIGHT_PX,
    fontSize: BASE_FONT_SIZE_PX,
    fontFamily: fontStack.body,
  },
};
