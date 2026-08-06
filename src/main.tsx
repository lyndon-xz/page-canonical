import { ConfigProvider, message } from "antd";
import { createRoot } from "react-dom/client";

import Layout from "@/layout";
import { theme } from "@/theme";

import "./global.scss";

ConfigProvider.config({
  holderRender: (children) => (
    <ConfigProvider theme={theme}>{children}</ConfigProvider>
  ),
});

message.config({ top: 96 });

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <ConfigProvider theme={theme}>
      <Layout />
    </ConfigProvider>,
  );
}
