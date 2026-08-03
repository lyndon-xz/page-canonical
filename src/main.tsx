import { ConfigProvider } from "antd";
import { createRoot } from "react-dom/client";

import Layout from "@/layout";
import { theme } from "@/theme";

import "./global.scss";

/*
 * action 里的 message.error 走 antd 静态方法，渲染在 React 树之外，取不到下面这层
 * ConfigProvider 的主题，需要另行登记一次。少了这步 toast 会退回 antd 默认主题。
 */
ConfigProvider.config({
  holderRender: (children) => (
    <ConfigProvider theme={theme}>{children}</ConfigProvider>
  ),
});

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <ConfigProvider theme={theme}>
      <Layout />
    </ConfigProvider>,
  );
}
