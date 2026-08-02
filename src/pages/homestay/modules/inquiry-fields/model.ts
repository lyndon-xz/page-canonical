import { useFormContext } from "react-hook-form";

import type { InquiryForm } from "../../shared/types";

/** 暴露 control 而非 register：antd 控件是受控组件，只能经 Controller 接入 */
export function useInquiryFieldsModel() {
  const { control, formState } = useFormContext<InquiryForm>();

  return { control, errors: formState.errors };
}
