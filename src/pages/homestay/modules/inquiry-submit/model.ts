import { createSelector } from "@reduxjs/toolkit";
import { useFormContext } from "react-hook-form";

import type { InquiryForm } from "../../shared/types";
import { selectPageState, useAppSelector } from "../../store";

const selectInquirySubmitState = createSelector(selectPageState, (page) => {
  const { isSubmittingInquiry, inquiryError, inquirySubmitted } = page;

  return { isSubmittingInquiry, inquiryError, inquirySubmitted };
});

export function useInquirySubmitModel() {
  const { handleSubmit } = useFormContext<InquiryForm>();
  const submitState = useAppSelector(selectInquirySubmitState);

  return { handleSubmit, ...submitState };
}
