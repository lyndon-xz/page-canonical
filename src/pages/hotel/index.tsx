import { usePageEffects } from "./effects";
import HotelList from "./modules/hotel-list";
import SearchFilter from "./modules/search-filter";

import styles from "./index.module.scss";

// 页面 effects 单独成组件：它若订阅状态，重渲染只落在这个空组件上。
// 直接在页面组件里调用的话，页面是子树根，一次订阅变更就会重渲染所有模块。
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
