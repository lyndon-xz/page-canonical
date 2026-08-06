import { SORT_BY_VALUES, type SortBy } from "../../../../shared/params";
import { hotelListActions } from "../../actions";
import { useHotelListModel } from "../../model";

import styles from "./index.module.scss";

const { changeSortBy } = hotelListActions;

const SORT_LABELS: Record<SortBy, string> = {
  price: "价格优先",
  rating: "评分优先",
  distance: "距离优先",
};

export default function SortBar() {
  const { sortBy } = useHotelListModel();

  return (
    <div className={styles.sortBar} role="group" aria-label="排序方式">
      {SORT_BY_VALUES.map((value) => (
        <button
          key={value}
          type="button"
          className={styles.option}
          data-active={sortBy === value}
          onClick={() => changeSortBy(value)}
        >
          {SORT_LABELS[value]}
        </button>
      ))}
    </div>
  );
}
