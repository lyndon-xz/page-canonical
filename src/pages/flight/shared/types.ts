/** 航班领域模型：跨模块共用，放页面 shared/ */
export interface Flight {
  id: string;
  airline: string;
  /** 航班号，如 CA1234 */
  flightNo: string;
  /** 出发城市 */
  from: string;
  /** 到达城市 */
  to: string;
  /** 起飞时间，HH:mm */
  departTime: string;
  /** 到达时间，HH:mm */
  arriveTime: string;
  price: number;
  /** 舱位：经济舱 / 商务舱 / 头等舱 */
  cabin: string;
}

/** 筛选条件：由 search-bar 模块提交、写入页面 store */
export interface FlightFilters {
  /** 舱位筛选，空串表示不限 */
  cabin: string;
}

/** 排序维度：flight-results 模块本地状态 */
export type SortBy = "price" | "departTime";

/**
 * flight-results 模块经 useImperativeHandle 暴露的命令式句柄。
 * 承载它的 ref 登记进 liveStore（key: flightResults），供 search-bar 提交后跨模块命令式调用，
 * 两模块互不 import。定义在 shared/ 以便全局 live 层与该模块共用同一类型。
 */
export interface FlightResultsHandle {
  scrollToTop: () => void;
}

/**
 * 预订表单：非结构化「活对象」（useForm 实例）承载的纯值形状。
 * 表单实例本身进 liveStore（见 live.ts），不进 store 的可序列化 state。
 * RTK 下 actions 是纯对象（store.dispatch），拿不到 hook 内的实例，故经 getLive 命令式回写（§3.2 / §4.1）。
 */
export interface BookingForm {
  passengerName: string;
  /** 证件号 */
  idNumber: string;
  contactPhone: string;
}

/** 服务端字段级校验错误：提交失败时由 action 经 getLive 回填到表单（交接传纯值、回写走 getLive） */
export interface BookingFieldError {
  field: keyof BookingForm;
  message: string;
}
