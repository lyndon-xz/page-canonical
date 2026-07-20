import { useFormContext } from "react-hook-form";

import { PageStore } from "../../store";
import type { InquiryForm } from "../../shared/types";

/**
 * 模块 model：经 useFormContext 取共享表单的 handleSubmit，
 * 并从页面 store 透传提交态（isSubmittingInquiry / inquiryError / inquirySubmitted），
 * 使 UI 只消费本模块 model。
 */
export function useInquirySubmitModel() {
  const { handleSubmit } = useFormContext<InquiryForm>();
  const { isSubmittingInquiry, inquiryError, inquirySubmitted } =
    PageStore.useContainer();

  return {
    handleSubmit,
    isSubmittingInquiry,
    inquiryError,
    inquirySubmitted,
  };
}
