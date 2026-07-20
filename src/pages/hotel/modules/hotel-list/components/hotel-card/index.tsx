import { EnvironmentOutlined, StarFilled } from "@ant-design/icons";

import { hotelListActions } from "../../actions";
import type { Hotel } from "../../../../shared/types";

import styles from "./index.module.scss";

interface HotelCardProps {
  hotel: Hotel;
  selected: boolean;
}

export default function HotelCard(props: HotelCardProps) {
  const { hotel, selected } = props;

  return (
    <article
      className={styles.card}
      data-selected={selected}
      onClick={() => hotelListActions.selectHotel(hotel.id)}
    >
      <div className={styles.head}>
        <h3 className={styles.name}>{hotel.name}</h3>
        <span className={styles.star}>{hotel.star}星</span>
      </div>

      <div className={styles.meta}>
        <span className={styles.city}>
          <EnvironmentOutlined /> {hotel.city}
        </span>
        <span className={styles.distance}>距市中心 {hotel.distanceKm} km</span>
      </div>

      <div className={styles.foot}>
        <span className={styles.rating}>
          <StarFilled /> {hotel.rating}
        </span>
        <span className={styles.price}>
          ¥{hotel.pricePerNight}
          <em className={styles.unit}> / 晚</em>
        </span>
      </div>
    </article>
  );
}
