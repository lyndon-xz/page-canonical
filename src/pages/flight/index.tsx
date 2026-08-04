import { usePageEffects } from "./effects";
import BookingForm from "./modules/booking-form";
import FareRules from "./modules/fare-rules";
import FlightResults from "./modules/flight-results";
import SearchBar from "./modules/search-bar";
import { PageStore } from "./store";

import styles from "./index.module.scss";

// effects 经 usePageActions 从 context 取 Container，只能挂在 Provider 内层
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
