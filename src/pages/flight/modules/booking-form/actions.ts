import { message } from "antd";

import { usePageActions } from "../../actions";
import { BookingSubmitError } from "../../data/services";
import { getLive } from "../../live";
import type { BookingForm } from "../../shared/types";

/** 表单实例经 getLive 取，故只收纯值 */
export function useBookingFormActions() {
  const { submitBooking } = usePageActions();

  const submit = async (values: BookingForm) => {
    try {
      await submitBooking(values);
      getLive("bookingForm")?.reset();
    } catch (error) {
      // 字段级错误落到对应输入框，不再弹 toast——同一件事说两遍
      if (error instanceof BookingSubmitError) {
        const form = getLive("bookingForm");

        error.fieldErrors.forEach((fieldError) => {
          form?.setError(fieldError.field, { message: fieldError.message });
        });
        return;
      }

      message.error(error instanceof Error ? error.message : String(error));
    }
  };

  return { submit };
}
