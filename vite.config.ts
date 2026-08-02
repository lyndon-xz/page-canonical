import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * 本地预览配置：dev server 固定跑在 3000 端口。
 * 页面数据一律用页面内的 mock 服务（async 返回 mock），不经任何请求基座，
 * 因此这里无需 mock 中间件。
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "~": path.resolve(import.meta.dirname, "./"),
    },
  },
  server: {
    port: 3000,
    host: true,
    open: false,
  },
});
