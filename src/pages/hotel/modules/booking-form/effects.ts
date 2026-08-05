import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import type { BookingForm } from "../../shared/types";
import { usePageStore } from "../../store";

/**
 * 把落盘的常用联系人回填进表单。
 *
 * 不写进 useForm 的 defaultValues：那只在挂载时读一次，storage 换成异步实现后
 * 恢复会晚于挂载，读一次的写法就跟不上，用户看不到自己的常用联系人。
 */
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

    // 只填还空着的框：恢复晚于挂载时，不能把用户已经输入的内容顶掉
    if (getValues("guestName") === "") {
      setValue("guestName", guestName);
    }
    if (getValues("phone") === "") {
      setValue("phone", phone);
    }
  }, [contact, form]);
}
