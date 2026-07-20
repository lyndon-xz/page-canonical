import { createSelector } from "@reduxjs/toolkit";
import { useForm } from "react-hook-form";

import type { BookingForm } from "../../shared/types";
import { selectPageState, useAppSelector } from "../../store";

const DEFAULT_BOOKING: BookingForm = {
  passengerName: "",
  idNumber: "",
  contactPhone: "",
};

/**
 * 单一 model selector：从页面切片派生「所选航班 + 预订提交态」。
 * 表单实例本身是活对象、不进 store，故由 hook 用 useForm 创建后与派生态一并暴露。
 */
export const selectBookingFormModel = createSelector(
  selectPageState,
  (page) => {
    const selectedFlight =
      page.flightList.find((flight) => flight.id === page.selectedFlightId) ??
      null;

    return {
      selectedFlight,
      isSubmitting: page.isSubmittingBooking,
      submitError: page.bookingError,
      submitted: page.bookingSubmitted,
    };
  },
);

/** 统一入口 hook：本模块创建 useForm 活对象 + 从 store 派生所选航班与提交态 */
export function useBookingFormModel() {
  const form = useForm<BookingForm>({
    defaultValues: DEFAULT_BOOKING,
    mode: "onTouched",
  });
  const derived = useAppSelector(selectBookingFormModel);

  return { form, ...derived };
}
