import {
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

import { FAVORITE_LABEL, UNFAVORITE_LABEL } from '../../../../shared/favorite';
import type { Listing } from '../../../../shared/listing';
import { listingListActions } from '../../actions';

import styles from './index.module.scss';

const { selectListing, toggleFavorite } = listingListActions;

function renderFavoriteIcon(isFavorite: boolean, isFavoriting: boolean) {
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
  const { id, title, city, pricePerNight, rating, roomType } = listing;

  return (
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions -- 卡片内还有收藏按钮，整卡不能再套 button；键盘用标题按钮
    <article
      className={styles.card}
      data-selected={isSelected}
      onClick={() => {
        selectListing(id);
      }}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>
          <button
            type="button"
            className={styles.titleButton}
            aria-pressed={isSelected}
            onClick={(event) => {
              event.stopPropagation();
              selectListing(id);
            }}
          >
            {title}
          </button>
        </h3>
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
          aria-label={isFavorite ? UNFAVORITE_LABEL : FAVORITE_LABEL}
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(id);
          }}
        >
          {renderFavoriteIcon(isFavorite, isFavoriting)}
        </button>
      </div>
    </article>
  );
}
