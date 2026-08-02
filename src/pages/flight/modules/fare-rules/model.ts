import { useMemo, useState } from "react";
import { createContainer } from "unstated-next";

import type { FareRule, FareRuleType } from "../../shared/types";
import { PageStore } from "../../store";

import {
  CATEGORY_CONFIG,
  CATEGORY_GROUP_ORDER,
  FareRuleCategory,
} from "./category";
import { RULE_DEFINITIONS, type RuleAction } from "./rules";

interface RuleTip {
  title: string;
  desc: string;
  action: RuleAction;
}

export interface RuleView {
  ruleType: FareRuleType;
  standard: string;
  tooltip: string;
  /** 展示态是否合格：数值合格且未被整班次阻断 */
  qualified: boolean;
  /** 命中整班次阻断；用于让文案说明「为什么达标也不算」 */
  blocked: boolean;
  qualifiedDesc: string;
  /** 不合格时的改进建议；合格或该规则不给建议时为 null */
  tip: RuleTip | null;
  expanded: boolean;
}

export interface CategoryGroup {
  category: FareRuleCategory;
  title: string;
  qualifiedCount: number;
  totalCount: number;
  rules: RuleView[];
}

const VALUE_PLACEHOLDER = "{value}";

const formatRuleText = (template: string, rule: FareRule) =>
  template.replaceAll(VALUE_PLACEHOLDER, rule.currentValue);

function useFareRulesModelHook() {
  const [activeCategory, setActiveCategory] = useState(FareRuleCategory.All);
  /** 展开了改进建议的规则；折叠态只显示标准与取值 */
  const [expandedRuleTypes, setExpandedRuleTypes] = useState<string[]>([]);

  const {
    fareRules,
    fareBlockReasons,
    isLoadingFareRules,
    fareRulesError,
    isBookingAllowed,
    selectedFlight,
  } = PageStore.useContainer();

  const groups = useMemo(() => {
    const categories =
      activeCategory === FareRuleCategory.All
        ? CATEGORY_GROUP_ORDER
        : [activeCategory];

    return categories
      .map((category): CategoryGroup => {
        const rules = fareRules
          .filter(
            (rule) => RULE_DEFINITIONS[rule.ruleType].category === category,
          )
          .map((rule): RuleView => {
            const definition = RULE_DEFINITIONS[rule.ruleType];
            const {
              standard,
              tooltip,
              qualifiedDesc,
              resolveQualifiedDesc,
              blockReason,
              tip,
            } = definition;

            const blocked =
              !!blockReason && fareBlockReasons.includes(blockReason);
            const qualified = rule.qualified && !blocked;

            return {
              ruleType: rule.ruleType,
              standard,
              tooltip,
              qualified,
              blocked,
              qualifiedDesc: formatRuleText(
                resolveQualifiedDesc?.(rule) ?? qualifiedDesc,
                rule,
              ),
              tip:
                qualified || !tip
                  ? null
                  : {
                      title: tip.title,
                      desc: formatRuleText(
                        tip.resolveDesc?.(rule, blocked) ?? tip.desc,
                        rule,
                      ),
                      action: tip.action ?? null,
                    },
              expanded: expandedRuleTypes.includes(rule.ruleType),
            };
          });

        return {
          category,
          title: CATEGORY_CONFIG[category].groupTitle ?? "",
          qualifiedCount: rules.filter((rule) => rule.qualified).length,
          totalCount: rules.length,
          rules,
        };
      })
      .filter((group) => group.rules.length > 0);
  }, [activeCategory, expandedRuleTypes, fareBlockReasons, fareRules]);

  return {
    // 闸门不通过、或还没选航班时整个模块不渲染
    isVisible: isBookingAllowed && !!selectedFlight,
    selectedFlight,
    isLoading: isLoadingFareRules,
    error: fareRulesError,
    activeCategory,
    setActiveCategory,
    expandedRuleTypes,
    setExpandedRuleTypes,
    groups,
  };
}

export const FareRulesModel = createContainer(useFareRulesModelHook);
