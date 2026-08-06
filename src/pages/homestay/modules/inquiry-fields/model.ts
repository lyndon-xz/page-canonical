import { useFormContext } from "react-hook-form";
import { shallowEqual } from "react-redux";

import type { InquiryForm } from "../../shared/inquiry";
import { selectSelectedListing, useAppSelector } from "../../store";

export function useInquiryFieldsModel() {
  const { control, formState } = useFormContext<InquiryForm>();
  const { listing, hasSubmittedInquiry } = useAppSelector(
    (s) => ({
      listing: selectSelectedListing(s),
      hasSubmittedInquiry: !!s.page.submittedInquiry,
    }),
    shallowEqual,
  );

  return {
    control,
    errors: formState.errors,
    listing,
    hasSubmittedInquiry,
  };
}
