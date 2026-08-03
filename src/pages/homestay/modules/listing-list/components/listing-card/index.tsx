import {
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
} from "@ant-design/icons";

import type { Listing } from "../../../../shared/types";
import { listingListActions } from "../../actions";
import { useListingListModel } from "../../model";

import styles from "./index.module.scss";

interface ListingCardProps {
  listing: Listing;
  selected: boolean;
}

export default function ListingCard(props: ListingCardProps) {
  const { listing, selected } = props;
  const { favoriteIds } = useListingListModel();
  const { selectListing, toggleFavorite } = listingListActions;
  const isFavorite = favoriteIds.includes(listing.id);

  return (
    <article
      className={styles.card}
      data-selected={selected}
      onClick={() => selectListing(listing.id)}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>{listing.title}</h3>
        <span className={styles.roomType}>{listing.roomType}</span>
      </div>

      <div className={styles.meta}>
        <span className={styles.city}>
          <EnvironmentOutlined /> {listing.city}
        </span>
        <span className={styles.rating}>{listing.rating} 分</span>
      </div>

      <div className={styles.foot}>
        <span className={styles.price}>
          ¥{listing.pricePerNight}
          <em className={styles.unit}> / 晚</em>
        </span>
        {/* 阻止冒泡：收藏不应连带触发卡片的选中 */}
        <button
          type="button"
          className={styles.favorite}
          data-active={isFavorite}
          aria-label={isFavorite ? "取消收藏" : "收藏房源"}
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(listing.id);
          }}
        >
          {isFavorite ? <HeartFilled /> : <HeartOutlined />}
        </button>
      </div>
    </article>
  );
}
