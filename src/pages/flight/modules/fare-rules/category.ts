/**
 * 分类是前端概念，服务端只下发 ruleType。
 * 放在模块内而非 shared/，因为只有本模块按分类分组展示。
 */
export enum FareRuleCategory {
  All = "all",
  Refund = "refund",
  Travel = "travel",
}

/** 分组渲染顺序，不含聚合 Tab */
export const CATEGORY_GROUP_ORDER = [
  FareRuleCategory.Refund,
  FareRuleCategory.Travel,
] as const;

export const CATEGORY_TAB_ORDER = [
  FareRuleCategory.All,
  ...CATEGORY_GROUP_ORDER,
] as const;

interface CategoryConfig {
  tabLabel: string;
  /** 分组标题；聚合 Tab 不成组，故为可选 */
  groupTitle?: string;
}

export const CATEGORY_CONFIG: Record<FareRuleCategory, CategoryConfig> = {
  [FareRuleCategory.All]: {
    tabLabel: "全部",
  },
  [FareRuleCategory.Refund]: {
    tabLabel: "退改保障",
    groupTitle: "退改保障",
  },
  [FareRuleCategory.Travel]: {
    tabLabel: "出行权益",
    groupTitle: "出行权益",
  },
};
