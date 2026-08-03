import { message } from "antd";

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
      // 字段级错误落到对应输入框，不再弹 toast——同一件事说两遍
      if (error instanceof InquirySubmitError) {
        const form = getLive("inquiryForm");

        error.fieldErrors.forEach((fieldError) => {
          form?.setError(fieldError.field, { message: fieldError.message });
        });
        return;
      }

      message.error(error instanceof Error ? error.message : String(error));
    }
  },
};
