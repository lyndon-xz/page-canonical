import { SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";

import { searchFilterActions } from "./actions";
import { useSearchFilterEffects } from "./effects";
import { useSearchFilterModel } from "./model";

import styles from "./index.module.scss";

const { updateKeyword, submit, updateStar } = searchFilterActions;

const STAR_OPTIONS: { label: string; value: number }[] = [
  { label: "不限", value: 0 },
  { label: "三星", value: 3 },
  { label: "四星", value: 4 },
  { label: "五星", value: 5 },
];

export default function SearchFilter() {
  const { keyword, star, resultCount, isLoading } = useSearchFilterModel();
  useSearchFilterEffects();

  return (
    <section className={styles.searchFilter}>
      <div className={styles.row}>
        <Input
          className={styles.keywordInput}
          placeholder="搜索酒店名称或城市"
          allowClear
          value={keyword}
          prefix={<SearchOutlined />}
          onChange={(e) => updateKeyword(e.target.value)}
          onPressEnter={submit}
        />
        <Button type="primary" loading={isLoading} onClick={submit}>
          搜索
        </Button>
      </div>

      <div className={styles.chips} role="group" aria-label="星级筛选">
        {STAR_OPTIONS.map((option) => {
          const { value, label } = option;

          return (
            <button
              key={value}
              type="button"
              className={styles.chip}
              data-active={star === value}
              onClick={() => updateStar(value)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className={styles.resultCount}>找到 {resultCount} 家</p>
    </section>
  );
}
