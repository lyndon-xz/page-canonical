import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

import { useFareRulesActions } from "../../actions";
import type { RuleView } from "../../model";

import styles from "./index.module.scss";

interface RuleItemProps {
  rule: RuleView;
}

export default function RuleItem(props: RuleItemProps) {
  const { rule } = props;
  const { toggleRule } = useFareRulesActions();
  const {
    ruleType,
    standard,
    tooltip,
    qualified,
    qualifiedDesc,
    tip,
    expanded,
  } = rule;

  return (
    <div className={qualified ? styles.itemQualified : styles.itemUnqualified}>
      <div className={styles.head}>
        <span className={styles.standard}>{standard}</span>
        <Tooltip title={tooltip}>
          <InfoCircleOutlined className={styles.infoIcon} />
        </Tooltip>
        <span className={qualified ? styles.statusOk : styles.statusWarn}>
          {qualified ? "符合" : "不符合"}
        </span>
      </div>

      <p className={styles.value}>{qualifiedDesc}</p>

      {tip && (
        <div className={styles.tip}>
          <Button
            type="link"
            size="small"
            className={styles.tipToggle}
            onClick={() => toggleRule(ruleType)}
          >
            {expanded ? "收起建议" : "查看建议"}
          </Button>

          {expanded && (
            <div className={styles.tipBody}>
              <p className={styles.tipTitle}>{tip.title}</p>
              <p className={styles.tipDesc}>{tip.desc}</p>
              {tip.action && (
                <a className={styles.tipAction} href={tip.action.href}>
                  {tip.action.text}
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
