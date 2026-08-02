import { SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";

import { searchFilterActions } from "./actions";
import { STAR_OPTIONS } from "./constants";
import { useSearchFilterModel } from "./model";

import styles from "./index.module.scss";

export default function SearchFilter() {
  const { keyword, star, resultCount, isLoading } = useSearchFilterModel();

  return (
    <section className={styles.searchFilter}>
      <div className={styles.row}>
        <Input
          className={styles.keywordInput}
          placeholder="搜索酒店名称或城市"
          allowClear
          value={keyword}
          prefix={<SearchOutlined />}
          onChange={(e) => searchFilterActions.updateKeyword(e.target.value)}
          onPressEnter={searchFilterActions.submit}
        />
        <Button
          type="primary"
          loading={isLoading}
          onClick={searchFilterActions.submit}
        >
          搜索
        </Button>
      </div>

      <div className={styles.chips} role="group" aria-label="星级筛选">
        {STAR_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.chip}
            data-active={star === option.value}
            onClick={() => searchFilterActions.updateStar(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className={styles.resultCount}>找到 {resultCount} 家</p>
    </section>
  );
}
