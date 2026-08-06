import { useEffect } from "react";

import { pageActions } from "./actions";

const { initPage } = pageActions;

export function usePageEffects() {
  useEffect(() => {
    void initPage();
  }, []);
}
