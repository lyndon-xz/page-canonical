# 写入口从 actions 改名为 commands

## 1. 需求

**目标**：写入口保持 `actions.ts` 和 `pageActions` 这套名字。它表示页面能做的操作。

**不做**：

- 不把写入口改名为 `commands` — 原因：只为避开 `slice.actions` 重名，词义从「页面操作」偏到了「写指令」，读起来更怪
- 不改 `slice.actions` — 原因：那是 Redux Toolkit 的 action creator，和页面写入口不是同一个东西

**可用资源**：

| 类别     | 路径/说明                                                     | 用途             |
| -------- | ------------------------------------------------------------- | ---------------- |
| 参考实现 | `src/pages/hotel/actions.ts`、`src/pages/homestay/actions.ts` | 两页写入口的现名 |

**澄清记录**：

| 编号 | 问题                       | 用户回答                                     |
| ---- | -------------------------- | -------------------------------------------- |
| Q-1  | 骨架文件名要不要改成领域名 | 保留骨架闭合集合                             |
| Q-2  | 写入口要不要改名           | 先改成 commands 看效果，随后决定改回 actions |

---

## 2. 交付项

| 编号 | 要做什么                                                           | 怎么验                                     | 期望结果                                                                           | 状态      | 实际表现                                                      |
| ---- | ------------------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------- |
| D-1  | 9 个写入口文件改为 `commands.ts`，导出名与引用同步改成 `*Commands` | 打开酒店页、民宿页的写入口，并全仓搜索旧名 | 写入口文件名是 `commands.ts`；`pageActions` 等标识符不再出现；`slice.actions` 仍在 | 🚫 已取消 | 看过改名后决定保持 actions。代码、README、package.json 已恢复 |
| D-2  | 改名后类型检查通过                                                 | 跑 `pnpm type-check`                       | 退出码 0                                                                           | 🚫 已取消 | 随 D-1 撤销。改名当时 `pnpm type-check` 曾通过                |

---

## 3. 代码现状

| 位置                                                                            | 现在怎么做的                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/hotel/actions.ts:66`                                                 | 导出 `pageActions`，酒店页唯一写入口                                                                                                                                                                                   |
| `src/pages/homestay/actions.ts:76`                                              | 导出 `pageActions`；同文件内部也调用它                                                                                                                                                                                 |
| `src/pages/homestay/slice.ts:147`                                               | 导出的是 `homestayPageSlice.actions`，和写入口同名不同物                                                                                                                                                               |
| `src/pages/homestay/modules/confirm-dialog/slice.ts:33`                         | 导出的是 `confirmDialogSlice.actions`                                                                                                                                                                                  |
| `src/pages/homestay/modules/listing-detail/components/detail-body/index.tsx:72` | `styles.actions` 是按钮行 class                                                                                                                                                                                        |
| 模块 `actions.ts`                                                               | 酒店 3 个、民宿 4 个，各自导出 `searchFilterActions`、`hotelListActions`、`bookingFormActions`、`listingListActions`、`listingDetailActions`、`confirmDialogActions`、`inquirySubmitActions`，并引用页面 `pageActions` |

**关键结论**：

- 撞车只发生在民宿页：写入口和 slice 的 action creator 都叫 actions。
- 引用是标识符和相对路径 `./actions`、`../../actions`，没有桶文件再导出一层。
- 替换必须按完整标识符做，不能把 `slice.actions` 和 `styles.actions` 一起换掉。

**读不明白的地方**：无

---

## 4. 设计

**设计说明**：写入口继续叫 `actions.ts`，页面导出 `pageActions`，模块导出 `<module>Actions`。`slice.actions` 仍是 Redux 的 action creator。

**设计稿**：无

---

## 5. 步骤

| 编号  | 做什么                                                                                          | 涉及文件                                                                   | 交付项 | 完成 |
| ----- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------ | ---- |
| S1    | 9 个 `actions.ts` 改名为 `commands.ts`，同步标识符、import 和 README、package.json 里的分层叫法 | `src/pages/hotel/**`、`src/pages/homestay/**`、`README.md`、`package.json` | D-1    | [x]  |
| S2    | 跑 `pnpm type-check`                                                                            | —                                                                          | D-2    | [x]  |
| I1-S1 | 恢复 `actions.ts` 与 `*Actions`，README 和 package.json 一并回到改名前                          | `src/pages/hotel/**`、`src/pages/homestay/**`、`README.md`、`package.json` | D-1    | [x]  |

---

## 6. 变更记录

| 版本 | 日期             | 级别 | 变更内容                               | 涉及章节                         | 需重验   |
| ---- | ---------------- | ---- | -------------------------------------- | -------------------------------- | -------- |
| v1   | 2026-10-23 14:53 | —    | 首次交付计划                           | 全文                             | —        |
| v2   | 2026-10-23 15:55 | L1   | 撤销 commands 改名，写入口保持 actions | 需求节、交付项表、设计节、步骤表 | D-1、D-2 |
