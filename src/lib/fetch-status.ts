/** 一次取数在 UI 上的状态 */
export enum FetchStatus {
  Loading = "loading",
  Error = "error",
  /** 兼作初始值：无进行中的请求，也无失败 */
  Ready = "ready",
}
