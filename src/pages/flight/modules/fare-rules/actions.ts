import { usePageActions } from "../../actions";

import type { FareRuleType } from "../../shared/types";

import type { FareRuleCategory } from "./category";
import { FareRulesModel } from "./model";

export function useFareRulesActions() {
  const { setActiveCategory, setExpandedRuleTypes } =
    FareRulesModel.useContainer();
  const { retryFareRules } = usePageActions();

  const changeCategory = (category: FareRuleCategory) => {
    setActiveCategory(category);
  };

  const toggleRule = (ruleType: FareRuleType) => {
    setExpandedRuleTypes((current) =>
      current.includes(ruleType)
        ? current.filter((item) => item !== ruleType)
        : [...current, ruleType],
    );
  };

  const retry = () => {
    retryFareRules();
  };

  return { changeCategory, toggleRule, retry };
}
