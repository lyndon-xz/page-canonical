import { Button } from "antd";

import type { SubmittedInquiry } from "../../shared/inquiry";

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

      {/* 报价留在页面上：它是询价的结果本身，撤回才会清掉 */}
      {submittedInquiry && (
        <>
          <span className={styles.feedback} data-status="success">
            {quoteText(submittedInquiry)}
          </span>
          <Button danger size="small" onClick={requestCancel}>
            撤回询价
          </Button>
        </>
      )}
    </div>
  );
}
