import { Button, Spin } from "antd";

import { useFareRulesActions } from "./actions";
import { CATEGORY_CONFIG, CATEGORY_TAB_ORDER } from "./category";
import RuleItem from "./components/rule-item";
import { FareRulesModel } from "./model";

import styles from "./index.module.scss";

function FareRulesInner() {
  const {
    isVisible,
    selectedFlight,
    isLoading,
    error,
    activeCategory,
    groups,
  } = FareRulesModel.useContainer();
  const { changeCategory, retry } = useFareRulesActions();

  if (!isVisible) {
    return null;
  }

  return (
    <section className={styles.fareRules}>
      <header className={styles.header}>
        <h2 className={styles.title}>退改与权益</h2>
        <span className={styles.subtitle}>{selectedFlight?.flightNo}</span>
      </header>

      <div className={styles.tabs}>
        {CATEGORY_TAB_ORDER.map((category) => (
          <button
            key={category}
            type="button"
            className={styles.tab}
            data-active={category === activeCategory}
            onClick={() => changeCategory(category)}
          >
            {CATEGORY_CONFIG[category].tabLabel}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.stateBox}>
          <Spin />
        </div>
      ) : error ? (
        <div className={styles.stateBox}>
          <p className={styles.errorText}>退改规则加载失败</p>
          <Button size="small" onClick={retry}>
            重试
          </Button>
        </div>
      ) : (
        <div className={styles.groups}>
          {groups.map((group) => (
            <article key={group.category} className={styles.group}>
              <div className={styles.groupHead}>
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <span className={styles.groupCount}>
                  {group.qualifiedCount}/{group.totalCount} 项符合
                </span>
              </div>
              <div className={styles.ruleGrid}>
                {group.rules.map((rule) => (
                  <RuleItem key={rule.ruleType} rule={rule} />
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function FareRules() {
  return (
    <FareRulesModel.Provider>
      <FareRulesInner />
    </FareRulesModel.Provider>
  );
}
