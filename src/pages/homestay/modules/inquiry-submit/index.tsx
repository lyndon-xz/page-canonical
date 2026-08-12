import { Button } from "antd";

import type { SubmittedInquiry } from "../../shared/inquiry";

import { inquirySubmitActions } from "./actions";
import { useInquirySubmitModel } from "./model";

import styles from "./index.module.scss";

const { submit, requestCancel } = inquirySubmitActions;

function formatQuoteText(inquiry: SubmittedInquiry) {
  const { listingTitle, quote } = inquiry;
  const { nights, nightlyAverage, grossPrice, discountAmount, totalPrice } =
    quote;

  const discountText =
    discountAmount > 0 ? `，长住立减 ¥${discountAmount}` : "";

  return `「${listingTitle}」房东报价：${nights} 晚共 ¥${grossPrice}（均价 ¥${nightlyAverage} / 晚）${discountText}，合计 ¥${totalPrice}`;
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
        onClick={handleSubmit(submit)}
      >
        提交询价
      </Button>

      {submittedInquiry && (
        <>
          <span className={styles.feedback}>
            {formatQuoteText(submittedInquiry)}
          </span>
          <Button danger size="small" onClick={requestCancel}>
            撤回询价
          </Button>
        </>
      )}
    </div>
  );
}
