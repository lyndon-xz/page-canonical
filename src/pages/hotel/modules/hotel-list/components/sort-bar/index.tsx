import { hotelListActions } from "../../actions";
import { useHotelListModel } from "../../model";
import { SORT_OPTIONS } from "../../sort";

import styles from "./index.module.scss";

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
