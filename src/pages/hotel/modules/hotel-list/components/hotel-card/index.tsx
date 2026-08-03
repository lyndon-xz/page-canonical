import {
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
} from "@ant-design/icons";
import { Checkbox } from "antd";

import { hotelListActions } from "../../actions";
import type { Hotel } from "../../../../shared/types";

import styles from "./index.module.scss";

interface HotelCardProps {
  hotel: Hotel;
  selected: boolean;
  favorite: boolean;
  /** 是否被多选勾中；与 selected（单选高亮）互不相干 */
  checked: boolean;
}

export default function HotelCard(props: HotelCardProps) {
  const { hotel, selected, favorite, checked } = props;

  return (
    <article
      className={styles.card}
      data-selected={selected}
      data-checked={checked}
      onClick={() => hotelListActions.selectHotel(hotel.id)}
    >
      <div className={styles.head}>
        {/* 阻止冒泡：勾选不应连带触发卡片的单选高亮 */}
        <Checkbox
          checked={checked}
          className={styles.checkbox}
          aria-label={`勾选 ${hotel.name}`}
          onClick={(event) => event.stopPropagation()}
          onChange={() => hotelListActions.toggleSelect(hotel.id)}
        />
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
        {/* 评分不用星星图标：星星是星级（hotel.star）的表达，两者都用星会混淆 */}
        <span className={styles.rating}>{hotel.rating} 分</span>
        <span className={styles.price}>
          ¥{hotel.pricePerNight}
          <em className={styles.unit}> / 晚</em>
        </span>
        <button
          type="button"
          className={styles.favorite}
          data-active={favorite}
          aria-label={favorite ? "取消收藏" : "收藏酒店"}
          onClick={(event) => {
            event.stopPropagation();
            hotelListActions.toggleFavorite(hotel.id);
          }}
        >
          {favorite ? <HeartFilled /> : <HeartOutlined />}
        </button>
      </div>
    </article>
  );
}
