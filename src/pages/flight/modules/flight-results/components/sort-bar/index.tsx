import { useFlightResultsActions } from "../../actions";
import { FlightResultsModel } from "../../model";
import type { SortBy } from "../../../../shared/types";

import styles from "./index.module.scss";

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "价格优先", value: "price" },
  { label: "起飞时间", value: "departTime" },
];

export default function SortBar() {
  const { sortBy } = FlightResultsModel.useContainer();
  const { changeSortBy } = useFlightResultsActions();

  return (
    <div className={styles.sortBar} role="group" aria-label="排序方式">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.option}
          data-active={sortBy === option.value}
          onClick={() => changeSortBy(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
