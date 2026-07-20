import { usePageEffects } from "./effects";
import HotelList from "./modules/hotel-list";
import SearchFilter from "./modules/search-filter";

import styles from "./index.module.scss";

// 渲染隔离：effects 放在返回 null 的独立组件里，
// 即使内部订阅了会变化的状态，重渲染也只发生在此空组件上，不波及子树。
function EffectsRunner() {
  usePageEffects();
  return null;
}

export default function HotelPage() {
  return (
    <div className={styles.page}>
      <EffectsRunner />
      <header className={styles.hero}>
        <p className={styles.eyebrow}>住宿 · STAY</p>
        <h1 className={styles.heroTitle}>挑一处落脚地</h1>
      </header>
      <SearchFilter />
      <HotelList />
    </div>
  );
}
