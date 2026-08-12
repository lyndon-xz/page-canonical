import {
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
} from "@ant-design/icons";
import { Checkbox } from "antd";

import type { Hotel } from "../../../../shared/hotel";
import { hotelListActions } from "../../actions";

import styles from "./index.module.scss";

const { selectHotel, toggleSelect, toggleFavorite } = hotelListActions;

interface HotelCardProps {
  hotel: Hotel;
  isSelected: boolean;
  isFavorite: boolean;
  isChecked: boolean;
}

export default function HotelCard(props: HotelCardProps) {
  const { hotel, isSelected, isFavorite, isChecked } = props;
  const { id, name, city, pricePerNight, rating, star, distanceKm } = hotel;

  return (
    <article
      className={styles.card}
      data-selected={isSelected}
      data-checked={isChecked}
      onClick={() => selectHotel(id)}
    >
      <div className={styles.head}>
        <Checkbox
          checked={isChecked}
          className={styles.checkbox}
          aria-label={`勾选 ${name}`}
          onClick={(event) => event.stopPropagation()}
          onChange={() => toggleSelect(id)}
        />
        <h3 className={styles.name}>
          <button
            type="button"
            className={styles.nameButton}
            aria-pressed={isSelected}
            onClick={() => selectHotel(id)}
          >
            {name}
          </button>
        </h3>
        <span className={styles.star}>{star}星</span>
      </div>

      <div className={styles.meta}>
        <span className={styles.city}>
          <EnvironmentOutlined /> {city}
        </span>
        <span className={styles.distance}>距市中心 {distanceKm} km</span>
      </div>

      <div className={styles.foot}>
        <span className={styles.rating}>{rating} 分</span>
        <span className={styles.price}>
          ¥{pricePerNight}
          <em className={styles.unit}> / 晚</em>
        </span>
        <button
          type="button"
          className={styles.favorite}
          data-active={isFavorite}
          aria-label={isFavorite ? "取消收藏" : "收藏酒店"}
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(id);
          }}
        >
          {isFavorite ? <HeartFilled /> : <HeartOutlined />}
        </button>
      </div>
    </article>
  );
}
