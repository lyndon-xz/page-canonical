# 解构

## 不在参数位解构

参数位只声明「收什么」，取哪几个字段是函数体的事：

```tsx
export default function FlightCard(props: FlightCardProps) {
  const { flight, selected } = props;
```

所有带 props 的组件（`FlightCard`、`ListingCard`、`HotelCard`、`RuleItem`、`DetailBody`、`ListBody`、`LoadMoreFooter`）、所有 `createSelector` 的结果函数与 hotel persist 的 `partialize` 都是这个形状。

在签名里铺开字段有三处代价。一是加字段要改签名，字段一多 prettier 会把参数列表折成多行，类型标注跟着挤进去，签名不再是一眼能读完的一行。二是解构行没地方配注释——`inquiry-submit` 那处的 `message` 重命名必须说明原因，写在参数位里无处安放。三是丢掉 `props` / `fieldError` 这个整体名字，需要整体转发或调试打印时得重新拼回去。

## 前缀读到第二次就解构

字段数不是判据，同一前缀在同一作用域被读两次就解构，同一个字段读两次也算。`serializeFilters` 里 `filters.cabin` 出现两次，拆成 `const { cabin } = filters`；而 `fetchFlights` 的 filter 回调里 `flight.cabin` 只出现一次，点号就是终点，改块体去换掉一个前缀是净亏。

调用结果是另一回事，它必须落成变量才能用，落就落成解构，取一个字段也一样：

```ts
const { sortBy } = useHotelListModel();
const { Component } = resolveRoute(active);
const { title, desc, okText } = SCENE_COPY[scene];
```

点号前缀在每个使用点都要重读一遍，字段一多就成片噪音。`HotelCard` 解构七个字段后 JSX 里是 `{name}`、`{pricePerNight}`，`FlightCard` 是九个；组件名已经说清这是谁的字段，前缀不再提供信息。

`map` / `filter` 回调也解构，表达式体为此改成块体：

```tsx
{
  STAR_OPTIONS.map((option) => {
    const { value, label } = option;

    return (
      <button
        key={value}
        data-active={star === value}
        onClick={() => updateStar(value)}
      >
        {label}
      </button>
    );
  });
}
```

多写的两行换掉五处 `option.`，`routes.map` 的 `route`、`groups.map` 的 `group`、`batchFavoriteFailures.map` 的 `failure` 都是这个形状。

解构位置在函数体最前面，紧跟 `props` 与 hook 返回值那几行，空一行再进逻辑；有守卫的写在守卫之后，`DetailBody` 的 `listing` 与 `detail` 都在 `if (!listing || !detail) return` 之后才拆。整体还要往下传的对象保留变量本身，`fare-rules/model.ts` 解构了 `rule` 的 `ruleType` 与 `qualified`，`rule` 仍整体传给 `formatRuleText`。

撞名按下一节重命名，不构成不解构的理由。`hotel.star` 与筛选条件的 `star` 撞，改成 `star: hotelStar`；加工后的局部变量优先改名，`filters.keyword` 解构出 `keyword` 后，归一化结果叫 `normalizedKeyword`。

## 三类前缀不拆

**以字段名为键的表**。`errors.guestName`、`styles.card`、`FetchStatus.Loading`，键本身就是那个域里的名字，裸出来会和同名的值混淆——`guestName` 该是入住人的值还是它的错误，拆开就说不清了。

**投影选择器**。`useShallow` 的函数体只有一个对象字面量：

```ts
useShallow((s) => ({
  resultCount: s.hotelsTotal,
  isLoading: s.hotelsStatus === FetchStatus.Loading,
}));
```

参数叫 `s` 而不是 `state`，因为它只出现在这张映射表里。解构要把表达式体改成块体再补一行 `return`，换来的只是省掉两个 `s.`；字段还要改名或加工成布尔，连对象简写都用不上。`hotel-list` 取十个字段时更明显：解构后同一批名字要写三遍（解构、字面量、调用处）。`selectTraceCommonTag` 不属此列，它本就是块体且字段原名转发，拍平后能写成 `keyword,`。

**只在条件分支里用到的可空对象**。`booking-form` 的 `selectedFlight`、`rule-item` 的 `tip` 都是 `T | null`，字段只在 `{x ? ... : ...}` 或 `{x && ...}` 内取。`&&` 与三元表达式里没有放 `const` 的位置，函数体顶层又收窄不了类型（会报 `TS2339`）。要解构得先抽子组件或加 early return，那是另一件事，按它自身值不值得单独判断，不要用 `?? {}` 绕过类型。

## 撞名时重命名，不是放弃解构

`inquiry-submit` 与 `booking-form` 的文件顶部有 `import { message } from "antd"`，同一个 catch 块还在用 `message.error`。字段错误里的 `message` 直接解构会遮蔽它：

```ts
const { field, message: reason } = fieldError;
```

不重命名的话代码今天仍能跑——回调里没用到 antd 的 `message`。但下一个人在这里加一句 `message.error(...)`，拿到的是字符串，`.error` 为 `undefined`，要到运行时才炸。

`reason` 沿用仓库既有词汇：hotel 的 `BatchFavoriteFailure` 用它表示失败原因文案。
