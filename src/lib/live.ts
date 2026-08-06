import { useEffect } from "react";

export function createPageLive<M extends object>() {
  const store = new Map<keyof M, unknown>();

  const useRegisterLive = <K extends keyof M & string>(key: K, value: M[K]) => {
    useEffect(() => {
      store.set(key, value);

      return () => {
        store.delete(key);
      };
    }, [key, value]);
  };

  const getLive = <K extends keyof M & string>(key: K) =>
    store.get(key) as M[K] | undefined;

  return {
    useRegisterLive,
    getLive,
  };
}
