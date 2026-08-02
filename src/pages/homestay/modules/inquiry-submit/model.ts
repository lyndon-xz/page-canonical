import { useFormContext } from "react-hook-form";

import { PageStore } from "../../store";
import type { InquiryForm } from "../../shared/types";

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
