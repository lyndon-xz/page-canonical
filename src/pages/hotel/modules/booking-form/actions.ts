import { message } from "antd";

import { pageActions } from "../../actions";
import { BookingSubmitError } from "../../data/services";
import { getLive } from "../../live";
import type { BookingForm } from "../../shared/types";

/** 只接收校验后的纯值；表单实例经 getLive 取，不从参数传入 */
export const bookingFormActions = {
  async submit(values: BookingForm) {
    // 先捕获实例：await 期间页面可能重挂载，之后再取会把本次的错误写进新表单
    const form = getLive("bookingForm");

    try {
      await pageActions.submitBooking(values);

      // 联系人留在框里（已存为常用），只把一次性的行程归零，方便接着订下一单
      if (form) {
        form.resetField("checkInDate");
        form.resetField("nights");
        form.resetField("rooms");
      }
    } catch (error) {
      // 字段级错误落到对应输入框，不再弹 toast——同一件事说两遍
      if (error instanceof BookingSubmitError) {
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
};
