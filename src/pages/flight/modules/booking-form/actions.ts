import { pageActions } from "../../actions";
import { getLive } from "../../live";
import { BookingSubmitError } from "../../services";
import type { BookingForm } from "../../shared/types";

/** 这里是纯对象、拿不到 hook 内的表单实例，故经 getLive 取实例回写 */
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
