# 按 code-spec 对齐 page-canonical

## 1. 需求

**目标**：让 page-canonical 的业务源码符合 frontend-code-spec 的规约，写法以它的 `src/` 为实现参照。分层骨架文件名保持不变，页面行为保持不变。

**不做**：

- 不把航班请求层搬进本仓 — 原因：参照的是写法（编排与细节分开、注释只写原因、类型从一个取值来源派生），本仓仍用页面内 mock
- 不改骨架文件名 — 原因：已确认保留 `store` / `model` / `actions` / `effects` / `live` / `slice` / `listeners` / `data/services.ts` / `index.tsx`
- 不把 `actions` 改名为 `commands` — 原因：已看过，重名不值得换词
- 不引入 vitest 和覆盖率门禁 — 原因：本仓没有单测，这次不对齐 code-spec 的 `pnpm test:cov`
- 不改 skills 仓库 — 原因：这次只改 page-canonical

**可用资源**：

| 类别     | 路径/说明                                                                        | 用途                                       |
| -------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| 参考实现 | `/Users/lyndon./Desktop/frontend-code-spec/src/apis/request.ts`                  | 编排函数只调用有名字的步骤，注释写原因     |
| 参考实现 | `/Users/lyndon./Desktop/frontend-code-spec/src/components/flight-card/index.tsx` | 组件：Props 接口、函数体首部解构、默认导出 |
| 参考实现 | `/Users/lyndon./Desktop/frontend-code-spec/src/apis/services/flight.ts`          | 取值数组派生类型                           |
| 规约     | `/Users/lyndon./Desktop/frontend-code-spec/.agents/rules/`                       | 工具判不了的写法                           |
| 工具     | frontend-code-spec 的 eslint、stylelint、ls-lint、prettier                       | 机器能判的部分以它们的报错为准             |

**澄清记录**：

| 编号 | 问题                         | 用户回答                                              |
| ---- | ---------------------------- | ----------------------------------------------------- |
| Q-1  | 骨架文件名要不要改成领域名   | 保留骨架闭合集合                                      |
| Q-2  | 写入口要不要改成 commands    | 保持 actions                                          |
| Q-3  | code-spec 还在改，要不要先停 | 先停；现在 code-spec 已好，用它的实现当参考，继续改造 |

---

## 2. 交付项

| 编号 | 要做什么                                                                                                           | 怎么验                                                                                          | 期望结果                                                                       | 状态    | 实际表现                                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------- |
| D-1  | 本仓能跑 code-spec 的 eslint、stylelint、ls-lint、prettier。规则实现从旁边的 frontend-code-spec 引用，不复制规则源 | 跑 `pnpm lint`、`pnpm lint:style`、`pnpm lint:filename`、`pnpm format:check`、`pnpm type-check` | 五条命令退出码都是 0                                                           | 🚫 已取消 | 检查命令、检查依赖和 eslint.config.js 不进本仓。代码仍按 code-spec 写，工具留在标准仓                            |
| D-2  | 业务源码按参照改写法：编排和细节分开，注释只留原因，外部值在入口收窄，格式与参照一致                               | 抽看 `src/pages/hotel/actions.ts` 和 `src/apis` 不存在这件事                                    | 酒店写入口里没有 `// ──` 分段注释；取数仍在 `data/services.ts`，没有航班请求层 | ✅ 通过 | 酒店写入口没有分段注释。`loadMoreHotels` 只做闸门再调用 `loadNextHotelPage`。没有 `src/apis`                     |
| D-3  | 样式的间距、圆角、颜色从 `theme.ts` 的令牌来，scss 不写裸长度和色值                                                | 跑 `pnpm lint:style`，并打开酒店筛选条                                                          | stylelint 通过；筛选条的留白仍是现在的节奏                                     | ✅ 通过 | `pnpm lint:style` 退出码 0。筛选条仍是关键词、星级、结果数这一排，间距值沿用原来的 px 令牌                       |
| D-4  | 两页主路径行为不变                                                                                                 | 浏览器打开 `/hotel` 做一次筛选和收藏，打开 `/homestay` 选中一条并提交询价                       | 酒店列表按关键词变化；收藏有结果。民宿详情出现；询价提交有报价或字段错误       | ✅ 通过 | 搜「外滩」后只剩外滩和平饭店，收藏按钮变为「取消收藏」。选中西湖边房源后详情出现，提交询价后页面出现「房东报价」 |

---

## 3. 代码现状

| 位置                                                          | 现在怎么做的                                                                            |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/pages/hotel/actions.ts:67`                               | 写入口用 `// ── 列表 ──` 这种分段注释，民宿页 `actions.ts:77` 起同样有六段              |
| `src/pages/hotel/actions.ts:85-102`                           | `loadMoreHotels` 在同一个方法里做并发闸门、取页码、请求、世代号判断和写 store           |
| `src/pages/homestay/shared/trace.ts:12-14`                    | 埋点用 `console.info`，并就地关掉 `no-console`                                          |
| `src/lib/error.ts:1-3`                                        | 跨页面原语放在 `src/lib/`，code-spec 的公共目录用的是 `src/utils/`                      |
| `src/theme.ts:3-23`                                           | 颜色令牌在 `theme.ts`，同时喂 antd 和 CSS 变量                                          |
| `src/pages/hotel/modules/search-filter/index.module.scss:2-3` | 间距是 `16px`、`26px` 这类裸长度。stylelint 只放行 `0`、`auto`、`inherit` 和 `var(--…)` |
| `package.json`                                                | 只有 `dev` / `build` / `preview` / `type-check`，没有 lint 脚本                         |
| `package.json` 的 lint 脚本                                   | 检查命令引用旁边 frontend-code-spec 的配置，本仓不放规则文件副本                        |
| 全仓 `.ts` / `.tsx`                                           | 引号是双引号。参照实现是单引号、尾逗号、行宽 100                                        |

**关键结论**：

- 骨架和页面行为不动，要改的是写法、格式、样式令牌，以及把检查接进本仓。
- `src/lib` 改成 `src/utils`，与参照的公共目录同名。`modules/`、`shared/`、`data/` 保留，它们是分层槽位，不是又一个 common。
- 令牌继续只写在 `theme.ts`。scss 改成消费变量，变量值沿用现在的 px，避免为了过检查改视觉。

**读不明白的地方**：无

---

## 4. 设计

**设计说明**：无。没有新界面，也没有新的对外接口。组件形态照 `flight-card/index.tsx`：`XxxProps` 接口、函数体首部解构、tsx 默认导出。取数函数照现在的 `data/services.ts` 留在页面内。

**设计稿**：无

---

## 5. 步骤

| 编号  | 做什么                                                                                         | 涉及文件                                                                                                                        | 交付项   | 完成 |
| ----- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------- | ---- |
| S1    | 接入 eslint、stylelint、ls-lint、prettier，脚本与参照对齐；`src/lib` 改为 `src/utils` 并改引用 | `eslint.config.js`、`.stylelintrc.js`、`.ls-lint.yml`、`prettier.config.js`、`package.json`、`src/lib/**`、引用 `@/lib/` 的文件 | D-1      | [x]  |
| S2    | 按参照重排业务源码：去掉分段注释，编排和细节拆开，入口收窄，再跑格式化                         | `src/**/*.{ts,tsx}`                                                                                                             | D-2      | [x]  |
| S3    | 间距和圆角收进 `theme.ts`，scss 改为 `var(--…)`                                                | `src/theme.ts`、`src/**/*.scss`                                                                                                 | D-3      | [x]  |
| S4    | 跑五条检查命令，再在浏览器走两页主路径                                                         | —                                                                                                                               | D-1、D-4 | [x]  |
| I1-S1 | 删掉复制进来的规则文件，检查命令改为引用旁边 frontend-code-spec 的配置                         | `.ls-lint.yml`、`.stylelintrc.js`、`prettier.config.js`、`.prettierignore`、`package.json`、`eslint.config.js`                  | D-1      | [x]  |
| I2-S1 | 去掉检查脚本、检查依赖和 eslint.config.js。D-1 撤销                                              | `package.json`、`eslint.config.js`                                                                                              | D-1      | [x]  |

---

## 6. 变更记录

| 版本 | 日期             | 级别 | 变更内容                                                                             | 涉及章节         | 需重验 |
| ---- | ---------------- | ---- | ------------------------------------------------------------------------------------ | ---------------- | ------ |
| v1   | 2026-10-23 16:06 | —    | 首次交付计划                                                                         | 全文             | —      |
| v2   | 2026-10-23 16:18 | L3   | 规则文件不复制进本仓，检查改为引用旁边的 frontend-code-spec 配置。代码仍按那套标准写 | 代码现状、步骤表 | D-1    |
| v3   | 2026-10-23 16:29 | L1   | 检查脚本、检查依赖和 eslint.config.js 不进本仓。代码仍按 code-spec 写，工具留在标准仓 | 交付项表、步骤表 | —      |
