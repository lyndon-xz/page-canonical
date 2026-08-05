# 状态建模

## 状态归属：页面层还是模块层

判断依据只有一条：**有几个模块要读它。**

一个模块自己读自己写的，留在模块 model 里。两个以上模块要读的，提到页面层。如果把跨模块的状态塞进其中一个模块，另一个模块就得反向 import 它，模块之间从此互相认识。

以 homestay 的详情为例。「当前看哪个房源的详情」这组状态触发方是 listing-list（卡片上的入口），消费方是 listing-detail，所以整组归页面层。

confirm-dialog 则被这条判据切成两半：弹窗开不开（`confirmScene`）归页面层，因为列表卡片与详情抽屉都能触发它；「确认中」（`isConfirming`）与提交失败信息（`confirmError`）归模块自己的 slice，它们只在弹窗自身的生命周期里有意义，触发方既不读也不该读。

判据里的「读」也包括 listener 读。homestay 的 `submittedInquiryId` 看着像 inquiry-submit 的私有状态，但它必须在页面层：listener 要监听它来触发「退出当前房源」（见[跨模块协作](cross-module.md)）。

同一条判据下，两个页面都提到页面层的是「选中项」与收藏态——判据看的是消费方数量，不是字段名。

### 用 null 代替额外的布尔

`confirmScene` 为 `null` 表示弹窗关闭，没有配套的 `isOpen`。多一个布尔就多一个必须与场景同步变更的值，漏改一处就会出现「开着但没有场景」或「有场景但不显示」。

hotel 的 `bookedHotelId` 是同一条的延伸：为 `null` 表示本次会话还没提交过预订，而存 id 而非「已提交」布尔，是因为布尔要在换选酒店与换结果集时各清一次，漏一处就会给没提交过的那家显示成功提示；存 id 则让 UI 比对当前选中得出结论，两处都不必同步。

homestay 的 `submittedInquiryId` 存 id 还多一层动机：撤回询价必须把服务端给的 id 报回去，这个值本来就要存，`inquirySubmitted` 布尔于是成了它的冗余投影。UI 需要的布尔由 model 派生（`hasSubmittedInquiry`），不在 store 里多存一份。

## 草稿态与已生效态要分开

搜索框里用户正在编辑的条件，和「当前这份结果集是按什么条件取回的」，是两个值。

草稿归模块（`search-filter` 的 model），已生效的归页面层（`appliedParams`）。合成一个值的话，用户每敲一个字都等于改了「结果集的口径」，而结果集并没有跟着变——之后任何基于它的判断（重试用什么条件、URL 同步什么、埋点报什么）都会错。

hotel 页的 search-filter 还有一层：草稿的初值不能硬编码默认值。持久化恢复出来的偏好是五星，草稿写死 0 的话，筛选器显示「不限」而列表是五星的结果。

所以草稿初值要**订阅**已生效值，而不是在挂载时读一次。storage 换成异步实现（IndexedDB 等）时，恢复完成会比挂载晚，读一次的写法就跟不上了。

## 取数状态用判别态，不用布尔组合

```ts
enum FetchStatus {
  Loading,
  Error,
  Ready,
}
```

不用 `isLoading` + `hasError` 两个布尔：四种组合里「加载中且已失败」是非法的，得靠各处 action 手动维持互斥，一处漏清就会同时转圈又报错。判别态从类型上就排除了非法组合。

`Ready` 兼作初始值，语义是「没有进行中的请求，也没有失败」，此时显示什么由内容自身决定（空列表显示空占位，有数据显示数据）。UI 侧消费这个判别态的写法见[分支渲染](branching.md)。

### 为什么取数失败要进状态，而操作失败走 toast

取数失败要把整块内容换成占位与重试入口，这依赖渲染分支，所以必须是状态。toast 三秒就散，剩下一个空列表，用户既不知道发生过什么也没有重试的地方，只能刷新整页。

操作类失败（收藏、提交）反过来：界面结构不变，用户只需即时知道没成功，toast 就够，不必在 store 里留一个用完就得清的错误字段。

两个例外，判据仍是同一条——错误要不要影响渲染分支：

- 二次确认弹窗里的提交失败要留在弹窗内让用户原地重试，所以 confirm-dialog 存 `confirmError`。
- 批量收藏的失败是一份清单（哪几家没成、各自什么原因），要渲染成可逐项核对的 Alert 并保留在选中态里供重试，所以 hotel 存 `batchFavoriteFailures`，并配一个专门的 dismiss action 清它。

### 不存失败原因

`FetchStatus` 只表达「界面该显示什么」，不带失败原因。取数失败的占位文案是固定的，服务端消息没有出场的地方，存下来就是没人读的死值。原因属于日志与上报。

## 枚举取值要与类型同源

一个字段的合法取值有几个，就只声明一次。`SortBy` 的来源是数组，类型从数组派生：

```ts
export const SORT_BY_VALUES = ["price", "rating", "distance"] as const;

export type SortBy = (typeof SORT_BY_VALUES)[number];
```

反过来手写 `type SortBy = "price" | "rating" | "distance"`，运行时想遍历这些值就得再抄一份数组，两份从此各自演进。

消费点一律用 `Record<SortBy, ...>` 而不是数组，因为 `Record` 是 exhaustive 的：比较器与 sort-bar 的 `SORT_LABELS` 少一个 key 就编译不过。展示文案该留在 UI 层，但用 `Record<SortBy, string>` 而不是 `{ label, value }[]`——同样是为了这层检查。渲染时遍历 `SORT_BY_VALUES`，按钮顺序也就由声明顺序决定。

比较器本身落在哪一层，由排序在哪执行决定，与取值怎么建模无关。hotel 分页加载，排序须由服务端在全量数据上做，`sortBy` 因此是取数参数，比较器跟着落在 `data/services.ts`。若改成全量在手、前端本地排，`sortBy` 就退化成模块内的展示态，比较器也就该搬进模块 model。

这样加一个排序值只改 `SORT_BY_VALUES` 一行，校验自动跟随，两处查表由编译器点名。

### enum 留给服务端契约

`SortBy` 不用 enum，不是因为 enum 不安全，而是它一处也省不掉：`comparators`、`SORT_LABELS` 照样各写三条，URL 校验照样得写 `Object.values(SortBy).includes(raw)`。它只把 `"rating"` 换成 `SortBy.Rating`，而拼错这件事 union 已经由编译器管住了。代价是 enum 会生成运行时代码，与「类型只存在于编译期」的心智不一致，`erasableSyntaxOnly` 下还直接不可用。

该用 enum 的判据是**值本身是不是外部契约**。契约值由服务端定义时，enum 成员名把它与前端引用解耦：服务端改了那个字符串，只动 enum 定义一处，所有引用点不变。`SortBy` 的取值是前端自己定的（连 URL 参数名也是），没有这层解耦需求，需要遍历的场合反而更多。

`FetchStatus` 与 `ConfirmScene` 都不是契约，但它们连字符串值都不需要，纯做判别用：取值从不出接口、也不进 URL，成员名就是全部信息。这类归 enum，与 `SortBy` 那种「前端定义且需要遍历」的取值分属两头。

### 边界上的值必须运行时收窄

编译期安全只在值不越过系统边界时成立。URL、接口来的值到手是 `string`，enum 还是 union 都拦不住，唯一的办法是在边界收窄一次，且校验依据要引用同一份来源：

```ts
const isSortBy = (value: string): value is SortBy =>
  (SORT_BY_VALUES as readonly string[]).includes(value);
```

这里另抄一个 `["price", "rating", "distance"]` 是最隐蔽的一种错：加了新排序值忘了同步，`?sortBy=popularity` 会被判为非法、静默降级成默认排序，而 `comparators` 那边有 exhaustive 检查会报错，人容易以为已经改全了。

同一道边界上，用查询代替索引取值更稳。`Record<Union, T>` 的索引结果类型不带 `undefined`，服务端多下发一个前端还没定义的 key 时它在运行时就是 `undefined`，接着取字段直接抛错；若这行在渲染路径上，代价是整块白屏。`includes` 遇到未知值只是匹配不上。区别在于索引取值假设 key 一定存在，查询不假设。

## 持久化只存长期偏好

hotel 页用 zustand persist，`partialize` 是白名单而不是黑名单，只落盘 `appliedParams`、`favoriteIds` 与常用联系人 `contact`。

预订表单因此被切成两半：入住人与手机号提到 `contact` 落盘，入住日期、晚数、房间数留在表单里。判据是这个值下次进页面还成不成立——联系人几乎不变，行程每单都不同，存下来只会让用户先删掉旧值再填。`contact` 只在提交成功后写入：填了没提交出去的不算用户确认过的常用信息。

默认整棵 state 落盘会连瞬时态与服务端快照一起存：取数状态存下来后重进页面会停在上一次的 loading 或错误占位上；列表数据存下来是一份会过期的旧数据；多选集合与批量失败清单是一次性的操作意图与结果。这些都不该跨会话活着。

恢复时用 `merge` 把落盘值与当前默认值合并，而不是直接展开覆盖。落盘结构会随版本演进——给 `appliedParams` 新增一个字段后，老用户存下来的那份缺它，直接展开会让该字段变成 `undefined`，一路传到取数与排序里。

首屏取数要等恢复完成（`waitForHydration`）。localStorage 的恢复是同步的，这道门禁当下不起作用，但 storage 换成异步实现后，少了它首屏会先按默认条件拉一次、恢复后再拉一次，用户看到列表闪一下。

恢复出来的偏好不是最高优先级：URL 显式带了筛选条件就以 URL 为准（`resolveInitialParams`）。分享链接与带参刷新是用户的明示意图，持久化偏好是隐式的，不该盖掉明示。
