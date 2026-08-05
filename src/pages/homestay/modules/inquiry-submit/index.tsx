import { Button } from "antd";

import { inquirySubmitActions } from "./actions";
import { useInquirySubmitModel } from "./model";

import styles from "./index.module.scss";

const { submit, requestCancel } = inquirySubmitActions;

export default function InquirySubmit() {
  const {
    handleSubmit,
    hasInquiryListing,
    isSubmittingInquiry,
    hasSubmittedInquiry,
  } = useInquirySubmitModel();

  return (
    <div className={styles.submitBar}>
      <Button
        type="primary"
        loading={isSubmittingInquiry}
        disabled={!hasInquiryListing}
        onClick={handleSubmit((values) => submit(values))}
      >
        提交询价
      </Button>

      {/* 成功态留在页面上：它是「已发起询价」这件事本身，撤回询价才会清掉。
          失败反过来走 toast——提交失败不改变界面，用户只需即时知道没成 */}
      {hasSubmittedInquiry && (
        <>
          <span className={styles.feedback} data-status="success">
            询价已提交，房东会尽快联系你
          </span>
          {/* 撤回入口跟着这条询价走，故与成功态同生共死 */}
          <Button danger size="small" onClick={requestCancel}>
            撤回询价
          </Button>
        </>
      )}
    </div>
  );
}
