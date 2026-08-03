import { SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { useSearchBarActions } from "./actions";
import { SearchBarModel } from "./model";

import styles from "./index.module.scss";

const CABIN_OPTIONS: { label: string; value: string }[] = [
  { label: "不限", value: "" },
  { label: "经济舱", value: "经济舱" },
  { label: "商务舱", value: "商务舱" },
  { label: "头等舱", value: "头等舱" },
];

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
