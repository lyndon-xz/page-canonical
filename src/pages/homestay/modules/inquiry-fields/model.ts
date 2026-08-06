import { createSelector } from "@reduxjs/toolkit";
import { useFormContext } from "react-hook-form";
import { shallowEqual } from "react-redux";

import type { InquiryForm } from "../../shared/inquiry";
import { selectListings, useAppSelector, type RootState } from "../../store";

// 询价对象取列表项：标题价格都在那儿，详情接口只有描述类字段
const selectInquiryListing = createSelector(
  selectListings,
  (state: RootState) => state.page.selectedListingId,
  (listings, selectedListingId) =>
    listings.find((listing) => listing.id === selectedListingId) ?? null,
);

/** 暴露 control 而非 register：antd 控件是受控组件，只能经 Controller 接入 */
export function useInquiryFieldsModel() {
  const { control, formState } = useFormContext<InquiryForm>();
  const { listing, hasSubmittedInquiry } = useAppSelector(
    (s) => ({
      listing: selectInquiryListing(s),
      hasSubmittedInquiry: !!s.page.submittedInquiry,
    }),
    shallowEqual,
  );

  return { control, errors: formState.errors, listing, hasSubmittedInquiry };
}
