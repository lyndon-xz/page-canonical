import { message } from "antd";

import { pageActions } from "../../actions";
import { InquirySubmitError } from "../../data/services";
import { getLive } from "../../live";
import { ConfirmScene, type InquiryForm } from "../../shared/types";

/** 只接收校验后的纯值；表单实例经 getLive 取，不从参数传入 */
export const inquirySubmitActions = {
  async submit(values: InquiryForm) {
    // 先捕获实例：await 期间页面可能重挂载，之后再取会把本次的错误写进新表单
    const form = getLive("inquiryForm");

    try {
      await pageActions.submitInquiry(values);
      form?.reset();
    } catch (error) {
      // 字段级错误落到对应输入框，不再弹 toast——同一件事说两遍
      if (error instanceof InquirySubmitError) {
        error.fieldErrors.forEach((fieldError) => {
          // message 重命名避开 antd 的同名 import
          const { field, message: reason } = fieldError;

          form?.setError(field, { message: reason });
        });
        return;
      }

      message.error(error instanceof Error ? error.message : String(error));
    }
  },

  /** 撤回是破坏性的，转交二次确认；撤哪条由页面层按 submittedInquiry 定 */
  requestCancel() {
    pageActions.openConfirm(ConfirmScene.CancelInquiry);
  },
};
