import { pageActions } from "../../actions";
import { getLive } from "../../live";
import { BookingSubmitError } from "../../services";
import type { BookingForm } from "../../shared/types";

/**
 * 模块 actions：纯对象（RTK 下 actions 拿不到 hook 内的表单实例）。
 * submit 只接收 handleSubmit 校验后的纯值，编排提交：
 * 成功 → 经 getLive('bookingForm') 命令式 reset 回写；
 * 失败 → 经 getLive 取实例、把服务端字段错误映射回 setError。
 * 回写 / 映射逻辑全在 action，不进 UI（§3.2 / §4.1）。
 */
export const bookingFormActions = {
  async submit(values: BookingForm) {
    try {
      await pageActions.submitBooking(values);
      getLive("bookingForm")?.reset();
    } catch (error) {
      const form = getLive("bookingForm");
      if (error instanceof BookingSubmitError) {
        error.fieldErrors.forEach((fieldError) => {
          form?.setError(fieldError.field, { message: fieldError.message });
        });
      }
    }
  },
};
