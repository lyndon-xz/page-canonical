import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import type { BookingForm } from "../../shared/booking";
import { usePageStore } from "../../store";

export function useBookingFormEffects(form: UseFormReturn<BookingForm>) {
  const contact = usePageStore(
    useShallow((s) => ({
      guestName: s.contact.guestName,
      phone: s.contact.phone,
    })),
  );

  useEffect(() => {
    const { guestName, phone } = contact;
    const { getValues, setValue } = form;

    if (getValues("guestName") === "") {
      setValue("guestName", guestName);
    }
    if (getValues("phone") === "") {
      setValue("phone", phone);
    }
  }, [contact, form]);
}
