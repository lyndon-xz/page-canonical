import { Button } from "antd";

import type { SubmittedInquiry } from "../../shared/types";

import { inquirySubmitActions } from "./actions";
import { useInquirySubmitModel } from "./model";

import styles from "./index.module.scss";

const { submit, requestCancel } = inquirySubmitActions;

function quoteText(inquiry: SubmittedInquiry) {
  const { listingTitle, quote } = inquiry;
  const { pricePerNight, nights, totalPrice } = quote;

  return `「${listingTitle}」房东报价 ¥${pricePerNight} / 晚 × ${nights} 晚，合计 ¥${totalPrice}`;
}

export default function InquirySubmit() {
  const {
    handleSubmit,
    hasInquiryListing,
    isSubmittingInquiry,
    submittedInquiry,
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

      {/* 报价留在页面上：它是询价的结果本身，撤回才会清掉。
          失败反过来走 toast——提交失败不改变界面，用户只需即时知道没成 */}
      {submittedInquiry && (
        <>
          <span className={styles.feedback} data-status="success">
            {quoteText(submittedInquiry)}
          </span>
          {/* 撤回入口跟着这条询价走，故与报价同生共死 */}
          <Button danger size="small" onClick={requestCancel}>
            撤回询价
          </Button>
        </>
      )}
    </div>
  );
}
