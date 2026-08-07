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

function favoriteIcon(isFavorite: boolean, isFavoriting: boolean) {
  if (isFavoriting) {
    return <LoadingOutlined />;
  }

  return isFavorite ? <HeartFilled /> : <HeartOutlined />;
}

interface ListingCardProps {
  listing: Listing;
  isSelected: boolean;
  isFavorite: boolean;
  isFavoriting: boolean;
}

export default function ListingCard(props: ListingCardProps) {
  const { listing, isSelected, isFavorite, isFavoriting } = props;
  const { id, title, roomType, city, rating, pricePerNight } = listing;

  return (
    <article
      className={styles.card}
      data-selected={isSelected}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => selectListing(id)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
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
        <button
          type="button"
          className={styles.favorite}
          data-active={isFavorite}
          disabled={isFavoriting}
          aria-label={isFavorite ? "取消收藏" : "收藏房源"}
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(id);
          }}
        >
          {favoriteIcon(isFavorite, isFavoriting)}
        </button>
      </div>
    </article>
  );
}
