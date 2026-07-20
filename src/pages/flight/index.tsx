import { Provider } from "react-redux";

import { usePageEffects } from "./effects";
import BookingForm from "./modules/booking-form";
import FlightResults from "./modules/flight-results";
import SearchBar from "./modules/search-bar";
import { store } from "./store";

import styles from "./index.module.scss";

// 渲染隔离：effects 放在返回 null 的独立组件里，
// 即使内部订阅了会变化的状态，重渲染也只发生在此空组件上，不波及子树。
// 置于 <Provider> 内层：effects 依赖 store，其内部订阅需在 Provider 子树内。
function EffectsRunner() {
  usePageEffects();
  return null;
}

export default function FlightPage() {
  return (
    <Provider store={store}>
      <div className={styles.page}>
        <EffectsRunner />
        <header className={styles.hero}>
          <p className={styles.eyebrow}>航班 · FLIGHT</p>
          <h1 className={styles.heroTitle}>选一班准点的飞行</h1>
        </header>
        <SearchBar />
        <FlightResults />
        <BookingForm />
      </div>
    </Provider>
  );
}
