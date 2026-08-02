import { usePageEffects } from "./effects";
import BookingForm from "./modules/booking-form";
import FareRules from "./modules/fare-rules";
import FlightResults from "./modules/flight-results";
import SearchBar from "./modules/search-bar";
import { PageStore } from "./store";

import styles from "./index.module.scss";

// 单独成组件：effects 内部订阅状态引起的重渲染只落在这个空组件上，不波及子树。
// 必须挂在 PageStore.Provider 内层，否则 usePageActions 取不到 Container。
function EffectsRunner() {
  usePageEffects();
  return null;
}

export default function FlightPage() {
  return (
    <PageStore.Provider>
      <div className={styles.page}>
        <EffectsRunner />
        <header className={styles.hero}>
          <p className={styles.eyebrow}>航班 · FLIGHT</p>
          <h1 className={styles.heroTitle}>选一班准点的飞行</h1>
        </header>
        <SearchBar />
        <FlightResults />
        <FareRules />
        <BookingForm />
      </div>
    </PageStore.Provider>
  );
}
