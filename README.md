# @lyndon/page-canonical

> 一套**页面分层架构**（store / model / actions / effects / UI）的范式级 SPA 示范：同一套分层约定，用 **zustand**、**unstated-next**、**Redux Toolkit** 三种状态栈分别落地，覆盖结构化状态与非结构化活对象。

![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white) ![Ant Design](https://img.shields.io/badge/Ant%20Design-6-0170fe?logo=antdesign&logoColor=white) ![License](https://img.shields.io/badge/License-MIT-green.svg)

## 📖 简介

`page-canonical` 不是一个业务产品，而是一份**可运行的架构范式**。它把「一个页面该如何组织状态、副作用与 UI」拆成固定的几层，并在三个真实感十足的页面（酒店 / 民宿 / 机票）上分别演示。

三个页面共用同一套分层约定，却各自绑定一种主流状态库，用来证明：**分层是一种与具体状态库无关的约定**。

| 页面 | 路径        | 状态栈        |
| ---- | ----------- | ------------- |
| 酒店 | `/hotel`    | zustand       |
| 民宿 | `/homestay` | unstated-next |
| 机票 | `/flight`   | Redux Toolkit |

## ✨ 特性

- **统一分层约定**：每个页面都由 `store` / `model` / `actions` / `effects` / `UI` 五层构成，职责边界清晰，跨栈一致。
- **状态库可替换**：同一套分层在 zustand、unstated-next、Redux Toolkit 上分别实现，验证架构与状态库解耦。
- **结构化状态与活对象分离**：可序列化数据走 `store`，`useForm` 返回值、DOM ref、命令式句柄等非结构化「活对象」走独立的 `liveStore`，两层对称，各司其职。
- **页面级 store**：无全局 store，`<Provider>` 随页面挂载 / 卸载，模块 slice 就近注册。
- **副作用渲染隔离**：`effects` 放在返回 `null` 的独立组件里执行，订阅的状态变化不波及子树。
- **零请求基座**：数据一律走页面内的 async mock 服务，聚焦分层本身，不引入任何请求库。

## 🧱 技术栈

- **框架**：React 19 + TypeScript 5.9
- **构建**：Vite 8（`@vitejs/plugin-react`）
- **状态管理**：zustand / unstated-next / Redux Toolkit + react-redux
- **UI**：Ant Design 6 + `@ant-design/icons`
- **表单**：react-hook-form
- **样式**：Sass（CSS Modules，`*.module.scss`）
- **工具**：dayjs

## 🚀 快速开始

```bash
# 安装依赖（推荐 pnpm）
pnpm install

# 启动本地预览，固定 3000 端口
pnpm dev
```

启动后访问 `http://localhost:3000`，顶部导航可在酒店 / 民宿 / 机票三页间切换（history 路由）。

## ⌨️ 脚本

| 命令              | 说明                              |
| ----------------- | --------------------------------- |
| `pnpm dev`        | 启动 Vite dev server（3000 端口） |
| `pnpm build`      | 生产构建，产物输出到 `dist`       |
| `pnpm preview`    | 本地预览生产构建产物              |
| `pnpm type-check` | 运行 `tsc --noEmit` 做类型检查    |

## 📂 目录结构

```text
src/
├── main.tsx              # 应用入口：三页切换 + 全局 antd 主题
├── lib/
│   └── live.ts           # 活对象层 liveStore：受管控的引用容器（含生命周期 hook）
└── pages/
    ├── hotel/            # 酒店页（zustand）
    ├── homestay/         # 民宿页（unstated-next）
    └── flight/           # 机票页（Redux Toolkit），分层结构如下
        ├── index.tsx     # 页面入口：组合各模块，隔离 effects
        ├── store.ts      # 结构化状态 + 原子 setter
        ├── actions.ts    # 页面级 / 跨模块业务编排（组件外调用）
        ├── effects.ts    # 副作用：首屏取数、URL 同步等
        ├── services.ts   # async mock 取数 / 提交服务
        ├── live.ts       # 本页活对象登记入口
        ├── shared/       # 页面内共享的类型与参数序列化
        ├── data/         # mock 数据
        └── modules/      # 模块（search-bar / flight-results / booking-form）
            └── <module>/ # 每个模块自带 model / actions / slice / UI
```

## 🧩 分层职责

| 层          | 职责                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| `store`     | 页面级结构化状态与原子 setter，跨模块共享、可序列化。                                                    |
| `model`     | 面向 UI 的读侧派生：从 store 选择、组合出组件所需的视图数据。                                            |
| `actions`   | 业务编排，纯对象、在组件外调用；不碰其他模块的 model / actions。                                         |
| `effects`   | 把副作用绑定到生命周期（首屏取数、URL 同步等），渲染隔离。                                               |
| `UI`        | 只负责渲染与交互转发，不写业务逻辑。                                                                     |
| `liveStore` | 活对象层：`useForm` 实例、DOM ref、命令式句柄等非结构化引用的容器，与 `store` 对称，挂载登记、卸载注销。 |

## 📄 License

[MIT](./LICENSE) © Lyndon
