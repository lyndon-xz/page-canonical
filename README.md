# page-canonical

页面分层架构的范式级 SPA 示范。同一套分层（store / model / actions / effects / UI）在三个页面上分别用 zustand、Redux Toolkit、unstated-next 落地，用来说明这套分层不依赖任何具体状态库。

| 页面            | 状态库            | 页面层状态形式                 | 额外示范                         |
| --------------- | ----------------- | ------------------------------ | -------------------------------- |
| `hotel` 酒店    | zustand + persist | `create()` 模块单例            | 分页与无限滚动、持久化、批量操作 |
| `homestay` 民宿 | Redux Toolkit     | slice + listener middleware    | 跨模块联动、二次确认弹窗复用     |
| `flight` 机票   | unstated-next     | `useState` + Context Container | 能力闸门、配置表驱动渲染         |

```bash
pnpm install
pnpm dev
```

## 分层

一个页面由五层构成，依赖方向单向向下，不允许回指。

**store** 页面级状态的唯一容器。只存状态与最直接的 setter，不含业务判断。

**model** 状态的读。把 store 里的状态派生成模块要的视图数据，模块的私有状态也在这里。UI 只从 model 取数据，不直接读 store。

**actions** 状态的写，以及一次交互涉及多步时的编排。取数、写入、埋点、URL 同步都在这里。

**effects** 与 React 生命周期绑定的副作用。首屏取数、DOM 观察这类"挂载时该发生什么"。

页面级 effects 统一挂在一个返回 `null` 的 `EffectsRunner` 组件里，而不是直接在页面组件里调用。页面组件是整棵子树的根，effects 一旦订阅状态，在根上订阅就等于每次变更重渲染所有模块；隔离到空组件里代价为零。有 Provider 的页面还要把它放在 Provider 内层，effects 才能用依赖 context 的 hook。

模块级 effects 反过来直接在模块组件里调用——模块本就是订阅的自然位置，重渲染范围也只是它自己。

**UI** 只读 model、只调 actions，不含状态与编排。

页面层与模块层的关系：`pages/<page>/` 根下的 store / actions / effects 管整页，`modules/<module>/` 下的同名文件管单个模块。模块之间不互相 import——需要协作时走页面层，或走 `live.ts` 与 listener（见 [跨模块协作](docs/cross-module.md)）。

## 目录

`*` 标记的是按需文件，只在该页或该模块确实需要时才出现。

```
src/
  main.tsx            入口
  global.scss         全局样式与 CSS 变量
  theme.ts            antd 主题 token
  lib/                跨页面、与领域无关的机制（FetchStatus、live 表工厂）
  router/             页面清单与路由解析
  layout/             应用外壳与导航
  pages/<page>/
    index.tsx         页面装配
    store.ts          页面级状态
    slice.ts        * reducer 定义，RTK 页专有
    actions.ts        页面级写入与编排
    effects.ts        页面级副作用
    listeners.ts    * 跨模块联动，RTK 页专有
    live.ts           活对象登记表
    shared/           页内共享的类型、纯函数、URL 参数解析
    data/             接口与 mock 数据
    modules/<module>/
      index.tsx       模块 UI
      model.ts        模块视图数据与私有状态
      actions.ts    * 模块交互入口
      effects.ts    * 模块副作用
      slice.ts      * 模块私有状态的 reducer，RTK 页专有
      components/   * 模块内的展示组件
```

模块内与领域绑定的常量与配置表（如 flight 的 `rules.ts`、`category.ts`）就放在该模块目录下，按概念命名，不集中到 `constants/` 之类按种类划分的目录里。

## 设计说明

代码注释只写"读这一行会踩的坑"。为什么这样分层、为什么选这个方案而不是显然的那个，都在文档里：

- [状态建模](docs/state-modeling.md)：状态该归页面层还是模块层、草稿态与已生效态、取数状态的判别式建模、持久化该存什么
- [取数与编排](docs/data-fetching.md)：结果作废、请求竞态、能力闸门、分页与无限滚动、乐观更新与批量操作
- [跨模块协作](docs/cross-module.md)：live 表、listener 旁路、页面层派生、配置表驱动渲染
