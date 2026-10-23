import type { UseFormReturn } from 'react-hook-form';

import { createPageLive } from '@/utils/live';

import type { InquiryForm } from './shared/inquiry';

interface PageLiveMap {
  inquiryForm: UseFormReturn<InquiryForm>;
}

export const { useRegisterLive, getLive } = createPageLive<PageLiveMap>();
