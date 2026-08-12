# @lyndon/page-canonical

> **页面分层架构**的示范工程：同一套 `store / model / actions / effects / UI` 分层，用 **zustand** 和 **Redux Toolkit** 各落地一个完整页面，正面处理请求竞态、乐观更新、批量部分失败、落盘脏数据等页面级难题。

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) ![Ant Design](https://img.shields.io/badge/Ant%20Design-6-0170FE?logo=antdesign&logoColor=white) ![zustand](https://img.shields.io/badge/zustand-5-2D3748) ![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2-764ABC?logo=redux&logoColor=white) ![License](https://img.shields.io/badge/license-MIT-green)

## 📖 简介

这不是组件库，也不是脚手架，而是一份**可运行的页面架构参考实现**。

它回答的问题是：一个中等复杂度的业务页面，状态该放哪、副作用该在哪触发、读和写各走哪条路、模块之间怎么联动而不互相污染。为了证明这套分层与具体状态库无关，仓库里两个页面刻意用了不同的状态方案：

| 页面    | 路径        | 状态方案                                 | 侧重                                                 |
| ------- | ----------- | ---------------------------------------- | ---------------------------------------------------- |
| 🏨 酒店 | `/hotel`    | zustand + `persist`                      | 结构化状态、列表复杂度：分页、多选、批量、本地持久化 |
| 🏡 民宿 | `/homestay` | Redux Toolkit（slice + listener 中间件） | 跨模块联动：抽屉详情、场景化确认弹窗、埋点           |

两页共用完全相同的分层命名与调用方向，差异只在状态库和演示的业务能力上，方便对照阅读。

所有数据来自页面内的 mock 服务（`data/services.ts`，`async` 返回 mock 并统一模拟 300ms 网络耗时），不依赖任何后端。

## ✨ 特性

- 🧩 **严格单向的分层**：UI 只读 `model`、只调本模块 `actions`，从不直接 `set` / `dispatch`，也不直接引用 `services`；模块之间零 import，跨模块影响一律经状态层中转。
- 🔀 **请求竞态防护**：列表用世代号（`resultSetGeneration`）丢弃过期响应；详情再叠一层 `requestId` + 「当前选中项是否仍是它」双重校验，成功与失败两条路径都判。
- 🧹 **取数前先作废旧结果**：整组归零收在状态层一个 `resetResultSet` 里，跨结果集的用户数据（收藏）不受牵连；「退出当前房源」那四个字段另有一个 `exitListing`，两者是复用而非并列。
- ↩️ **乐观更新与精确回滚**：收藏失败时重读当前集合、只反转本次这一项，不用请求前的整份快照覆盖——别的项可以同时在飞。
- ⚠️ **部分失败可重试**：批量收藏返回 `succeededIds` + `failures`，失败项自动留在勾选集合里配 `Alert` 提示；属于当前结果集的那部分写入过世代号守卫。
- 🔗 **URL 与状态互通**：酒店页筛选条件写回 query（等于默认值就不写），刷新和分享都能还原；进页面时 URL 优先于持久化偏好，且「有没有带参」由解析函数按本页参数判断，而不是看 query 串是否非空。
- 💾 **落盘的值一概不信**：`localStorage` 读出的值逐字段过类型守卫，任一非法就回落该字段默认值；收窄函数与解析 URL 的函数并列在同一个概念文件里，共用同一批守卫与默认值；配 `version` + `migrate`，落盘形状变更时不做旧数据兼容。
- 📮 **表单错误分层归位**：`react-hook-form` 负责本地校验，服务端返回的字段级错误由模块 `actions` 经活对象句柄回填到对应字段，其余错误走 toast。
- 🫙 **非结构化活对象独立成层**：不适合进 store 的 `UseFormReturn` 实例存在 `live.ts` 的登记表里，让 React 外部的 `actions` 也能拿到表单句柄。
- 🎨 **设计令牌单一来源**：`theme.ts` 一份令牌同时喂给 antd `ThemeConfig` 和 `:root` 上的 CSS 变量，scss 侧只用 `var(--xxx)` 消费，不出现字面色值。

## 🧱 技术栈

| 领域 | 选型                                                                      |
| ---- | ------------------------------------------------------------------------- |
| 框架 | React 19 + TypeScript 5.9（`strict` 全开，含 `noUncheckedIndexedAccess`） |
| 构建 | Vite 8 + `@vitejs/plugin-react`                                           |
| 状态 | zustand 5（酒店页）、Redux Toolkit 2 + react-redux 9（民宿页）            |
| 表单 | react-hook-form 7                                                         |
| UI   | antd 6 + `@ant-design/icons`，样式用 sass CSS Modules                     |
| 工具 | dayjs                                                                     |
| 路由 | 手写 `history.pushState` 路由，无 react-router 依赖                       |

## 🚀 快速开始

仓库只用 pnpm（`.gitignore` 里屏蔽了其他包管理器的 lockfile）：

```bash
pnpm install
pnpm dev
```

dev server 固定跑在 `3000` 端口且开启 `host`，浏览器打开 <http://localhost:3000> 即可，默认进入酒店页。

## ⌨️ 脚本

| 命令              | 作用                                |
| ----------------- | ----------------------------------- |
| `pnpm dev`        | 启动 dev server（`localhost:3000`） |
| `pnpm build`      | 生产构建，输出到 `dist/`            |
| `pnpm preview`    | 预览构建产物                        |
| `pnpm type-check` | `tsc` 全量类型检查（`noEmit`）      |

## 📂 目录结构

```
src/
├── main.tsx              入口：写入设计令牌 → 挂 antd ConfigProvider → 渲染 Layout
├── theme.ts              设计令牌单一来源：CSS 变量 + antd ThemeConfig
├── global.scss           全局基样式、z-index 层级变量、antd 全局覆盖
├── router/               手写路由：routes.ts（路由表 + 类型守卫）、useRoute.ts（pushState / popstate）
├── layout/               外壳与页面切换 rail（按钮上直接标注该页用的状态库）
├── components/           跨页面纯展示件：page-hero、form-field（不认识任何状态层）
├── lib/                  跨页面原语：live（活对象登记表工厂）、fetch-status（取数三态）、
│                         error（错误文案）、mock-delay（模拟耗时）、phone（校验常量）
├── types/                scss.d.ts：*.module.scss 模块声明
└── pages/
    ├── hotel/            zustand 侧
    │   ├── store.ts      状态 + 细粒度 setter + persist（partialize / merge / version / migrate）
    │   ├── actions.ts    页面级唯一写入口：等待 hydration、世代号、乐观更新
    │   ├── effects.ts    生命周期副作用：挂载即 initPage
    │   ├── live.ts       bookingForm 的 UseFormReturn
    │   ├── shared/       hotel / params / booking / favorite：类型、取值表、默认值、解析与收窄
    │   ├── data/         mock 数据与 mock 服务
    │   └── modules/      search-filter、hotel-list、booking-form
    └── homestay/         Redux Toolkit 侧
        ├── store.ts      configureStore + listener 中间件 + 跨 slice 选择器 + typed hook
        ├── slice.ts      页面 slice（状态形状 / 初值 / reducers / 导出四处同序）
        ├── listeners.ts  跨模块副作用：询价成功后自动退出选中态
        ├── actions.ts    页面级唯一写入口（dispatch 版，同构于酒店页）
        ├── effects.ts / live.ts / data/
        ├── shared/       listing / filters / inquiry / confirm / trace
        └── modules/      listing-list、listing-detail、inquiry-fields、
                          inquiry-submit、confirm-dialog
```

## 🧩 分层约定

页面按「读」「写」「时机」三条职责切开，调用方向严格单向：

```
UI (index.tsx / components)
  ├── 读 ──> model.ts ──> store / slice（选择器 + 派生）
  └── 写 ──> 模块 actions.ts ──> 页面 actions.ts ──> data/services.ts + store 写入
                                      ↑
effects.ts（生命周期、DOM 时机）───────┘
live.ts（非结构化活对象）──供 actions 反向读取
shared/*.ts（类型 / 取值表 / 纯函数，不依赖任何层）
```

模块按「页面上一块能独立交互的区域」划分，而非组件树层级。模块内文件分工固定：

| 文件                | 职责                                                                           |
| ------------------- | ------------------------------------------------------------------------------ |
| `model.ts`          | 读侧唯一出口：投影 + 派生计算，不含任何写操作                                   |
| `actions.ts`        | 写侧唯一出口：转调页面 actions、收窄参数、补埋点、消费 `getLive` 拿表单句柄     |
| `index.tsx`         | 纯 UI：调 model 取数、绑事件、渲染                                             |
| `effects.ts`        | 需要生命周期或 DOM 时机的副作用（IntersectionObserver、scrollIntoView 等）      |
| `components/`       | 仅本模块使用的私有子组件，可直接引用本模块的 model / actions，不层层透传 props |
| `index.module.scss` | 与 `index.tsx` 同级的样式                                                      |

页面 effects 一律关进一个返回 `null` 的 `EffectsRunner`，避免页面壳的重渲染牵连全部模块；模块 effects 直接调在模块壳里，因为它要的 DOM ref 只能由渲染那个节点的组件声明。

模块自己的局部状态两页各演示一种落法：酒店页 `search-filter/model.ts` 里另建一个局部 zustand store 存输入草稿；民宿页 `confirm-dialog/slice.ts` 是注册进页面 store 的局部 slice，并在 `extraReducers` 里随弹窗开关自动复位。

## 💡 演示场景

**酒店页**（`/hotel`，18 条 mock 数据、每页 12 条）

- 关键词 + 星级（不限 / 3 / 4 / 5）筛选、按价格 / 评分 / 距离排序，条件回写 URL
- 「加载更多」配 IntersectionObserver 无限滚动，换结果集后视口回到列表顶部（先量位置再滚）
- 单项收藏（乐观更新 + 逐 id 并发去重）、多选全选、批量收藏
- 预订表单：实时合计价、联系人持久化预填（仅当前值为空才填，不覆盖用户输入）

**民宿页**（`/homestay`，7 条 mock 数据）

- 关键词 + 房型（整套 / 单间 / 合住）筛选，选中房源异步拉详情，同一份 `DetailBody` 在内联区与抽屉双呈现
- 加收藏直接执行，**取消收藏走二次确认**；一个确认弹窗按场景（判别联合 + 文案表）承载多种业务
- 询价按晚计价（7、8 月旺季 1.2 倍加价，住满 7 晚立减一成），报价拆成每晚均价 / 原价 / 立减 / 合计回显，提交成功后由 listener 中间件自动收起详情
- 撤回询价同样走确认弹窗；关键交互均有埋点，公共 tag 统一从 store 派生

**mock 的失败触发点**（用来看错误态、回滚与字段级报错）

| 操作                                     | 触发条件            | 结果                       |
| ---------------------------------------- | ------------------- | -------------------------- |
| 酒店搜索                                 | 关键词填 `error`    | 列表整体报错，可重试       |
| 收藏「西湖景澜酒店」（`h2`）             | 单项收藏 / 批量收藏 | 失败并回滚；批量时保留勾选 |
| 预订「北京王府井大饭店」（`h5`）         | 提交预订            | 提示已订满                 |
| 收藏「厦门曾厝垵・文艺合住青旅」（`l3`） | 单项收藏            | 失败并提示                 |
| 预订 / 询价手机号填 `13800000000`        | 提交表单            | 手机号字段级报错回填       |

## ⚙️ 配置

- **路径别名**（`vite.config.ts` 与 `tsconfig.json` 的 `paths` 一一对应）：`@` → `src`，`~` → 仓库根。
- **TypeScript**：`strict` 之外还开了 `noImplicitReturns`、`noFallthroughCasesInSwitch`、`noUncheckedIndexedAccess`、`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`。
- **无 mock 中间件、无 proxy**：数据都在页面内的 `data/services.ts`，不经请求基座。

## 📄 License

[MIT](./LICENSE) © Lyndon
