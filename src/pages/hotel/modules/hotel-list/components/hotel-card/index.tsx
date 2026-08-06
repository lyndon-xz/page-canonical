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
  selected: boolean;
  favorite: boolean;
  checked: boolean;
}

export default function HotelCard(props: HotelCardProps) {
  const { hotel, selected, favorite, checked } = props;
  const { id, name, star, city, distanceKm, rating, pricePerNight } = hotel;

  return (
    <article
      className={styles.card}
      data-selected={selected}
      data-checked={checked}
      onClick={() => selectHotel(id)}
    >
      <div className={styles.head}>
        <Checkbox
          checked={checked}
          className={styles.checkbox}
          aria-label={`勾选 ${name}`}
          onClick={(event) => event.stopPropagation()}
          onChange={() => toggleSelect(id)}
        />
        <h3 className={styles.name}>
          <button
            type="button"
            className={styles.nameButton}
            aria-pressed={selected}
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
          data-active={favorite}
          aria-label={favorite ? "取消收藏" : "收藏酒店"}
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(id);
          }}
        >
          {favorite ? <HeartFilled /> : <HeartOutlined />}
        </button>
      </div>
    </article>
  );
}
