import {
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import type { Listing } from "../../../../shared/listing";
import { listingListActions } from "../../actions";

import styles from "./index.module.scss";

const { selectListing, toggleFavorite } = listingListActions;

function favoriteIcon(favorite: boolean, favoriting: boolean) {
  if (favoriting) {
    return <LoadingOutlined />;
  }

  return favorite ? <HeartFilled /> : <HeartOutlined />;
}

interface ListingCardProps {
  listing: Listing;
  selected: boolean;
  favorite: boolean;
  // 收藏请求进行中；悲观更新下心标此时还没变，得靠它给个反馈
  favoriting: boolean;
}

export default function ListingCard(props: ListingCardProps) {
  const { listing, selected, favorite, favoriting } = props;
  const { id, title, roomType, city, rating, pricePerNight } = listing;

  return (
    /*
     * 整卡可点，所以要自己补齐按钮的可达性：article 不可聚焦，
     * 少了 tabIndex 与键盘响应，键盘与读屏用户就选不了房源。
     */
    <article
      className={styles.card}
      data-selected={selected}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => selectListing(id)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        // 空格默认滚动页面，这里它是「按下按钮」
        event.preventDefault();
        selectListing(id);
      }}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.roomType}>{roomType}</span>
      </div>

      <div className={styles.meta}>
        <span className={styles.city}>
          <EnvironmentOutlined /> {city}
        </span>
        <span className={styles.rating}>{rating} 分</span>
      </div>

      <div className={styles.foot}>
        <span className={styles.price}>
          ¥{pricePerNight}
          <em className={styles.unit}> / 晚</em>
        </span>
        {/* 阻止冒泡：收藏不应连带触发卡片的选中 */}
        <button
          type="button"
          className={styles.favorite}
          data-active={favorite}
          disabled={favoriting}
          aria-label={favorite ? "取消收藏" : "收藏房源"}
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(id);
          }}
        >
          {favoriteIcon(favorite, favoriting)}
        </button>
      </div>
    </article>
  );
}
