import { useFormContext } from "react-hook-form";
import { shallowEqual } from "react-redux";

import type { InquiryForm } from "../../shared/inquiry";
import { useAppSelector } from "../../store";

export function useInquirySubmitModel() {
  const { handleSubmit } = useFormContext<InquiryForm>();
  const submitState = useAppSelector(
    (s) => ({
      hasInquiryListing: !!s.page.selectedListingId,
      isSubmittingInquiry: s.page.isSubmittingInquiry,
      submittedInquiry: s.page.submittedInquiry,
    }),
    shallowEqual,
  );

  return { handleSubmit, ...submitState };
}
