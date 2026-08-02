import { createSelector } from "@reduxjs/toolkit";
import { useForm } from "react-hook-form";

import type { BookingForm } from "../../shared/types";
import { selectPageState, useAppSelector } from "../../store";

const DEFAULT_BOOKING: BookingForm = {
  passengerName: "",
  idNumber: "",
  contactPhone: "",
};

const selectBookingFormModel = createSelector(selectPageState, (page) => {
  const selectedFlight =
    page.flightList.find((flight) => flight.id === page.selectedFlightId) ??
    null;

  return {
    selectedFlight,
    isSubmitting: page.isSubmittingBooking,
    submitError: page.bookingError,
    submitted: page.bookingSubmitted,
  };
});

export function useBookingFormModel() {
  const form = useForm<BookingForm>({
    defaultValues: DEFAULT_BOOKING,
    mode: "onTouched",
  });
  const derived = useAppSelector(selectBookingFormModel);

  return { form, ...derived };
}
