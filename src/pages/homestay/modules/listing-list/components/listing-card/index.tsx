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
  favoriting: boolean;
}

export default function ListingCard(props: ListingCardProps) {
  const { listing, selected, favorite, favoriting } = props;
  const { id, title, roomType, city, rating, pricePerNight } = listing;

  return (
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
