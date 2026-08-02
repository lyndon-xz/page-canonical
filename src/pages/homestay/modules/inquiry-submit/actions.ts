import { pageActions } from "../../actions";
import { InquirySubmitError } from "../../data/services";
import { getLive } from "../../live";
import type { InquiryForm } from "../../shared/types";

/** 只接收校验后的纯值；表单实例经 getLive 取，不从参数传入 */
export const inquirySubmitActions = {
  async submit(values: InquiryForm) {
    try {
      await pageActions.submitInquiry(values);
      getLive("inquiryForm")?.reset();
    } catch (error) {
      const form = getLive("inquiryForm");

      if (error instanceof InquirySubmitError) {
        error.fieldErrors.forEach((fieldError) => {
          form?.setError(fieldError.field, { message: fieldError.message });
        });
      }
    }
  },
};
