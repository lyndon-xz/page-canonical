import { SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { searchBarActions } from "./actions";
import { CABIN_OPTIONS } from "./constants";
import { useSearchBarModel } from "./model";

import styles from "./index.module.scss";

export default function SearchBar() {
  const { cabinDraft, resultCount, isLoading } = useSearchBarModel();

  return (
    <section className={styles.searchBar}>
      <div className={styles.row}>
        <div className={styles.cabins} role="group" aria-label="舱位筛选">
          {CABIN_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={styles.cabin}
              data-active={cabinDraft === option.value}
              onClick={() => searchBarActions.changeCabin(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          loading={isLoading}
          onClick={searchBarActions.submit}
        >
          搜索
        </Button>
      </div>

      <p className={styles.resultCount}>找到 {resultCount} 个航班</p>
    </section>
  );
}
