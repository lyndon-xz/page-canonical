import { Button } from "antd";

import { useInquirySubmitActions } from "./actions";
import { useInquirySubmitModel } from "./model";

import styles from "./index.module.scss";

export default function InquirySubmit() {
  const { handleSubmit, isSubmittingInquiry, inquiryError, inquirySubmitted } =
    useInquirySubmitModel();
  const { submit } = useInquirySubmitActions();

  return (
    <div className={styles.submitBar}>
      <Button
        type="primary"
        loading={isSubmittingInquiry}
        onClick={handleSubmit((values) => submit(values))}
      >
        提交询价
      </Button>
      {inquirySubmitted && (
        <span className={styles.feedback} data-status="success">
          询价已提交，房东会尽快联系你
        </span>
      )}
      {inquiryError && (
        <span className={styles.feedback} data-status="error">
          {inquiryError.message}
        </span>
      )}
    </div>
  );
}
