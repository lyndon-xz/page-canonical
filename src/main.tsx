import { ConfigProvider } from "antd";
import { createRoot } from "react-dom/client";

import Layout from "@/layout";
import { theme } from "@/theme";

import "./global.scss";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <ConfigProvider theme={theme}>
      <Layout />
    </ConfigProvider>,
  );
}
