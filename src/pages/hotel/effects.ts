import { useEffect } from "react";

import { pageActions } from "./actions";

export function usePageEffects() {
  useEffect(() => {
    void pageActions.initPage();
  }, []);
}
