# 解构

## 不在参数位解构

参数位只声明「收什么」，取哪几个字段是函数体的事：

```tsx
export default function HotelCard(props: HotelCardProps) {
  const { hotel, selected, favorite, checked } = props;
```

所有带 props 的组件（`HotelCard`、`ListingCard`、`DetailBody`、`ListBody`、`LoadMoreFooter`）、所有 `createSelector` 的结果函数与 hotel persist 的 `partialize` 都是这个形状。

在签名里铺开字段有三处代价。一是加字段要改签名，字段一多 prettier 会把参数列表折成多行，类型标注跟着挤进去，签名不再是一眼能读完的一行。二是解构行没地方配注释——`inquiry-submit` 那处的 `message` 重命名必须说明原因，写在参数位里无处安放。三是丢掉 `props` / `fieldError` 这个整体名字，需要整体转发或调试打印时得重新拼回去。

## 前缀读到第二次就解构

字段数不是判据，同一前缀在同一作用域被读两次就解构，同一个字段读两次也算。`serializeParams` 里 `keyword` 判空与写入各读一次，所以 `searchParams` 整体拆开；而 `batchFavorite` 末尾的 `failures.map((failure) => failure.hotelId)` 只读一次，点号就是终点，改块体去换掉一个前缀是净亏——同一个 `BatchFavoriteFailure`，在 model 里要同时读 `hotelId` 与 `reason` 时就该解构。

调用结果是另一回事，它必须落成变量才能用，落就落成解构，取一个字段也一样：

```ts
const { sortBy } = useHotelListModel();
const { Component } = resolveRoute(active);
const { title, desc, okText } = SCENE_COPY[scene];
```

点号前缀在每个使用点都要重读一遍，字段一多就成片噪音。`HotelCard` 解构七个字段后 JSX 里是 `{name}`、`{pricePerNight}`；组件名已经说清这是谁的字段，前缀不再提供信息。

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

多写的两行换掉五处 `option.`，`routes.map` 的 `route` 与 `batchFavoriteFailures.map` 的 `failure` 都是这个形状。

解构位置在函数体最前面，紧跟 `props` 与 hook 返回值那几行，空一行再进逻辑；有守卫的写在守卫之后，`DetailBody` 的 `listing` 与 `detail` 都在 `if (!listing || !detail) return` 之后才拆。整体还要往下传的对象保留变量本身，`ListBody` 的 `hotels.map` 读了 `hotel.id` 做 key 与选中比对，`hotel` 仍整体传给 `HotelCard`。

撞名按下一节重命名，不构成不解构的理由。`hotel.star` 与筛选条件的 `star` 撞，改成 `star: hotelStar`；加工后的局部变量优先改名，`filters.keyword` 解构出 `keyword` 后，归一化结果叫 `normalizedKeyword`。

## actions 解构在模块顶层

上一节末尾的位置规则管的是 `props` 与 hook 返回值，它们每次渲染都要重新取。对象形态的 actions 不是：`hotelListActions` 是模块级常量，方法引用从模块求值那一刻就固定了。解构因此放在 import 之后、组件之前：

```tsx
import { hotelListActions } from "../../actions";
import type { Hotel } from "../../../../shared/types";

import styles from "./index.module.scss";

const { selectHotel, toggleSelect, toggleFavorite } = hotelListActions;

export default function HotelCard(props: HotelCardProps) {
```

放进组件体里，它会和 `useHotelListModel()` 那行并列，暗示它也随渲染变化；搬到顶层后组件体只剩渲染真正依赖的东西。`hotel-card`、`list-body`、`sort-bar`、`listing-card`、`confirm-dialog` 都是这个形状，取一个方法（`load-more-footer` 的 `loadMore`）也一样。

## 跨层的 pageActions 不解构

UI 消费的一定是本模块的 actions，来源唯一，`onClick={loadMore}` 不会有「这是哪一层的动作」的疑问。模块的 `actions.ts` 里不然，本模块的 slice action 与页面层的 `pageActions` 挨着出现，前缀是唯一的层级标记：

```ts
cancel() {
  store.dispatch(setConfirmError(null));
  pageActions.closeConfirm();
},
```

所以 `pageActions` 一律带前缀读，即便同一个函数里读到第二次也照旧——`listing-detail` 的 `openDetailDrawer` 连着调 `trackClick` 与 `openDetailDrawer`，`listing-list` 的 `toggleFavorite` 里 `pageActions` 出现三次。这是「前缀读到第二次就解构」的例外：前缀在这里是信息，不是噪声。

页面层 `actions.ts` 内部的 `pageActions.loadListings` 是另一回事。对象字面量的方法引用不到自身，那处前缀是语法要求，不表示跨层。

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

**只在条件分支里用到的可空对象**。`booking-form` 的 `selectedHotel` 是 `Hotel | null`，`name` 与 `pricePerNight` 只在 `{selectedHotel ? ... : ...}` 内取。`&&` 与三元表达式里没有放 `const` 的位置，函数体顶层又收窄不了类型（会报 `TS2339`）。要解构得先抽子组件或加 early return，那是另一件事，按它自身值不值得单独判断，不要用 `?? {}` 绕过类型。

## 撞名时重命名，不是放弃解构

`inquiry-submit` 的文件顶部有 `import { message } from "antd"`，同一个 catch 块还在用 `message.error`。字段错误里的 `message` 直接解构会遮蔽它：

```ts
const { field, message: reason } = fieldError;
```

不重命名的话代码今天仍能跑——回调里没用到 antd 的 `message`。但下一个人在这里加一句 `message.error(...)`，拿到的是字符串，`.error` 为 `undefined`，要到运行时才炸。

`reason` 沿用仓库既有词汇：hotel 的 `BatchFavoriteFailure` 用它表示失败原因文案。
