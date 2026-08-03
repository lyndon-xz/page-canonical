import { hotelListActions } from "../../actions";
import { useHotelListModel } from "../../model";
import type { SortBy } from "../../../../shared/types";

import styles from "./index.module.scss";

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "价格优先", value: "price" },
  { label: "评分优先", value: "rating" },
  { label: "距离优先", value: "distance" },
];

export default function SortBar() {
  const { sortBy } = useHotelListModel();

  return (
    <div className={styles.sortBar} role="group" aria-label="排序方式">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.option}
          data-active={sortBy === option.value}
          onClick={() => hotelListActions.changeSortBy(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
