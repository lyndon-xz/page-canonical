# 抽取

一个名字要么被复用，要么解释了值本身。两者都不成立就别抽。

## 只用一次的字面值写在使用处

```ts
{
  name: "hotel-page",
  partialize: (state) => { ... },
}
```

hotel 的 persist 键就写在配置里。若先起一个 `PERSIST_KEY` 再引用，读者要跳一次才看到值是什么，而这个值和它唯一的用途从此隔在文件两头。同类的还有 `scrollIntoView({ behavior: "auto", block: "start" })` 的选项对象与 `useRegisterLive("hotelListRef", listRef)` 里的 key 字面量。

抽出去有时还会引入额外摩擦：

```ts
const isSortBy = (value: string): value is SortBy =>
  ["price", "rating", "distance"].includes(value);
```

这三个值若抽成 `const SORT_VALUES: SortBy[]`，调用处得写成 `(SORT_VALUES as string[]).includes(value)`——`SortBy[]` 上调 `.includes(value: string)` 类型不兼容。数组字面量直接推断成 `string[]`，断言就不需要。

常量上的类型标注也常被当成不能内联的理由，实际上使用处的上下文通常已经把类型钉住了。默认筛选条件内联进 `initialState: HomestayPageState` 后由后者提供类型，草稿态的初值内联进 `create<SearchFilterLocalState>(...)` 由泛型参数提供，两处都没丢检查。

## 名字承担解释职责时才抽

```ts
/** 该房源的收藏接口固定失败，用于演示收藏失败的反馈路径 */
const FAVORITE_REJECTED_LISTING_IDS = ["l3"];
```

`["l3"]` 内联到判断里，读者看不出这个 id 为什么在那。同类的 `BLOCKED_PHONES = ["13800000000"]` 也只用一处，但名字是这个值唯一的解释来源，所以留着。哑值和魔法数是这条的典型。

自检方式：删掉名字直接内联，读者还看得懂这个值为什么在这吗？看得懂就内联。

## 数据集合留在顶层

`STAR_OPTIONS` 只被 `.map` 一次，仍留在模块顶层。内联进 JSX 会把静态数据混进渲染结构，而且每次 render 重建一个新数组。

映射表同理。`comparators` 只在一处 `sort` 里取值、`SORT_LABELS` 只在一处查表，仍是独立常量——它们的体量与结构本身就要求一个位置。mock 数据与 `SCENE_COPY` 这类配置表（见[跨模块协作](cross-module.md)的配置表驱动渲染）归这一类。

RTK 的 `initialState` 是另一种情况：`createSlice({ initialState })` 只引用它一次，但分开写是 RTK 的惯例，且这行类型标注是整个 slice 状态形状的锚点。

## 篇幅不是判据，位置才是

`DEFAULT_INQUIRY` 有五个字段，内联进去是五行：

```ts
const methods = useForm<InquiryForm>({
  defaultValues: {
    guestName: "",
    phone: "",
    checkInDate: "",
    nights: 1,
    message: "",
  },
  mode: "onTouched",
});
```

仍然该内联。`defaultValues` 这个 key 已经说清了它是什么，`useForm` 就是它唯一的归属，多一个名字只是多一次跳转。hotel booking-form 的 `defaultValues` 同理。

真正该留在顶层的只有前两类：名字本身就是解释，或者值插不进任何调用处。

复用则另当别论。hotel 的 `DEFAULT_PARAMS` 与 `DEFAULT_CONTACT` 留着，因为 store 初值与 persist 的 `merge` 各用一次——`merge` 要拿默认值补齐老数据缺的字段（见[状态建模](state-modeling.md)的持久化一节），两处必须是同一份值。

## 只在本文件用就不 export

`HOTEL_PAGE_SIZE` 只被 `services.ts` 自己的两处切片用到，所以不 export；两页各自的 `MOCK_DELAY_MS` 同理。多余的暴露面会让人以为别处依赖它，重构时不敢动。

反过来，`export` 出去但当前只有一个消费方的不算多余——`MOCK_HOTELS`、`MOCK_LISTINGS`、`MOCK_LISTING_DETAILS` 都只被同目录的服务函数 import，数据与服务分层本就是这个形状，暴露面与调用次数是两回事。
