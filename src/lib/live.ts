import { useEffect } from "react";

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

/** 仅适用于 CSR SPA；SSR 下需改为每请求实例化并经 Context 提供，避免跨请求串用。 */
const liveStore = new LiveStore();

function useRegisterLiveValue<T>(key: string, value: T) {
  useEffect(() => {
    liveStore.register(key, value);

    return () => liveStore.unregister(key);
  }, [key, value]);
}

/**
 * 按页面自己的 key→类型映射生成读写入口，让注册端与读取端受同一张表约束：
 * key 拼错、注册的值类型不对，都在编译期报错。
 */
export function createPageLive<M extends object>() {
  const useRegisterLive = <K extends keyof M & string>(key: K, value: M[K]) =>
    useRegisterLiveValue(key, value);

  const getLive = <K extends keyof M & string>(key: K) =>
    liveStore.get<M[K]>(key);

  return {
    useRegisterLive,
    getLive,
  };
}
