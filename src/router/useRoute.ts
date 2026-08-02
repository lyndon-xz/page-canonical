import { useEffect, useState } from "react";

import { DEFAULT_PAGE, isPageKey, type PageKey } from "./routes";

function readPathPage(): PageKey {
  const segment =
    window.location.pathname.replace(/^\/+/, "").split("/")[0] ?? "";

  return isPageKey(segment) ? segment : DEFAULT_PAGE;
}

export function useRoute() {
  const [active, setActive] = useState<PageKey>(readPathPage);

  const navigate = (next: PageKey) => {
    window.history.pushState(null, "", `/${next}`);
    setActive(next);
  };

  useEffect(() => {
    const syncFromPath = () => setActive(readPathPage());
    window.addEventListener("popstate", syncFromPath);

    return () => window.removeEventListener("popstate", syncFromPath);
  }, []);

  return {
    active,
    navigate,
  };
}
