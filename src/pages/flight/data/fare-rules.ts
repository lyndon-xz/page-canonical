import { FareBlockReason, FareRuleType, type FareRule } from "../shared/types";

const ECONOMY_RULES: FareRule[] = [
  { ruleType: FareRuleType.ChangeFee, qualified: false, currentValue: "¥320" },
  { ruleType: FareRuleType.RefundFee, qualified: false, currentValue: "¥480" },
  {
    ruleType: FareRuleType.FreeChangeCount,
    qualified: false,
    currentValue: "0 次",
  },
  {
    ruleType: FareRuleType.BaggageAllowance,
    qualified: true,
    currentValue: "20kg",
  },
  {
    ruleType: FareRuleType.SeatSelection,
    qualified: false,
    currentValue: "起飞前 24h 开放",
  },
  {
    ruleType: FareRuleType.MileageAccrual,
    qualified: true,
    currentValue: "100%",
  },
];

const BUSINESS_RULES: FareRule[] = [
  { ruleType: FareRuleType.ChangeFee, qualified: true, currentValue: "免费" },
  { ruleType: FareRuleType.RefundFee, qualified: true, currentValue: "¥120" },
  {
    ruleType: FareRuleType.FreeChangeCount,
    qualified: true,
    currentValue: "2 次",
  },
  {
    ruleType: FareRuleType.BaggageAllowance,
    qualified: true,
    currentValue: "32kg × 2",
  },
  {
    ruleType: FareRuleType.SeatSelection,
    qualified: true,
    currentValue: "全程免费",
  },
  {
    ruleType: FareRuleType.MileageAccrual,
    qualified: true,
    currentValue: "150%",
  },
];

const FIRST_CLASS_RULES: FareRule[] = [
  { ruleType: FareRuleType.ChangeFee, qualified: true, currentValue: "免费" },
  { ruleType: FareRuleType.RefundFee, qualified: true, currentValue: "免费" },
  {
    ruleType: FareRuleType.FreeChangeCount,
    qualified: true,
    currentValue: "不限",
  },
  {
    ruleType: FareRuleType.BaggageAllowance,
    qualified: true,
    currentValue: "40kg × 2",
  },
  {
    ruleType: FareRuleType.SeatSelection,
    qualified: true,
    currentValue: "全程免费",
  },
  {
    ruleType: FareRuleType.MileageAccrual,
    qualified: true,
    currentValue: "200%",
  },
];

export const MOCK_FARE_RULES: Record<string, FareRule[]> = {
  f1: ECONOMY_RULES,
  f2: BUSINESS_RULES,
  f3: ECONOMY_RULES,
  f4: FIRST_CLASS_RULES,
  f5: ECONOMY_RULES,
  f6: BUSINESS_RULES,
  f7: ECONOMY_RULES,
};

/**
 * f3 已起飞：演示阻断态的文案变体（其改签费本就不达标）。
 * f4 已停售：其选座数值达标，演示达标也被压成不合格。
 */
export const MOCK_FARE_BLOCK_REASONS: Record<string, FareBlockReason[]> = {
  f3: [FareBlockReason.Departed],
  f4: [FareBlockReason.SoldOut],
};
