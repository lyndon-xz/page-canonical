import { useForm, useWatch } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import type { BookingForm } from "../../shared/booking";
import { usePageStore } from "../../store";

export function useBookingFormModel() {
  const form = useForm<BookingForm>({
    // useForm 的泛型不要求 defaultValues 写全，satisfies 才校验字段完整
    defaultValues: {
      guestName: "",
      phone: "",
      checkInDate: "",
      nights: 1,
      rooms: 1,
    } satisfies BookingForm,
    mode: "onTouched",
  });
  const { control } = form;
  // 用 useWatch 而非 watch：只订阅参与总价的这两个字段，填联系人不必重渲染整个模块
  const [nights, rooms] = useWatch({ control, name: ["nights", "rooms"] });
  const state = usePageStore(
    useShallow((s) => ({
      // 只有本模块消费这份派生，故留在模块 model 里，不提到页面层
      selectedHotel:
        s.hotels.find((hotel) => hotel.id === s.selectedHotelId) ?? null,
      isSubmittingBooking: s.isSubmittingBooking,
      bookedHotelId: s.bookedHotelId,
    })),
  );
  // 已订的 id 只作为 bookingSubmitted 的原料，不进 UI
  const { bookedHotelId, ...rest } = state;
  const { selectedHotel } = rest;

  return {
    form,
    ...rest,
    // 输入框可以被清空，此时不给总价：0 会被读成免费
    totalPrice:
      selectedHotel && nights && rooms
        ? selectedHotel.pricePerNight * nights * rooms
        : null,
    // 成功提示只对当前选中的那家成立，换选或换结果集后自然消失
    bookingSubmitted:
      selectedHotel !== null && bookedHotelId === selectedHotel.id,
  };
}
