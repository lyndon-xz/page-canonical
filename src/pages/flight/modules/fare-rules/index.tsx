import { useFareRulesActions } from "./actions";
import { CATEGORY_CONFIG, CATEGORY_TAB_ORDER } from "./category";
import RulesBody from "./components/rules-body";
import { FareRulesModel } from "./model";

import styles from "./index.module.scss";

function FareRulesInner() {
  const { isVisible, selectedFlight, activeCategory } =
    FareRulesModel.useContainer();
  const { changeCategory } = useFareRulesActions();

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

      <RulesBody />
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
