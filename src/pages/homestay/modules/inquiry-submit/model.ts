import { createSelector } from "@reduxjs/toolkit";
import { useFormContext } from "react-hook-form";

import type { InquiryForm } from "../../shared/types";
import { selectPageState, useAppSelector } from "../../store";

const selectInquirySubmitState = createSelector(selectPageState, (page) => {
  const { selectedListingId, isSubmittingInquiry, submittedInquiryId } = page;

  return {
    hasInquiryListing: !!selectedListingId,
    isSubmittingInquiry,
    // id 本身不上界面，UI 只关心有没有可撤回的询价
    hasSubmittedInquiry: !!submittedInquiryId,
  };
});

export function useInquirySubmitModel() {
  const { handleSubmit } = useFormContext<InquiryForm>();
  const submitState = useAppSelector(selectInquirySubmitState);

  return { handleSubmit, ...submitState };
}
