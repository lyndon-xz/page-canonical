import { useState } from "react";
import { createContainer } from "unstated-next";

import type { Listing, ListingFilters } from "./shared/types";

const DEFAULT_FILTERS: ListingFilters = { keyword: "", roomType: "" };

function usePageStoreHook() {
  const [listingList, setListingList] = useState<Listing[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<Error | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null,
  );
  const [appliedFilters, setAppliedFilters] =
    useState<ListingFilters>(DEFAULT_FILTERS);

  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState<Error | null>(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  return {
    listingList,
    setListingList,
    isLoadingList,
    setIsLoadingList,
    listError,
    setListError,
    selectedListingId,
    setSelectedListingId,
    appliedFilters,
    setAppliedFilters,
    isSubmittingInquiry,
    setIsSubmittingInquiry,
    inquiryError,
    setInquiryError,
    inquirySubmitted,
    setInquirySubmitted,
  };
}

export const PageStore = createContainer(usePageStoreHook);
