import { useEffect } from "react";

/**
 * 按页面的 key→类型映射约束注册端与读取端，key 或值类型写错在编译期报错。
 *
 * 仅适用于 CSR SPA：这个 Map 是模块级的，SSR 下需改为每请求实例化并经 Context 提供。
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
