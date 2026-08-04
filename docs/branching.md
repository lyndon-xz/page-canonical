# 分支渲染

状态分支用早返回，一个组件只承载一条状态链。

## 多分支不用三元链

`a ? x : b ? y : z` 在语法上就是右结合的嵌套，prettier 把它排成对齐的阶梯只是看着扁平。分支超过两个、每个分支又是一整块 JSX 时，读者得沿着 `) : ` 数缩进才能确认自己在第几层，而正常路径被推到最深处。

四个 body 组件（`DetailBody`、`ListBody`、`ResultsBody`、`RulesBody`）与 `LoadMoreFooter` 统一是早返回：

```tsx
if (detailStatus === FetchStatus.Loading) {
  return ...;
}

if (detailStatus === FetchStatus.Error) {
  return ...;
}

// 详情接口可能返回 null，此时列表项虽在也无内容可展示
if (!listing || !detail) {
  return ...;
}

return ...;
```

每个分支平铺在函数顶层，读到哪一行就知道命中哪个状态，正常路径永远在最后一句。判别态（见[状态建模](state-modeling.md)的取数状态一节）天然是这个形状：`Loading` / `Error` / 内容为空 / 有内容，四段互斥且有先后。

## 早返回要求分支落在函数顶层，所以状态区要下沉

状态分支通常夹在标题栏和其他块中间，在父组件里直接 return 会把 header 一起吞掉。所以把这块下沉成子组件，父组件退化成布局壳。

`HotelList` 现在是 header、批量收藏失败提示、批量操作条、`<ListBody />` 四块平铺，一层三元不剩。四个模块统一按「模块名后半 + Body」命名：`listing-detail` → `DetailBody`、`hotel-list` → `ListBody`、`flight-results` → `ResultsBody`、`fare-rules` → `RulesBody`。

不参与状态分支的部分留在壳里。`fare-rules` 的分类 tabs 在任何状态下都显示，所以它跟 header 一起留在 `FareRulesInner`，只有 loading、error、规则组这三段进 `RulesBody`。

## 一个组件只承载一条状态链

`hotel-list` 有两条互不相干的取数状态：首屏的 `hotelsStatus` 与翻页的 `loadMoreStatus`（分开的理由见[取数与编排](data-fetching.md)的分页与无限滚动一节）。它们分给 `ListBody` 与 `LoadMoreFooter`，各自一条链。塞进同一个组件的结果是「首屏 ready 分支里再嵌一条四分支链」，两个状态机在同一个表达式里叠成两层。

## 子组件自取 model，只有必须同源的值从父传

`ListBody`、`ResultsBody`、`RulesBody` 都自己调模块的 model hook，和 `SortBar` 一样。父组件不做数据中转，否则 body 用到的每个字段都要在壳上过一遍 props，壳也就重新变成了它想摆脱的那个大组件——`FlightResultsInner` 抽完之后连 `useContainer()` 都不再调用。

例外是必须与别处保持同一份的值。`showSentinel` 由 `HotelList` 算好，同时交给 `LoadMoreFooter` 和 `useHotelListEffects`：哨兵的渲染条件与观察器的挂载条件必须是同一个表达式，各算一遍就会出现哨兵在 DOM 里但没人观察它（见取数与编排的同一节）。`sentinelRef` 同理，ref 由持有 effect 的那一方声明。

`sentinelRef` 走具名 prop 而不是 React 19 的 `ref`：`LoadMoreFooter` 只在哨兵这一个分支把它挂到根元素上，用 `ref` 会让人以为任何分支下都能从这个组件拿到节点。

## 样式跟着节点走

class 定义随它修饰的节点进子组件自己的 `index.module.scss`。`stateBox` 与 `errorText` 因此在几个 body 里各有一份，重复几行声明是模块化的代价，比让子组件反向引用父模块的样式表好。搬的时候按原值搬：`fare-rules` 的 `stateBox` 是 `padding: 48px 0`，`flight-results` 是 `56px`，不顺手统一。

## 二元分支仍然用三元

这条规则只针对多分支链。`DetailBody` 末尾按 `inDrawer` 二选一、`value={field.value ? dayjs(field.value) : null}` 这类值三元都保持原样：单层三元没有嵌套，改成早返回要么多抽一个组件，要么在正常路径中间插一句 return。只有一个分支时用 `&&`，`{hotels.length > 0 && <Checkbox ... />}` 就是它该有的样子。
