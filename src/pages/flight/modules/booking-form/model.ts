import { useForm } from "react-hook-form";

import type { BookingForm } from "../../shared/types";
import { PageStore } from "../../store";

export function useBookingFormModel() {
  const form = useForm<BookingForm>({
    defaultValues: { passengerName: "", idNumber: "", contactPhone: "" },
    mode: "onTouched",
  });

  const {
    isBookingAllowed,
    selectedFlight,
    isSubmittingBooking,
    bookingSubmitted,
  } = PageStore.useContainer();

  return {
    form,
    isVisible: isBookingAllowed,
    selectedFlight,
    isSubmitting: isSubmittingBooking,
    submitted: bookingSubmitted,
  };
}
