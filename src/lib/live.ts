import { useEffect } from "react";

/**
 * 按页面自己的 key→类型映射生成读写入口，让注册端与读取端受同一张表约束：
 * key 拼错、注册的值类型不对，都在编译期报错。
 *
 * 每次调用持有独立的存储，页面之间的 key 互不影响。
 * 仅适用于 CSR SPA；SSR 下需改为每请求实例化并经 Context 提供，避免跨请求串用。
 */
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
