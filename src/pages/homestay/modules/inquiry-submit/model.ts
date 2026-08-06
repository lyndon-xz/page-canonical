import { useFormContext } from "react-hook-form";
import { shallowEqual } from "react-redux";

import type { InquiryForm } from "../../shared/inquiry";
import { useAppSelector } from "../../store";

export function useInquirySubmitModel() {
  const { handleSubmit } = useFormContext<InquiryForm>();
  const submitState = useAppSelector((s) => {
    const { selectedListingId, isSubmittingInquiry, submittedInquiry } = s.page;

    return {
      hasInquiryListing: !!selectedListingId,
      isSubmittingInquiry,
      submittedInquiry,
    };
  }, shallowEqual);

  return { handleSubmit, ...submitState };
}
