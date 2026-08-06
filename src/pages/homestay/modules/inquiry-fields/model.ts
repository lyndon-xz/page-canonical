import { useFormContext } from "react-hook-form";
import { shallowEqual } from "react-redux";

import type { InquiryForm } from "../../shared/inquiry";
import { selectSelectedListing, useAppSelector } from "../../store";

/** 暴露 control 而非 register：antd 控件是受控组件，只能经 Controller 接入 */
export function useInquiryFieldsModel() {
  const { control, formState } = useFormContext<InquiryForm>();
  const { listing, hasSubmittedInquiry } = useAppSelector(
    (s) => ({
      listing: selectSelectedListing(s),
      hasSubmittedInquiry: !!s.page.submittedInquiry,
    }),
    shallowEqual,
  );

  return { control, errors: formState.errors, listing, hasSubmittedInquiry };
}
