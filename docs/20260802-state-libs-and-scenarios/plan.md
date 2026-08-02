# 三页状态库重新分配与架构议题补齐

## 1. 需求

**目标**：按业务常用度重新分配三页的状态库（酒店 zustand 不变、民宿改 Redux Toolkit、机票改 unstated-next），并给酒店与民宿各补两个该栈特有的架构议题，让范式仓库在两个主力栈上覆盖更完整。

**不做**：

- 互换两页的业务内容 — 原因：换的是状态库实现，页面业务（民宿=房源+询价+详情+确认弹窗，机票=航班+排序+退改规则+预订）保持原样
- 简化机票的架构议题 — 原因：用户明确要求机票照常，`fare-rules` 的条件闸门、定义表、派生态翻转、竞态守卫四项全部用 unstated-next 重写，保持三栈能力对等
- 引入第四个状态库或替换现有三栈 — 原因：超出本次范围
- 改动 `adapters/` 三份 adapter 的既有骨架 — 原因：adapter 按栈组织，不随页面分配变化；本次只反哺新议题的结论

**可用资源**：

| 类别     | 路径/说明                                        | 用途                        |
| -------- | ------------------------------------------------ | --------------------------- |
| 参考实现 | `src/pages/flight/**`（现 RTK 实现）             | 民宿换 RTK 的写法参照       |
| 参考实现 | `src/pages/homestay/**`（现 unstated-next 实现） | 机票换 unstated-next 的参照 |

**澄清记录**：

| 编号 | 问题                           | 用户回答                                                                          |
| ---- | ------------------------------ | --------------------------------------------------------------------------------- |
| Q-1  | 换栈是否意味着两页业务内容互换 | 不互换，只换状态库实现                                                            |
| Q-2  | 机票议题简化到什么程度         | 不简化，照常保留 `fare-rules` 全部议题                                            |
| Q-3  | 民宿现有弹窗议题怎么迁         | 原样迁移，状态归属结论不变                                                        |
| Q-4  | 酒店与民宿各补哪些议题         | 酒店补多选批量操作 + 持久化；民宿补 entityAdapter + listenerMiddleware + 埋点收口 |
| Q-5  | 换栈的验收基线                 | 行为完全不变，用浏览器重跑现有交互作回归                                          |

---

## 2. 交付项

一个 D-x 是一条用户可独立验证的交付项——既是这次要做的事，也是验收它的判据。

| 编号 | 要做什么                                   | 怎么验                                                                                                                             | 期望结果                                                                                                                                                                   | 状态      | 实际表现                                                                                                                                                                                                              |
| ---- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-1  | 民宿页改用 Redux Toolkit，交互行为不变     | 浏览器打开 `/homestay`：点卡片看内联详情 → 点「展开完整详情」开抽屉 → 抽屉内收藏 → 再点取消收藏出确认弹窗 → 确认；再点 l3 卡片心形 | 五步全部与换栈前一致：详情两处同源渲染、抽屉才出操作区、确认弹窗文案按场景变、l3 收藏失败时列表顶部出提示条                                                                | ✅ 已验收 | 五步全通过。补验两个场景的文案差异：`RemoveFavorite` 只有标题「确认取消收藏？」，`CancelInquiry` 带 desc 与不同 okText                                                                                                |
| D-2  | 机票页改用 unstated-next，四项议题全部保留 | 浏览器打开 `/flight`：选 CA1831 看退改规则 → 选 HU7605（已停售）→ 展开建议 → 切分类 Tab → 连续点两个航班                           | CA1831（f1 经济舱）分组计数 `0/3` 与 `2/3`、HU7605（f4 头等舱）为 `3/3` 与 `2/3`；选座因停售被翻转为不符合、建议文案走阻断变体、Tab 只留对应分组、连点后显示后点航班的规则 | ✅ 已验收 | 五步全通过。选座在 mock 为 `qualified: true` 却因 `SoldOut` 翻转为「不符合」，建议文案走阻断变体「该班次已停售，选座入口不再开放」；连点 CA1831→HU7605 后规则标题、选中卡片、规则内容三者都对齐到 HU7605              |
| D-3  | 酒店支持多选与批量收藏                     | 浏览器打开 `/hotel`：勾选 3 家（含 h2）→ 点批量收藏                                                                                | 工具栏显示已选 3 家；提交后成功的两家心形亮起、h2 失败并在提示条里点名它，选中态保留可重试                                                                                 | ✅ 已验收 | 提示条点名「西湖景澜酒店（收藏服务暂不可用）」，另两家心形亮起，工具栏留「已选 1 家」可原地重试                                                                                                                       |
| D-4  | 酒店的筛选条件与收藏在刷新后保留           | 浏览器打开 `/hotel`：改筛选条件、收藏两家 → 刷新页面                                                                               | 刷新后筛选条件与收藏仍在，且列表按恢复的筛选条件重新拉取，无闪回默认值                                                                                                     | ✅ 已验收 | localStorage 只落盘 `appliedParams` 与 `favoriteIds`；不带 query 打开恢复五星筛选与两处收藏，带 `?star=3` 时 URL 压过持久化偏好。另修掉筛选草稿未随恢复值初始化导致筛选器显示「不限」的问题                           |
| D-5  | 民宿房源改用 entityAdapter 规范化存储      | 浏览器打开 `/homestay`：点卡片选中 → 收藏 → 看详情                                                                                 | 列表、选中、收藏、详情全部正常；Redux devtools 中 `listings` 为 `{ids, entities}` 形态而非数组                                                                             | ✅ 已验收 | 功能全部正常，房源计数与按 id 取详情都改走 adapter selector（`selectTotal` 读 `ids.length`、`selectById` 走字典），未开 devtools，以 selector 行为作为规范化结构的实证                                                |
| D-6  | 民宿用 listenerMiddleware 承接跨模块联动   | 浏览器打开 `/homestay`：选中一套房源 → 填表提交询价（正常手机号）                                                                  | 提交成功后清空房源选中与详情内容，让用户能接着看下一套；该联动不写在提交 action 里                                                                                         | ✅ 已验收 | **期望已修正**：抽屉是 modal，mask 挡住页面下方的询价表单，原定「提交后关抽屉」在真实交互下不可达。改为「提交成功 → 清空选中与详情」，实测提交后卡片取消高亮、详情区回到占位文案，联动只在 `listeners.ts` 里          |
| D-7  | 民宿的埋点通用参数从 store 派生并统一上报  | 浏览器打开 `/homestay`，开控制台：点卡片、收藏、开抽屉                                                                             | 每次上报都带同一组通用参数（页面、筛选条件、选中房源），各处不重复拼参数                                                                                                   | ✅ 已验收 | 三条上报（`listing_select` / `listing_favorite_toggle` / `detail_drawer_open`）的通用参数完全一致，调用点只传 `listingId`、`willFavorite`；`listing_select` 上报时 `selectedListingId` 仍为点击前的空串，时序符合约定 |
| D-8  | 新议题的结论反哺两个 skill                 | 读 `layer-page-architecture/SKILL.md` 与 `review-code/rules/*`，跑 `review-code/scripts/self-check.py`                             | 多选批量、持久化、entityAdapter、listenerMiddleware、埋点收口五项各有对应条款；self-check 无新增问题                                                                       | ✅ 已验收 | `layer-page-architecture` §0.7 新增四小节（批量操作、持久化、跨模块联动、埋点收口）、§0.5 差异表补四行栈差异 + RTK 约束加第 4 条（store 只放可序列化值）、验收清单补 6 项与 RTK 专项一组；`review-code` 新增 G1.7（批量部分成功）、G1.8（持久化范围与时序），G3.4 补 lint 盲区段（返回对象里没人取的字段）。self-check 由 86 条增至 88 条，仍为 8 个既有问题、无新增 |

---

## 3. 代码现状

| 位置                                           | 现在怎么做的                                                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/router/routes.ts:21,27,33`                | `lib` 字段硬编码三页所用状态库：hotel=zustand、homestay=unstated-next、flight=redux toolkit                |
| `src/pages/homestay/store.ts:91`               | `createContainer(usePageStoreHook)`，store 是 91 行的一串 `useState`，扁平返回 `{value, setValue}` 成对    |
| `src/pages/homestay/actions.ts:42`             | actions 是 hook（`usePageActions`），竞态守卫用 `useRef(0)` 承载；`loadListings` 用 `useCallback` 稳定引用 |
| `src/pages/homestay/index.tsx:41,53`           | `PageStore.Provider` 在最外层，`FormProvider` 包询价两模块                                                 |
| `src/pages/homestay/modules/*/model.ts`        | 三个模块各自 `createContainer`，模块入口用 `XxxModel.Provider` 包 `Inner` 组件                             |
| `src/pages/flight/store.ts:122-126`            | `configureStore` 的 reducer map 注册 page + searchBar + flightResults + fareRules 四个 reducer             |
| `src/pages/flight/actions.ts:35`               | actions 是纯对象，竞态守卫用模块级 `let latestFareRulesRequestId = 0`                                      |
| `src/pages/flight/modules/*/slice.ts`          | 三个模块各有 `slice.ts`（与 model.ts 分离以规避循环依赖）                                                  |
| `src/pages/flight/modules/fare-rules/rules.ts` | `RULE_DEFINITIONS` 定义表，含 `resolveQualifiedDesc` / `resolveDesc` 变体与 `blockReason`                  |
| `src/pages/flight/shared/gate.ts`              | `isBookingAllowed` 纯函数，被页面 action 与 `selectIsBookingAllowed` 共用                                  |
| `src/pages/hotel/store.ts:15,16,21`            | zustand 单 store，已有 `loadedPage` / `hasMore` / `favoriteIds`，无多选集合、无持久化中间件                |
| `src/pages/hotel/actions.ts`                   | 纯对象 actions，已有分页三道闸与乐观更新快照回滚                                                           |

**关键结论**：

1. 两页换栈的难点不对称。民宿 → RTK 是「把 hook 型 actions 改成纯对象 + 把 useState 收成 slice」，方向是收敛；机票 → unstated-next 是「把纯对象 actions 改成 hook + 模块级竞态序号改 useRef + 补 Provider 嵌套」，方向是发散，且 `fare-rules` 的 `createSelector` 记忆化要改成 `useMemo`，四项议题的落法都要重写。
2. `fare-rules` 的定义表（`rules.ts`）、分类配置（`category.ts`）、闸门（`shared/gate.ts`）都是纯数据与纯函数，不依赖状态库，换栈时可原样保留——真正要改的只有 `model.ts` / `slice.ts` / `actions.ts` 三处。
3. 民宿现有的状态归属结论（`visible`/`confirmScene` 在页面层、`isConfirming` 在弹窗模块）在 RTK 下对应「页面 slice 字段」与「模块 slice 字段」，归属判断不变、承载物变化，这正是两栈对照的价值点。

**读不明白的地方**：无

---

## 4. 设计

**设计说明**：无需设计稿。三类改动分别对应：

- 换栈（D-1、D-2）属纯内部实现替换，不产生新的对外接触面，照 `src/pages/flight/**`（RTK）与 `src/pages/homestay/**`（unstated-next）的现有分层骨架互为参照即可。
- D-5 entityAdapter、D-6 listenerMiddleware、D-7 埋点收口均无界面，属内部改动。
- D-3 多选批量与 D-4 持久化有界面增量，但都在现有设计语言内扩展：多选复选框沿用卡片内 `data-*` 状态样式、批量工具栏沿用 `hotel-list` 现有 header 的排布与 `--card` / `--line` token，失败提示沿用现有 `Alert` 提示条（照 `hotel-list/index.tsx` 的 `favoriteAlert` 扩展）。持久化无新增界面。

**设计稿**：无

---

## 5. 步骤

| 编号 | 做什么                                                                                                                                                             | 涉及文件                                                                            | 交付项   | 完成 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | -------- | ---- |
| S1   | 民宿页面层换 RTK：store 改 `createSlice` + `configureStore`，actions 改纯对象、竞态守卫改模块级序号，effects 去掉 hook 依赖                                        | `homestay/{store,actions,effects}.ts`                                               | D-1      | [x]  |
| S2   | 民宿模块层换 RTK：五个模块的 model 改 `createSelector`、私有态拆 `slice.ts`，入口去掉 Model.Provider                                                               | `homestay/modules/**`、`homestay/index.tsx`                                         | D-1      | [x]  |
| S3   | 机票页面层换 unstated-next：store 改 `createContainer`，actions 改 hook、竞态守卫改 `useRef`，effects 依赖 action 稳定引用                                         | `flight/{store,actions,effects}.ts`                                                 | D-2      | [x]  |
| S4   | 机票模块层换 unstated-next：四个模块 model 改 `createContainer` + `useMemo` 派生，删 `slice.ts`，入口补 Provider 嵌套；`rules.ts`/`category.ts`/`gate.ts` 原样保留 | `flight/modules/**`、`flight/index.tsx`                                             | D-2      | [x]  |
| S5   | 更新路由表的 `lib` 字段与导航展示                                                                                                                                  | `src/router/routes.ts`                                                              | D-1、D-2 | [x]  |
| S6   | 酒店多选：store 加选中集合，actions 加全选/反选/批量收藏（部分失败要点名失败项），列表加复选框与批量工具栏                                                         | `hotel/{store,actions}.ts`、`hotel/modules/hotel-list/**`、`hotel/data/services.ts` | D-3      | [x]  |
| S7   | 酒店持久化：接 zustand `persist` 中间件，只持久化筛选条件与收藏，hydration 完成后再按恢复的条件拉列表                                                              | `hotel/store.ts`、`hotel/effects.ts`                                                | D-4      | [x]  |
| S8   | 民宿房源改 `createEntityAdapter` 规范化存储，selector 经 adapter 的 `getSelectors` 派生                                                                            | `homestay/store.ts`、`homestay/actions.ts`、`homestay/modules/*/model.ts`           | D-5      | [x]  |
| S9   | 民宿接 `listenerMiddleware`，把「询价提交成功 → 关抽屉、清确认场景」的跨模块联动从 action 移到监听器                                                               | `homestay/{store,listeners}.ts`、`homestay/actions.ts`                              | D-6      | [x]  |
| S10  | 民宿埋点收口：`selectTraceCommonTag` 从 store 派生通用参数，actions 提供 `trackClick`，各处只传差异参数                                                            | `homestay/{store,actions}.ts`、`homestay/shared/trace.ts`、`homestay/modules/**`    | D-7      | [x]  |
| S11  | 反哺 `layer-page-architecture`：§0.7 补多选批量与持久化两条，§0.5 状态库差异表补三栈在新议题上的落法差异                                                           | `layer-page-architecture/SKILL.md`、`adapters/redux-toolkit.md`                     | D-8      | [x]  |
| S12  | 反哺 `review-code`：把「批量操作的部分失败要点名失败项」「持久化字段要显式白名单」落成条款                                                                         | `review-code/rules/**`                                                              | D-8      | [x]  |

---

## 6. 变更记录

| 版本 | 日期             | 级别 | 变更内容                                                                                                                                                                                                       | 涉及章节  | 需重验       |
| ---- | ---------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------ |
| v1   | 2026-08-02 12:20 | —    | 首次交付计划                                                                                                                                                                                                   | 全文      | —            |
| v2   | 2026-08-02 13:05 | 轻微 | 修正 D-2 判据：原写「分组计数 3/3 与 2/3」把两个航班的表现混成一行。CA1831 是 f1 经济舱规则、正确值为 `0/3` 与 `2/3`；`3/3` 与 `2/3` 属 HU7605。代码无改动                                                     | §2        | 否           |
| v3   | 2026-08-02 14:20 | 一般 | 改 D-6 的联动内容：详情抽屉是 modal，mask 挡住页面下方的询价表单，原定「提交成功 → 关抽屉」在真实交互路径下不可达（是伪场景）。改为「提交成功 → 清空选中与详情」，同样跨 listing-list 与 listing-detail 两模块 | §2、§5 S9 | 是（已重验） |
| v4   | 2026-08-02 14:20 | 轻微 | S9 附带把页面 slice 从 `store.ts` 拆到 `slice.ts`：`listeners.ts` 需要 action creator 与 `RootState`，不拆会与 `store.ts` 形成运行时循环依赖                                                                   | §5 S9     | 否           |
| v5   | 2026-08-02 14:20 | 一般 | S7 附带修一处持久化引出的缺陷：`search-filter` 的草稿初值硬编码默认值，`appliedParams` 从持久化恢复后筛选器显示「不限」而列表是五星结果。改为由模块 effect 订阅已提交条件同步草稿                              | §5 S7     | 是（已重验） |
| v6   | 2026-08-02 14:20 | 轻微 | 机票 `booking-form` 原先 model 暴露 `isVisible` 但 UI 未消费，闸门不通过时预订表单仍会渲染。让 UI 消费该字段（mock 下闸门恒通过，行为不变）                                                                    | §5 S4     | 否           |
