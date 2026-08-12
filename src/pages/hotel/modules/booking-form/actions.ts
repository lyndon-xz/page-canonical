import { message } from "antd";

import { toErrorMessage } from "@/lib/error";

import { pageActions } from "../../actions";
import { BookingSubmitError } from "../../data/services";
import { getLive } from "../../live";
import type { BookingForm } from "../../shared/booking";

export const bookingFormActions = {
  async submit(values: BookingForm) {
    const form = getLive("bookingForm");

    try {
      await pageActions.submitBooking(values);

      form?.resetField("checkInDate");
      form?.resetField("nights");
      form?.resetField("rooms");
    } catch (error) {
      if (error instanceof BookingSubmitError) {
        error.fieldErrors.forEach((fieldError) => {
          const { field, message: reason } = fieldError;

          form?.setError(field, { message: reason });
        });
        return;
      }

      message.error(toErrorMessage(error));
    }
  },
};
