import { useForm } from "react-hook-form";

import type { BookingForm } from "../../shared/types";
import { PageStore } from "../../store";

const DEFAULT_BOOKING: BookingForm = {
  passengerName: "",
  idNumber: "",
  contactPhone: "",
};

export function useBookingFormModel() {
  const form = useForm<BookingForm>({
    defaultValues: DEFAULT_BOOKING,
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
