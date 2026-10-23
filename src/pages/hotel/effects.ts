import { useLayoutEffect } from 'react';

import { FetchStatus } from '@/constants/fetch-status';

import { pageActions } from './actions';
import { usePageStore } from './store';

const { initPage } = pageActions;

export function usePageEffects() {
  useLayoutEffect(() => {
    const { resetResultSet, setHotelsStatus } = usePageStore.getState();

    resetResultSet();
    setHotelsStatus(FetchStatus.Loading);
    void initPage();
  }, []);
}
