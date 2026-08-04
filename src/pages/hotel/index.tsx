import { usePageEffects } from "./effects";
import HotelList from "./modules/hotel-list";
import SearchFilter from "./modules/search-filter";

import styles from "./index.module.scss";

// 单独成组件：effects 订阅状态时，重渲染只落在这个空组件上，不牵连整棵页面子树
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
