import PageHero from "@/components/page-hero";

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
      <PageHero eyebrow="住宿 · STAY" title="挑一处落脚地" />
      <SearchFilter />
      <HotelList />
      <BookingForm />
    </div>
  );
}
