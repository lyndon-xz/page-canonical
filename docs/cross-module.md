# 跨模块协作

模块之间不互相 import。需要协作时有四种手段，按耦合从低到高排列。

## 一、页面层共享

两个以上模块都要的值放在页面层，模块从各自 model 里取。homestay 的 `selectListings` 就在页面层：listing-list 要把它渲染成卡片，listing-detail 要按 id 从里面找出当前房源。

判断标准是消费方数量。只有一个模块要的派生值留在那个模块的 model 里——homestay 的 `selectDetailListing` 只有 listing-detail 读，提到页面层反倒是页面层多担了一份没人共享的派生。等第二个模块也要时再提，那时各算一遍才会漂移，也才白白多遍历一次列表。

页面根目录与 `shared/` 的分工是另一条轴：`shared/` 收页面内所有非骨架的共享件，页面根只留分层骨架（`index.tsx`、`store.ts`、`slice.ts`、`actions.ts`、`effects.ts`、`listeners.ts`、`live.ts`）。所以 hotel 的 `params.ts`、homestay 的 `filters.ts` 与 `trace.ts` 都在 `shared/` 里，尽管前两者各自只有一个消费方、跟「跨模块」无关。

URL 参数解析是这条的典型：它只被 effects 或页面 action 调一次，但它是一件独立的概念——把边界上的字符串收窄成页面的取数条件。写进 `effects.ts` 会让那一层同时承担「什么时候取数」和「取数条件怎么来的」两件事。而它与取值来源本就该同处一个文件：hotel 的 `params.ts` 里 `SORT_BY_VALUES` 定义取值、`SortBy` 由它派生、`parseSearchParams` 拿它校验，加一个排序值只改一行。

判据是消费方出不出单个模块的范围，不是「跨不跨模块」。只被一个模块消费的仍留在那个模块内（`confirm-dialog/scenes.ts`），第二个页面开始消费时再上提 `src/`。页面根之所以不留这类文件：骨架是封闭集合，读者扫一眼页面根就该认全这个页面有哪几层，混进概念文件后得先读内容才知道哪个是层、哪个是辅助件。

## 二、模块 action 转交页面 action

模块自己不做页面级的取数与写入，转交给页面 action。

```ts
// modules/hotel-list/actions.ts
retry() {
  pageActions.retryHotels();
},
```

这是本仓库的通用约定，所有只做转交的模块 action 都不再各自注释一遍。转交的意义在于 UI 只认识自己模块的 action 入口，页面级编排换实现时不必改 UI。

## 三、live 表：把活对象交给 action

表单实例、DOM ref 这类「活对象」不能进状态层——它们不可序列化、身份可变，放进 store 会破坏状态的可比较性。但 action 有时确实需要它们：提交失败要 `setError` 回填表单，换筛选条件后要滚动到列表顶部。

`lib/live.ts` 提供 `createPageLive<M>()`，按页面自己的 key→类型映射生成一对读写入口：

```ts
// pages/hotel/live.ts
interface PageLiveMap {
  hotelListRef: RefObject<HTMLElement | null>;
  bookingForm: UseFormReturn<BookingForm>;
}
export const { useRegisterLive, getLive } = createPageLive<PageLiveMap>();
```

持有方在自己的组件里 `useRegisterLive("hotelListRef", ref)`，消费方在 action 里 `getLive("hotelListRef")`。两端受同一张表约束，key 拼错或值类型不对都在编译期报错。

每个页面的 `live.ts` 就是这张跨模块契约表，谁注册、谁消费写在表上的字段注释里。

注意 `createPageLive` 每次调用持有独立的 `Map`，页面之间互不影响；但这个 Map 是模块级的，仅适用于 CSR SPA。SSR 下要改成每请求实例化并经 Context 提供，否则会跨请求串用。

## 四、listener：结果的旁路反应

有一类联动的触发方与受影响方完全不同：homestay 的「询价提交成功 → 退出当前房源」，牵涉 listing-list 的选中态与 listing-detail 的详情内容，触发它的却是 inquiry-submit。listener 里只需 `exitListing` 一句——这组状态在状态层已经是一个整体（见[取数与编排](data-fetching.md)的作废结果集一节），旁路反应不必自己知道它由哪几个字段组成。

写进提交 action 会让提交方知道另外两个模块的存在。落在 listener 里，三方都只认这条 action，互不相识。

代价是因果变隐式：读提交 action 看不到选中会被清掉。所以 listener 里只放「结果的旁路反应」，提交自身必须完成的状态变更仍留在 action 内。

监听 `setSubmittedInquiry` 时要注意它也被用于撤回与重置，只有带上询价才是「提交成功」。

## 表单实例的共享

同一个表单被两个模块使用（inquiry-fields 填写、inquiry-submit 提交）时，用 react-hook-form 的 `FormProvider` 在页面层提供，两个模块各自 `useFormContext` 取。这样两个模块都不必认识对方，也不必把表单实例塞进 live 表。

hotel 的 booking-form 是一个模块，`FormProvider` 因此落在模块自己的壳里，共享方是它的字段区子组件。判据仍是 Provider 该架在共享方的共同祖先上，与模块边界无关。省掉它就得把 `control` 与 `errors` 当 props 逐个中转下去，壳又变回它想摆脱的那个大组件（见[分支渲染](branching.md)的子组件自取 model）。

live 表在这里的角色是另一件事：让 action（而非组件）能拿到实例做回写。

## 一个模块服务多个触发方

homestay 的两个二次确认场景（取消收藏、撤回询价）提交动作不同，但弹窗结构完全一致、只有文案有别。做法是共用一个 confirm-dialog 模块，由 `confirmRequest` 决定文案与提交分支。

复制两份弹窗的代价是「确认中」的 loading 与关闭时机各写一遍，改一处漏一处。

同一个模块被复用于两种呈现位置时同理：homestay 的详情在列表下方与抽屉里各渲染一次，用一个 `inDrawer` 位置参数分流，而不是复制两份组件——字段一变两份都要改，迟早漂移。内联区只给展开入口，写操作只在抽屉里给。

## 配置表驱动渲染

上一节那种「一个模块服务多个场景」的差异，收在一张表里由 UI 统一渲染，而不是在组件里按场景堆 if/switch——后者每加一个场景都要改渲染逻辑。homestay 的 `SCENE_COPY` 就是这张表，两个确认场景的标题、按钮文案、有无补充说明全在里面，`ConfirmDialog` 只做一次 `SCENE_COPY[scene]` 查表。

可选字段兼作渲染开关：`desc` 缺省的场景不渲染说明段，不必再配一个布尔。

表只承载展示差异，行为差异仍在 action 里（`runByScene` 按场景分派提交动作）。把提交也塞进表意味着表里存函数，而那些函数要读 store、要 await，摆在一张文案表旁边只会让两种东西互相埋没。

表放模块内（`confirm-dialog/scenes.ts`），因为只有这个模块查它；`ConfirmScene` 与 `ConfirmRequest` 放 `shared/confirm.ts`，因为页面层 action 也要用它们开弹窗。

### 操作对象随场景一起进来，不借道别的状态

`confirmRequest` 是判别联合而不是光秃秃一个 scene：取消收藏那一支带着 `listingId`，撤回询价那一支不带（撤哪条由 `submittedInquiry` 定）。

这里曾经走过一条捷径：开弹窗前先把「详情区在看谁」对齐到目标房源，弹窗再从那儿读。代价是那个字段从此有两个含义，改一个必然动另一个——列表卡片上一次取消收藏的点击就会把详情区切走，而详情内容并不跟着重取，于是详情区显示 A 的描述配 B 的标题。判别联合把目标关进它所属的那一支，「取消收藏必须有目标房源」也从运行时的防御分支变成编译期约束。

判据可以推广：**一个字段只该有一个含义。** 两个概念挤在一个字段上时，它们各自的变更路径会互相溢出，而类型系统一句话都不会说。

## 埋点参数从 store 派生

埋点的通用参数（当前页、生效的筛选条件、选中项）由一个 selector 从 store 派生，各调用点只给事件名与本次操作特有的参数。各处手拼的下场是漏字段与口径不一：有的带筛选条件有的不带，同一个字段在两处叫不同的名字，最后没法在报表里对齐。

`trackClick` 必须在状态变更之前调用。通用参数表达「点击发生时页面处于什么上下文」，本次操作的目标由 extra 带。先改状态再上报，选中类事件就会把新选中当成旧上下文。

**同一个动作在多处触发时，埋点跟着业务规则一起放在页面层。** homestay 的收藏切换在列表卡片与详情抽屉各有入口，`listing_favorite_toggle` 报在 `pageActions.toggleFavorite` 里，两个入口的事件名与参数因此必然一致。分别报的下场是漏一处：列表报了、抽屉没报，报表上看不出这两处其实是同一个动作，也就无从比较哪个入口更常用。

覆盖面本身也要过一遍。转化路径上的动作（提交、撤回）比浏览类动作更值得报，而它们恰恰最容易漏——浏览类动作写在最显眼的卡片组件里，提交藏在表单的回调深处。

## 循环依赖约束

RTK 页的 `slice.ts` 被 `store.ts` 组装、被 `listeners.ts` 取 action creator，因此 slice 不能 import store 的运行时内容，需要类型时一律 type-only import。模块的 slice 同理。

模块 slice 取页面 slice 的 action creator 不在此列：`confirm-dialog/slice.ts` 为了在 `extraReducers` 里监听弹窗开关，要 import 页面 slice 的 `setConfirmRequest`。这个方向是单向的——页面 slice 不认识任何模块，两者都不认识 store，成不了环。禁止的是指向 store 的那条边，不是指向页面 slice 的。

listener middleware 用 `prepend` 而不是 `concat` 装配：让监听器在其它中间件处理该 action 之前就登记上。
