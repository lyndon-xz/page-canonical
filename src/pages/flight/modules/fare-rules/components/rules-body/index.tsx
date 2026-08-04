import { Button, Spin } from "antd";

import { FetchStatus } from "@/lib/fetch-status";

import { useFareRulesActions } from "../../actions";
import { FareRulesModel } from "../../model";
import RuleItem from "../rule-item";

import styles from "./index.module.scss";

export default function RulesBody() {
  const { fareRulesStatus, groups } = FareRulesModel.useContainer();
  const { retry } = useFareRulesActions();

  if (fareRulesStatus === FetchStatus.Loading) {
    return (
      <div className={styles.stateBox}>
        <Spin />
      </div>
    );
  }

  if (fareRulesStatus === FetchStatus.Error) {
    return (
      <div className={styles.stateBox}>
        <p className={styles.errorText}>退改规则加载失败</p>
        <Button size="small" onClick={retry}>
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.groups}>
      {groups.map((group) => {
        const { category, title, qualifiedCount, totalCount, rules } = group;

        return (
          <article key={category} className={styles.group}>
            <div className={styles.groupHead}>
              <h3 className={styles.groupTitle}>{title}</h3>
              <span className={styles.groupCount}>
                {qualifiedCount}/{totalCount} 项符合
              </span>
            </div>
            <div className={styles.ruleGrid}>
              {rules.map((rule) => (
                <RuleItem key={rule.ruleType} rule={rule} />
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
