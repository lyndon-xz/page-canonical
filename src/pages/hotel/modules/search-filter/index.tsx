import { SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";

import { STAR_VALUES, type Star } from "../../shared/params";

import { searchFilterActions } from "./actions";
import { useSearchFilterEffects } from "./effects";
import { useSearchFilterModel } from "./model";

import styles from "./index.module.scss";

const { updateKeyword, submit, updateStar } = searchFilterActions;

const STAR_LABELS: Record<Star, string> = {
  0: "不限",
  3: "三星",
  4: "四星",
  5: "五星",
};

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
        {STAR_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            className={styles.chip}
            data-active={star === value}
            onClick={() => updateStar(value)}
          >
            {STAR_LABELS[value]}
          </button>
        ))}
      </div>

      <p className={styles.resultCount}>
        {isLoading ? "搜索中…" : `找到 ${resultCount} 家`}
      </p>
    </section>
  );
}
