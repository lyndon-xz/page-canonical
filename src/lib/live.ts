import { useEffect } from "react";

export function createPageLive<M extends object>() {
  const store: Partial<M> = {};

  const useRegisterLive = <K extends keyof M & string>(key: K, value: M[K]) => {
    useEffect(() => {
      store[key] = value;

      return () => {
        delete store[key];
      };
    }, [key, value]);
  };

  const getLive = <K extends keyof M & string>(key: K): M[K] | undefined =>
    store[key];

  return {
    useRegisterLive,
    getLive,
  };
}
