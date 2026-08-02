import { usePageActions } from "../../actions";

import type { FareRuleCategory } from "./category";
import { FareRulesModel } from "./model";

export function useFareRulesActions() {
  const { setActiveCategory, setExpandedRuleTypes } =
    FareRulesModel.useContainer();
  const { retryFareRules } = usePageActions();

  const changeCategory = (category: FareRuleCategory) => {
    setActiveCategory(category);
  };

  const toggleRule = (ruleType: string) => {
    setExpandedRuleTypes((current) =>
      current.includes(ruleType)
        ? current.filter((item) => item !== ruleType)
        : [...current, ruleType],
    );
  };

  // 重试属页面级取数，转交页面 action
  const retry = () => {
    retryFareRules();
  };

  return { changeCategory, toggleRule, retry };
}
