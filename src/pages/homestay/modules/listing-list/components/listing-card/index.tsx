import { EnvironmentOutlined, StarFilled } from "@ant-design/icons";

import type { Listing } from "../../../../shared/types";
import { useListingListActions } from "../../actions";
import { ListingListModel } from "../../model";

import styles from "./index.module.scss";

interface ListingCardProps {
  listing: Listing;
  selected: boolean;
}

export default function ListingCard(props: ListingCardProps) {
  const { listing, selected } = props;
  const { hoveredId } = ListingListModel.useContainer();
  const { selectListing, hoverListing } = useListingListActions();

  return (
    <article
      className={styles.card}
      data-selected={selected}
      data-hovered={hoveredId === listing.id}
      onClick={() => selectListing(listing.id)}
      onMouseEnter={() => hoverListing(listing.id)}
      onMouseLeave={() => hoverListing(null)}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>{listing.title}</h3>
        <span className={styles.roomType}>{listing.roomType}</span>
      </div>

      <div className={styles.meta}>
        <span className={styles.city}>
          <EnvironmentOutlined /> {listing.city}
        </span>
        <span className={styles.rating}>
          <StarFilled /> {listing.rating}
        </span>
      </div>

      <div className={styles.foot}>
        <span className={styles.price}>
          ¥{listing.pricePerNight}
          <em className={styles.unit}> / 晚</em>
        </span>
      </div>
    </article>
  );
}
