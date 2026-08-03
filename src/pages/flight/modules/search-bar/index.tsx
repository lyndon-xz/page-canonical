import { SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { useSearchBarActions } from "./actions";
import { CABIN_OPTIONS } from "./cabin";
import { SearchBarModel } from "./model";

import styles from "./index.module.scss";

function SearchBarInner() {
  const { cabinDraft, resultCount, isLoading } = SearchBarModel.useContainer();
  const { changeCabin, submit } = useSearchBarActions();

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
              onClick={() => changeCabin(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          loading={isLoading}
          onClick={submit}
        >
          搜索
        </Button>
      </div>

      <p className={styles.resultCount}>找到 {resultCount} 个航班</p>
    </section>
  );
}

export default function SearchBar() {
  return (
    <SearchBarModel.Provider>
      <SearchBarInner />
    </SearchBarModel.Provider>
  );
}
