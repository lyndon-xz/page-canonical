# 状态建模

## 状态归属：页面层还是模块层

判断依据只有一条：**有几个模块要读它。**

一个模块自己读自己写的，留在模块 model 里。两个以上模块要读的，提到页面层。如果把跨模块的状态塞进其中一个模块，另一个模块就得反向 import 它，模块之间从此互相认识。

以 homestay 的详情为例。「当前看哪个房源的详情」这组状态触发方是 listing-list（卡片上的入口），消费方是 listing-detail，所以整组归页面层。

confirm-dialog 则被这条判据切成两半：弹窗开不开、要处理什么（`confirmRequest`）归页面层，因为列表卡片与详情抽屉都能触发它；「确认中」（`isConfirming`）与提交失败信息（`confirmError`）归模块自己的 slice，它们只在弹窗自身的生命周期里有意义，触发方既不读也不该读。

### 只在某个开关期间有意义的状态，生命周期就挂在那个开关上

上面这两个模块本地态在弹窗关闭后没有任何意义，所以它们的复位由 slice 直接监听 `confirmRequest` 的变更（RTK 的 `extraReducers`），而不是由每个关闭方各自记得清一下。

指望关闭方自觉的写法漏得很隐蔽：确认成功后关闭、换结果集时关闭，这两条路径都不经过「取消」按钮，于是上一次的报错会活到下次开弹窗，用户一打开就看到一条与当前操作无关的错误。关闭弹窗的路径只会越来越多，而每条新路径都是一次漏清的机会。

绑在开关上之后，模块 action 里只剩一处清理，管的也是另一件事：同一次弹窗内重试前要摘掉上次的报错。跨弹窗的复位与单次弹窗内的重试是两个时间尺度，不该由同一句代码兼任。

判据里的「读」也包括 listener 读。homestay 的 `submittedInquiry` 看着像 inquiry-submit 的私有状态，但它必须在页面层：listener 要监听它来触发「退出当前房源」（见[跨模块协作](cross-module.md)）。

同一条判据下，两个页面都提到页面层的是「选中项」与收藏态——判据看的是消费方数量，不是字段名。

### 用 null 代替额外的布尔

`confirmRequest` 为 `null` 表示弹窗关闭，没有配套的 `isOpen`。多一个布尔就多一个必须与它同步变更的值，漏改一处就会出现「开着但没有场景」或「有场景但不显示」。

hotel 的 `bookedHotelId` 是同一条的延伸：为 `null` 表示还没提交过预订，而存 id 而非「已提交」布尔，是因为布尔在换选酒店时就得清一次，漏了就会给没提交过的那家显示成功提示；存 id 则让 UI 比对当前选中得出结论，换选这一路不必同步。

但它仍要随结果集作废。换筛选条件后重新选回同一家，「预订已提交」会凭着上一份结果集里的那次提交直接出现，而用户这一次什么都没提交。存 id 省掉的是「换选」那一处同步，不是「换结果集」那一处——后者由 `resetResultSet` 统一清，判据见[取数与编排](data-fetching.md)的作废结果集一节。

homestay 的 `submittedInquiry` 存整条结果还多一层动机：撤回要把服务端给的 `inquiryId` 报回去，成功态要显示服务端算出的 `quote` 与回显的房源标题，这几个值同生同灭。配一个「已提交」布尔就是它们的冗余投影，UI 判断「询到价了没有」看整条在不在即可。

## model 按字段投影，不整块订阅

状态归属定下来之后，模块怎么读它是另一件事。两页的 model 都是同一个形状：投出一个只含本模块要的字段的对象，交由逐字段的浅比较决定要不要重渲染。zustand 那边是 `useShallow`，RTK 那边是 `useSelector` 的第二个参数 `shallowEqual`。

```ts
useAppSelector(
  (s) => ({
    listings: s.page.listings,
    listingsStatus: s.page.listingsStatus,
    selectedListingId: s.page.selectedListingId,
  }),
  shallowEqual,
);
```

反面写法是拿整块 state 喂 `createSelector`：

```ts
// 别这样：输入是整个 page
createSelector(selectPageState, (page) => ({ ...挑几个字段 }));
```

它看着有记忆化，实际一次也没命中：任一字段变更都产生新的 `page` 引用，缓存随之作废，结果函数重跑，返回一个新的对象字面量。

配上 `shallowEqual` 时，它的渲染行为与内联投影没有差别。所以问题不在这次跑得对不对，而在这块招牌是假的——读者看到 `createSelector` 会以为引用是稳定的，于是把外层的 `shallowEqual` 当多余的删掉。删掉的那一刻才真的退化：`useSelector` 默认按引用比较，每次 dispatch 重渲染全部订阅方。homestay 有过这个症状，一次 `setIsSubmittingInquiry` 连带重渲染列表、七张卡片、详情区与弹窗，而它们要的字段一个都没变。白挂的抽象比没有抽象贵，代价就在这里。

嫌投影字面量塞在 hook 里不好读，提出去命名是可以的，但写成普通函数：

```ts
const selectModel = (s: RootState) => ({ ...挑几个字段 });
```

### 订阅落在哪个组件上

投影决定订阅多少字段，组件位置决定这次订阅会重渲染谁。effects 也订阅——hotel 的「换条件后回滚视口」要靠 `appliedParams` 变更来触发——所以它调在哪个组件里同样要挑。

页面层的 effects 走一个返回 `null` 的 `EffectsRunner`。`usePageEffects` 眼下只有一句 `initPage`、没有订阅，但页面壳一旦因为 effects 的订阅重渲染，代价是整页所有模块跟着重渲染一遍。把它关进一个不渲染任何东西的组件里，将来加订阅也止步于此。

模块层的 effects 直接调在模块壳里，不再套一层。有几件副作用就 export 几个具名 hook——`hotel-list` 是 `useScrollBackOnResultSet` 与 `useLoadMoreOnSentinel` 两个，各自的参数与用途在调用处一一对应；再包一个 `useHotelListEffects` 转发全部参数，只会让调用处看不出哪个参数服务哪件事。其它模块各只有一件副作用，一个 hook 就是全部，不是因为形状必须如此。

不套 `EffectsRunner` 的判据有两条：

一是**影响范围**。模块壳重渲染只波及自己，而该模块的 model 本来就订阅着同一批状态——`useScrollBackOnResultSet` 多订阅的 `appliedParams` 引用，和 model 里的 `hotels`、`hotelsStatus` 在同一批更新里变，不产生额外的渲染。

二是**物理约束**。模块 effects 要的是这个模块渲染出来的 DOM 节点，ref 只能由渲染它的组件声明。把 effects 推进子组件，ref 就得再从父组件传回去，凭空多一层中转，换来的隔离恰好是上一条说的那个「本来就没有」。

所以 `EffectsRunner` 是页面层专属，不是全仓库的统一形状。判据是「这次订阅会牵连多少组件」，而不是「effects 一律要隔离」。

## selector 一律写成普通函数

订阅粒度由投影加浅比较解决之后，`createSelector` 就没有位置了。本仓库所有 selector 都是同一个形状，没有例外：

```ts
export const selectSelectedListing = (state: RootState) => {
  const { listings, selectedListingId } = state.page;

  return listings.find((listing) => listing.id === selectedListingId) ?? null;
};
```

`createSelector` 要挣到自己那层包装，得同时满足三条，缺一条就是白挂：

1. **返回的是新建的对象或数组。** 读字段、`find` 出数组里的元素、返回字符串这类原始值，引用或值本来就稳，记忆化无事可做。`selectSelectedListing` 与 `selectConfirmTarget` 都卡在这条：前者返回数组里那个对象的原引用，后者返回一个标题字符串。
2. **结果要参与订阅判等。** `selectTraceCommonTag` 确实新建对象，但它只在 action 里 `store.getState()` 读一次就扔，没人比较它的引用。
3. **输入能细到字段。** 细不到就是整块 `page`，缓存永不命中，退化成上一节那个反面例子。

三条同时成立的形状是「`filter`/`sort`/`map` 出一个新数组，且结果要进组件」——那时少了记忆化不是慢一点，是每次都给下游一个新引用、判等必挂。

这种派生本仓库只有一处：hotel 的 `batchFailureNames` 把批量收藏的失败 id `map` 成带酒店名的文案。它的缓存放在 model 的 `useMemo` 里，而不是一个记忆化 selector。这样分工干净：selector 只管从 state 里读，缓存归 model；zustand 那边本来也没有 `createSelector`，两栈于是是同一个写法。

判据因此不必每次现推：**selector 一律普通函数，要缓存的新数组交给 model 的 `useMemo`。** 统一成一种形状的收益比省下一次七元素的 `find` 大得多——读者不必在每个 selector 前先判断它属于哪一派。

## 草稿态与已生效态要分开

搜索框里用户正在编辑的关键词，和「当前这份结果集是按什么条件取回的」，是两个值。

草稿归模块（`search-filter` 的 model），已生效的归页面层（`appliedParams`）。合成一个值的话，用户每敲一个字都等于改了「结果集的口径」，而结果集并没有跟着变——之后任何基于它的判断（重试用什么条件、URL 同步什么、埋点报什么）都会错。

### 只有连续输入才需要草稿

判据是这个控件的每一次变更该不该直接触发取数。文本框每敲一个字都是一次变更，逐字取数不可接受，所以要有个草稿位攒着，等回车或点搜索再提交。

星级这类离散控件没有这个问题：一次点击就是一次完整的意图，直接 `applySearchParams` 即可。把它也塞进草稿，交互会自相矛盾——chip 点下去立刻高亮（`data-active` 读的是草稿），列表却不动，得再点一次「搜索」，而同一页的排序按钮是即点即生效的。圆角 chip 的高亮在任何产品里都是「已应用」的视觉语言，让它只表示「已勾选待提交」，光看界面无从分辨。

所以 hotel 的草稿里只有 `keyword`，`star` 直接读 `appliedParams.star`。少一个草稿字段，就少一处要与已生效值对齐的地方。

离散控件即时生效时要把当前草稿一起带上：点星级提交的是 `{ keyword, star }` 而不是只有 `star`。同一张筛选卡片里的条件，用户点其中一个时期望的是整卡生效；只提交 `star` 会把已输入的关键词留在草稿里，搜索框显示「上海」而结果是全国。

### 草稿初值要订阅已生效值

不能硬编码默认值。持久化恢复出来的关键词是「上海」，草稿写死空串的话，搜索框是空的而列表是上海的结果。

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

`Ready` 的语义是「没有进行中的请求，也没有失败」，此时显示什么由内容自身决定（空列表显示空占位，有数据显示数据）。UI 侧消费这个判别态的写法见[分支渲染](branching.md)。

**初值按「这块内容是不是挂载即取」来定，不是一律 `Ready`。** 两个列表都是挂载就取数的，初值给 `Ready` 意味着首帧宣称「没有请求在进行」，而列表又是空的，于是 `ListBody` 命中空占位分支——用户在数据回来前先看到一眼「暂无匹配的酒店」。所以这两个初值是 `Loading`。

localStorage 是同步恢复的，配上 React 的批处理，当下这一帧多半盖得住；但 hotel 首屏取数前还要过 `waitForHydration` 这道门禁，storage 一换成异步实现，这一帧就必然可见。初值本身就该说真话，不该靠时序侥幸。

反过来 homestay 的 `detailStatus` 初值仍是 `Ready`：详情不是挂载即取，要等用户选中某个房源才发请求，在那之前「没有进行中的请求」是事实。

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

homestay 的房型（`ROOM_TYPE_VALUES` / `RoomType`）是同一个形状。它不像 `sortBy` 那样有 exhaustive 的查表来兜底，但一样越过 URL 这道边界，所以更需要这份来源：裸 `string` 的字段看不出取值是封闭的，任何一处手写字面量都不会有人点名。

「不限」用空串表达（`RoomType | ""`），与 hotel 的 `star: 0` 是同一招：不另加一个「是否筛选房型」的布尔，也就没有两个值要同步。

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

**收窄的结果要降级到一个合法值，不能原样落库。** homestay 的房型非法时回落为「不限」，hotel 的排序与星级各自回落到 `DEFAULT_SEARCH_PARAMS` 里的那一份（同一份默认值也供 store 初值、persist 的 `merge` 与「URL 该省略哪些参数」使用，见[抽取](extraction.md)的复用一节）。原样放过去的话，`?roomType=豪华` 会一路传到筛选里得出一个空列表——用户看到的是「这地方没房」，而不是「这个筛选值不存在」，而页面上并没有筛选 UI 能让他改回来。

一个字段少了这层收窄，症状就是这样：不报错、不为空、只是安静地给出错误答案。

同一道边界上，用查询代替索引取值更稳。`Record<Union, T>` 的索引结果类型不带 `undefined`，服务端多下发一个前端还没定义的 key 时它在运行时就是 `undefined`，接着取字段直接抛错；若这行在渲染路径上，代价是整块白屏。`includes` 遇到未知值只是匹配不上。区别在于索引取值假设 key 一定存在，查询不假设。

## 持久化只存长期偏好

hotel 页用 zustand persist，`partialize` 是白名单而不是黑名单，只落盘 `appliedParams`、`favoriteIds` 与常用联系人 `contact`。

预订表单因此被切成两半：入住人与手机号提到 `contact` 落盘，入住日期、晚数、房间数留在表单里。判据是这个值下次进页面还成不成立——联系人几乎不变，行程每单都不同，存下来只会让用户先删掉旧值再填。`contact` 只在提交成功后写入：填了没提交出去的不算用户确认过的常用信息。

默认整棵 state 落盘会连瞬时态与服务端快照一起存：取数状态存下来后重进页面会停在上一次的 loading 或错误占位上；列表数据存下来是一份会过期的旧数据；多选集合与批量失败清单是一次性的操作意图与结果。这些都不该跨会话活着。

恢复时用 `merge` 把落盘值与当前默认值合并，而不是直接展开覆盖。落盘结构会随版本演进——给 `appliedParams` 新增一个字段后，老用户存下来的那份缺它，直接展开会让该字段变成 `undefined`，一路传到取数与排序里。

首屏取数要等恢复完成（`waitForHydration`）。localStorage 的恢复是同步的，这道门禁当下不起作用，但 storage 换成异步实现后，少了它首屏会先按默认条件拉一次、恢复后再拉一次，用户看到列表闪一下。

恢复出来的偏好不是最高优先级：URL 显式带了筛选条件就以 URL 为准（`resolveInitialParams`）。分享链接与带参刷新是用户的明示意图，持久化偏好是隐式的，不该盖掉明示。

**「URL 带了条件」要按本页自己的参数判断，不能看 query 串是否非空。** `if (window.location.search)` 对 `?ref=wechat` 这类无关参数同样成立，于是持久化的五星偏好被整份丢掉、静默降级成默认条件。这个判断的依据必须与解析用的是同一批 key，所以由 `parseSearchParams` 自己给出答案——一个本页参数都没读到就返回 `null`，调用方 `?? ` 到持久化值即可。判断与解析共用同一批 `query.get`，加参数时不会漏掉其中一处。
