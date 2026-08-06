import { message } from "antd";

import { pageActions } from "../../actions";
import { InquirySubmitError } from "../../data/services";
import { getLive } from "../../live";
import { ConfirmScene } from "../../shared/confirm";
import type { InquiryForm } from "../../shared/inquiry";

export const inquirySubmitActions = {
  async submit(values: InquiryForm) {
    pageActions.trackClick("inquiry_submit");

    const form = getLive("inquiryForm");

    try {
      await pageActions.submitInquiry(values);
      form?.reset();
    } catch (error) {
      if (error instanceof InquirySubmitError) {
        error.fieldErrors.forEach((fieldError) => {
          const { field, message: reason } = fieldError;

          form?.setError(field, { message: reason });
        });
        return;
      }

      message.error(error instanceof Error ? error.message : String(error));
    }
  },

  requestCancel() {
    pageActions.trackClick("inquiry_cancel_request");
    pageActions.openConfirm({ scene: ConfirmScene.CancelInquiry });
  },
};
