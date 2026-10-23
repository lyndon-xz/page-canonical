import { useLayoutEffect } from 'react';

import { usePageStore } from '../../store';

import { useSearchFilterLocal } from './model';

export function useSearchFilterEffects() {
  const keyword = usePageStore((s) => s.appliedParams.keyword);

  useLayoutEffect(() => {
    useSearchFilterLocal.getState().setKeyword(keyword);
  }, [keyword]);
}
