import {
  FareBlockReason,
  FareRuleType,
  type FareRule,
} from "../../shared/types";
import { FareRuleCategory } from "./category";

/** 规则不合格时的引导入口 */
export type RuleAction = { text: string; href: string } | null;

/** 需要按数据取变体的字段配 resolveXxx，覆盖同名的静态字段 */
export interface RuleDefinition {
  category: FareRuleCategory;
  standard: string;
  tooltip: string;
  /** 合格态的取值说明，`{value}` 占位当前取值 */
  qualifiedDesc: string;
  resolveQualifiedDesc?: (rule: FareRule) => string;
  /** 本规则关注的整班次阻断原因 */
  blockReason?: FareBlockReason;
  /** 不合格时的改进建议 */
  tip: {
    title: string;
    desc: string;
    resolveDesc?: (rule: FareRule, blocked: boolean) => string;
    action?: RuleAction;
  } | null;
}

export const RULE_DEFINITIONS: Record<FareRuleType, RuleDefinition> = {
  [FareRuleType.ChangeFee]: {
    category: FareRuleCategory.Refund,
    standard: "改签费不高于票面 10%",
    tooltip: "按起飞前 24 小时改签一次计算，不含航司临时加收的差价。",
    qualifiedDesc: "当前改签费 {value}",
    blockReason: FareBlockReason.Departed,
    tip: {
      title: "改签成本偏高",
      desc: "当前改签费 {value}，换乘同航线的商务舱可免改签费。",
      resolveDesc: (_rule, blocked) =>
        blocked
          ? "该班次已起飞，改签通道已关闭，请改订后续班次。"
          : "当前改签费 {value}，换乘同航线的商务舱可免改签费。",
      action: { text: "看可改签班次", href: "/flight?cabin=商务舱" },
    },
  },

  [FareRuleType.RefundFee]: {
    category: FareRuleCategory.Refund,
    standard: "退票费不高于票面 15%",
    tooltip: "按起飞前 24 小时自愿退票计算，航司不可控原因导致的退票不计入。",
    qualifiedDesc: "当前退票费 {value}",
    blockReason: FareBlockReason.Departed,
    tip: {
      title: "退票成本偏高",
      desc: "当前退票费 {value}，建议确认行程后再下单。",
      action: null,
    },
  },

  [FareRuleType.FreeChangeCount]: {
    category: FareRuleCategory.Refund,
    standard: "至少 1 次免费改签",
    tooltip: "指出票后到起飞前可免手续费改签的次数，不含航班取消的被动改签。",
    qualifiedDesc: "可免费改签 {value}",
    tip: {
      title: "无免费改签额度",
      desc: "该舱位不含免费改签，行程不确定时建议选高舱位。",
      action: { text: "对比高舱位", href: "/flight?cabin=商务舱" },
    },
  },

  [FareRuleType.BaggageAllowance]: {
    category: FareRuleCategory.Travel,
    standard: "免费托运不少于 20kg",
    tooltip: "指单人免费托运额度，随舱位与航司会员等级变化。",
    qualifiedDesc: "免费托运 {value}",
    tip: {
      title: "托运额度偏少",
      desc: "免费托运仅 {value}，超重按航司现场标准计费。",
      action: null,
    },
  },

  [FareRuleType.SeatSelection]: {
    category: FareRuleCategory.Travel,
    standard: "支持提前免费选座",
    tooltip: "指出票后即可免费选座；部分舱位需等到临近起飞才开放。",
    qualifiedDesc: "选座权益：{value}",
    /** 停售后选座入口一并关闭，故与整班次阻断绑定 */
    blockReason: FareBlockReason.SoldOut,
    tip: {
      title: "选座受限",
      desc: "{value}，靠窗与前排座位可能已被锁定。",
      resolveDesc: (_rule, blocked) =>
        blocked
          ? "该班次已停售，选座入口不再开放。"
          : "{value}，靠窗与前排座位可能已被锁定。",
      action: null,
    },
  },

  [FareRuleType.MileageAccrual]: {
    category: FareRuleCategory.Travel,
    standard: "里程积累比例不低于 100%",
    tooltip: "指实际飞行里程计入航司会员账户的比例。",
    qualifiedDesc: "里程积累 {value}",
    resolveQualifiedDesc: (rule) =>
      rule.currentValue === "100%"
        ? "里程积累 {value}（基础比例）"
        : "里程积累 {value}，高于基础比例",
    tip: null,
  },
};
