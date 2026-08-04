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
  /** 命中整班次阻断 */
  blocked: boolean;
  qualifiedDesc: string;
  /** 不合格时的改进建议 */
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

const formatRuleText = (template: string, rule: FareRule) =>
  template.replaceAll("{value}", rule.currentValue);

function useFareRulesModelHook() {
  const [activeCategory, setActiveCategory] = useState(FareRuleCategory.All);
  const [expandedRuleTypes, setExpandedRuleTypes] = useState<string[]>([]);

  const {
    fareRules,
    fareBlockReasons,
    fareRulesStatus,
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
    isVisible: isBookingAllowed && !!selectedFlight,
    selectedFlight,
    fareRulesStatus,
    activeCategory,
    setActiveCategory,
    expandedRuleTypes,
    setExpandedRuleTypes,
    groups,
  };
}

export const FareRulesModel = createContainer(useFareRulesModelHook);
