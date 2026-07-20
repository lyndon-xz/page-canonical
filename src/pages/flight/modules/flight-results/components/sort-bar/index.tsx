import { flightResultsActions } from "../../actions";
import { SORT_OPTIONS } from "../../constants";
import { useFlightResultsModel } from "../../model";

import styles from "./index.module.scss";

export default function SortBar() {
  const { sortBy } = useFlightResultsModel();

  return (
    <div className={styles.sortBar} role="group" aria-label="排序方式">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.option}
          data-active={sortBy === option.value}
          onClick={() => flightResultsActions.changeSortBy(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
