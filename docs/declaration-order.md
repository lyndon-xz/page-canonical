# 声明顺序

一个声明放在紧邻它第一个消费者之前。文件顶部只留全文件都要的东西。

这条与[抽取](extraction.md)分工：那篇管「该不该有这个名字」，这篇管「有了放哪」。

## import 分区

按来源分区，区间空行分隔：内建 → 第三方 → `@/` 别名 → `../` → `./` → 样式表。整体是由外而内，`vite.config.ts` 的 `path` 单独占第一区就是这个缘故。组内按 import 路径的字典序，效果同样是由远及近——`"../../../../shared/hotel"` 自然排在 `"../../actions"` 前面，`../` 整区排在 `./` 整区前面。

按字典序而不是「按重要性」或「先值后类型」，是因为字典序不需要判断。`homestay/data/services.ts` 一度把 `"./listings"` 排在 `"../shared/listing"` 之前，`sort-bar` 把 `"../../../../shared/params"` 排在 `"../../actions"` 之后，两处都不是有意为之，只是加 import 时顺手接在末尾。

样式表单独一区且排最后：它不参与逻辑，`styles.xxx` 要对照的是文件末尾的 JSX。

同一个模块只出现一次。概念文件里值与类型同处，从它取东西时两者常一起要，`verbatimModuleSyntax` 下用行内 `type` 修饰就能合成一行，不必值一行类型一行：

```ts
import { SORT_BY_VALUES, type SortBy } from "../../../../shared/params";
```

分两行不会报错，但下一个人改其中一行时容易漏掉另一行。

## 声明贴着它的第一个消费者

homestay 的 `data/services.ts` 一度在文件头堆了六组常量：延迟、收藏失败的房源、被拒的手机号、旺季加价、长住折扣、询价 id 前缀。文件读到 `buildQuote` 时，它用的四个常量都在两屏之外。

改成一簇一簇：常量与用它的函数相邻。

```ts
/** 旺季单价上浮，报价因此与列表起价不同 */
const PEAK_MONTHS = [7, 8];
const PEAK_SURCHARGE_RATE = 1.2;

/** 住满这么多晚打折，总价因此不是单价乘晚数 */
const LONG_STAY_NIGHTS = 7;
const LONG_STAY_DISCOUNT = 0.9;

function buildQuote(listing: Listing, payload: InquiryPayload): InquiryQuote {
```

这几个常量该不该有名字是另一个问题，答案是该有：`[7, 8]` 与 `1.2` 内联进判断后，读者看不出前者是月份、后者是旺季加价（判据见[抽取](extraction.md)）。位置错了不等于名字多余，两件事分开判断。

「全文件共享的放文件顶部」不是另一条规则，而是这条的推论：`MOCK_DELAY_MS` 每个服务函数都要，第一个消费者就是第一个函数。

共享也不等于置顶。`INQUIRY_ID_PREFIX` 被 `submitInquiry` 与 `cancelInquiry` 共用，落点是这两个里靠前的那个，而不是文件头——它与前面几个函数无关，摆在头上只会挤占「全文件共享」这块位置的含义。

[抽取](extraction.md)里「数据集合留在顶层」的「顶层」指模块作用域，是相对于「内联进 JSX 或调用处」说的，不是文件顶部。所以 `SORT_LABELS` 紧贴 `SortBar`、`comparators` 紧贴 `resolveMatchedHotels`、`STAR_OPTIONS` 紧贴 `SearchFilter`，都是同一个形状。

### 错误类跟着抛它的函数

`InquirySubmitError` 与 `BookingSubmitError` 都 export 给模块 action 做 `instanceof`，但文件内唯一的消费者仍是那个提交函数，所以紧挨着它。跨文件的消费者不参与文件内的落点判断——否则每个 export 都有理由往文件头挤，头部就成了没有次序的公告板。

## 被依赖的在前，簇内按调用流

`buildQuote` 在 `submitInquiry` 之前，`resolveMatchedHotels` 在 `fetchHotelPage` 之前，`loadListingDetail` 在 `selectListing` 之前，`isCurrentGeneration` 在 `loadHotels` 之前。

这条全靠手动维持。函数体里的引用到调用时才求值，把常量或 helper 放到消费者之后照样能跑，编译器不会点名。

`actions.ts` 是这条规则的特化场景，私有件与组序另见 [Action 排布](action-layout.md)。它多一条约束：私有件插不进导出的对象字面量，所以整块排在导出之前，簇内顺序改由「对应的导出 action 谁在前」以及该 action 内部的调用次序决定。hotel 的 `waitForHydration` → `loadHotels` 就是 `initPage` 里那两句的顺序。

## 组序由文件的角色决定，不跨文件强行对齐

同一批业务领域会在多个文件里各出现一次，组序按各文件自己的依据排：

- `actions.ts` 按用户在页面上的推进顺序，被依赖的 action 前移
- 状态层（`slice.ts` / `store.ts`）按状态的生命周期分组，跨结果集的用户数据与瞬时态各成一块
- `data/services.ts` 按用户触达这些接口的先后

于是 homestay 的 `actions.ts` 是「确认弹窗 → 收藏」（`toggleFavorite` 要调 `openConfirm`，依赖把它前移），`slice.ts` 是「收藏 → 确认弹窗」（`favoriteIds` 是跨结果集的用户数据，`confirmRequest` 是瞬时态）。hotel 的「多选」与「收藏」在两层也是反的。

这类不一致不是漂移。硬拉平总会让一边的依据失效：把 slice 改成 actions 的序，`favoriteIds` 就被夹进两块瞬时态之间；把 actions 改成 slice 的序，`openConfirm` 就排到调用它的人后面。判断依据留在各自文件内，读者在哪个文件里都能自证。

## 同一份清单在多处出现时同序

`slice.ts` 里状态形状、`initialState`、`reducers`、末尾导出的解构四处同序；`store.ts` 里 `PageStore` 接口与实现体同序。

这四处本来就是同一张清单的四个投影，差一个位置就只能靠搜索比对，加字段时也无从判断该插哪。同序之后，四处并排看是同一个纵向次序，漏了哪一处一眼就能发现。
