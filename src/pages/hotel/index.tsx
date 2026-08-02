import { usePageEffects } from "./effects";
import HotelList from "./modules/hotel-list";
import SearchFilter from "./modules/search-filter";

import styles from "./index.module.scss";

// 单独成组件：effects 内部订阅状态引起的重渲染只落在这个空组件上，不波及子树
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
