import { usePageActions } from "../../actions";
import { BookingSubmitError } from "../../data/services";
import { getLive } from "../../live";
import type { BookingForm } from "../../shared/types";

/** 只接收校验后的纯值；表单实例经 getLive 取，不从参数传入 */
export function useBookingFormActions() {
  const { submitBooking } = usePageActions();

  const submit = async (values: BookingForm) => {
    try {
      await submitBooking(values);
      getLive("bookingForm")?.reset();
    } catch (error) {
      const form = getLive("bookingForm");

      if (error instanceof BookingSubmitError) {
        error.fieldErrors.forEach((fieldError) => {
          form?.setError(fieldError.field, { message: fieldError.message });
        });
      }
    }
  };

  return { submit };
}
