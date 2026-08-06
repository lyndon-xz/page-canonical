# Action 排布

`actions.ts` 是页面里唯一一处「所有可能发生的事」的清单，页面层与模块层共用同一套排布规则。它只影响可读性，但顺序一乱，读者就只能靠搜索定位，也没人知道新增的 action 该放哪——默认往文件末尾加。

本文是[声明顺序](declaration-order.md)在这个文件上的特化。

## 私有内容在前，导出的集合在后

请求序号、`waitForHydration`、`resolveInitialParams`、confirm-dialog 的 `runByScene` 这类只服务本文件的内容排在导出之前。它们是实现细节，插在 action 之间会打断清单。

## 按业务领域分组，组序跟随用户在页面上的推进顺序

homestay 是埋点 → 列表 → 详情 → 确认弹窗 → 收藏 → 询价，hotel 是列表 → 选中 → 多选 → 收藏 → 预订。大致就是用户从进入页面到完成操作的路径。

**一个领域的 action 必须聚在一起。** 被别的组劈成两半之后（hotel 的单项收藏与批量收藏一度隔着多选组），改收藏行为的人很容易只看到一半。

跨领域的工具型 action 置顶。homestay 的 `trackClick` 不属于任何组，谁都可能用（见[跨模块协作](cross-module.md)里的埋点参数派生）。

### 分组要在代码里可见

组边界用 `// ── 组名 ──` 标出来，不能只写在这份文档里。分组只存在于文档时，读者看到的是一串平铺的 action，得自己按名字猜边界；新增的人也无从判断该插在哪，只能加到末尾——组序规则于是失效。

标记的作用是给扫不完的清单划边界，所以只在**分两组以上且 action 达到六个左右**时加。低于这个量级一眼就能看全，标记只是噪声：`listing-list` 三个 action 恰好分三组，标完注释比代码还多。当前需要标的是两个页面层与 `hotel-list`。

标记只落在导出的集合内部。私有件（`waitForHydration`、`resolveInitialParams`、`loadHotels`、`loadListingDetail`）在 `pageActions` 之外，物理上已在组外，不标。

## 组内：底层读写在前，包装它的在后

`loadListings` 在 `retryListings` 之前，`commitFavorite` 在 `addFavorite` 与 `toggleFavorite` 之前。真正碰数据的那个排前面，包装它、给它加一层交互语义的紧随其后。

成对的 `open`/`close`、`select`/`clear` 相邻。重试与清错（`retryXxx`、`dismissXxx`）排在所属组末尾——它们是失败路径的收尾，不是主线。

组内也照「用户推进顺序」排。hotel 的列表组是 `initPage` → `applySearchParams` → `loadMoreHotels` → `retryHotels`：进页面、换条件、翻页、失败重试。`initPage` 领头还有一层原因——[声明顺序](declaration-order.md)规定私有件的簇内次序跟着「对应的导出 action 谁在前」，而 `waitForHydration` → `resolveInitialParams` → `loadHotels` 正是 `initPage` 那三句的顺序。`initPage` 若不在组首，文件上下两半的依据就对不上了。

## 被依赖的排在依赖它的之前

`openConfirm` 排在收藏组之前，因为 `toggleFavorite` 要调它；`loadHotels` 排在 `initPage` 之前，`loadListingDetail` 排在 `selectListing` 与 `retryDetail` 之前。

两页的 action 都是对象字面量方法，互调靠 `pageActions.xxx` 延迟解析，顺序写反了也不会报错，所以这条全靠手动维持。

## 模块层同一套规则

模块 action 的组序按该模块 UI 上的主次排：卡片的主操作在前，卡片上的次级按钮其次，失败态的重试收尾。`hotel-list` 的分组因此与 hotel 页面层逐组对应，`listing-list` 则是「选中卡片 → 收藏按钮 → 重试」。

只做转交的模块 action 不改变分组归属：它属于它转交的那个页面领域，不因为「都是一行」就凑到一起。
