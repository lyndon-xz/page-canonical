# 解构

## 不在参数位解构

参数位只声明「收什么」，取哪几个字段是函数体的事：

```tsx
export default function FlightCard(props: FlightCardProps) {
  const { flight, selected } = props;
```

五个带 props 的组件（`FlightCard`、`ListingCard`、`HotelCard`、`RuleItem`、`DetailBody`）与所有 `createSelector` 的结果函数都是这个形状。

在签名里铺开字段有三处代价。一是加字段要改签名，字段一多 prettier 会把参数列表折成多行，类型标注跟着挤进去，签名不再是一眼能读完的一行。二是解构行没地方配注释——`inquiry-submit` 那处的 `message` 重命名必须说明原因，写在参数位里无处安放。三是丢掉 `props` / `fieldError` 这个整体名字，需要整体转发或调试打印时得重新拼回去。

## 同一来源取两个以上字段才解构

前缀链重复才值得换成解构，只取一个字段时点号更短：

```ts
(page, listings) => {
  const { listingsStatus, selectedListingId, favoriteIds } = page;

  return {
    listings,
    listingsCount: listings.length,
    listingsStatus,
    selectedListingId,
    favoriteIds,
  };
};
```

`page` 取三个字段所以解构，`listings` 是独立入参、整体就是要用的值，不解构。嵌套一层的也归这条：`selectTraceCommonTag` 里 `page.appliedFilters.keyword` 与 `page.appliedFilters.roomType` 写两遍，所以拍平成 `const { keyword, roomType } = appliedFilters`。

## 撞名时重命名，不是放弃解构

`inquiry-submit` 与 `booking-form` 的文件顶部有 `import { message } from "antd"`，同一个 catch 块还在用 `message.error`。字段错误里的 `message` 直接解构会遮蔽它：

```ts
const { field, message: reason } = fieldError;
```

不重命名的话代码今天仍能跑——回调里没用到 antd 的 `message`。但下一个人在这里加一句 `message.error(...)`，拿到的是字符串，`.error` 为 `undefined`，要到运行时才炸。

`reason` 沿用仓库既有词汇：hotel 的 `BatchFavoriteFailure` 用它表示失败原因文案。
