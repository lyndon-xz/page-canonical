import { usePageEffects } from "./effects";
import BookingForm from "./modules/booking-form";
import HotelList from "./modules/hotel-list";
import SearchFilter from "./modules/search-filter";

import styles from "./index.module.scss";

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
      <BookingForm />
    </div>
  );
}
