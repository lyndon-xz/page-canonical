import { useForm, useWatch } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { DEFAULT_CONTACT, type BookingForm } from "../../shared/booking";
import { usePageStore } from "../../store";

export function useBookingFormModel() {
  const form = useForm<BookingForm>({
    defaultValues: {
      ...DEFAULT_CONTACT,
      checkInDate: "",
      nights: 1,
      rooms: 1,
    } satisfies BookingForm,
    mode: "onTouched",
  });
  const { control } = form;
  const [nights, rooms] = useWatch({ control, name: ["nights", "rooms"] });
  const state = usePageStore(
    useShallow((s) => ({
      selectedHotel:
        s.hotels.find((hotel) => hotel.id === s.selectedHotelId) ?? null,
      isSubmittingBooking: s.isSubmittingBooking,
      bookedHotelId: s.bookedHotelId,
    })),
  );
  const { bookedHotelId, ...rest } = state;
  const { selectedHotel } = rest;
  const canCalculateTotal = selectedHotel !== null && nights > 0 && rooms > 0;

  return {
    form,
    ...rest,
    totalPrice: canCalculateTotal
      ? selectedHotel.pricePerNight * nights * rooms
      : null,
    hasSubmittedBooking:
      selectedHotel !== null && bookedHotelId === selectedHotel.id,
  };
}
