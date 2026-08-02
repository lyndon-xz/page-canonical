import { useEffect } from "react";

/** 仅适用于 CSR SPA；SSR 下需改为每请求实例化并经 Context 提供，避免跨请求串用。 */
class LiveStore {
  private map = new Map<string, unknown>();

  register<T>(key: string, value: T) {
    this.map.set(key, value);
  }

  unregister(key: string) {
    this.map.delete(key);
  }

  get<T>(key: string): T | undefined {
    return this.map.get(key) as T | undefined;
  }
}

export const liveStore = new LiveStore();

export function useRegisterLive<T>(key: string, value: T) {
  useEffect(() => {
    liveStore.register(key, value);

    return () => liveStore.unregister(key);
  }, [key, value]);
}
