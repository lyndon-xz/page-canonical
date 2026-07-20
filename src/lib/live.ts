import { useEffect } from "react";

/**
 * 活对象层（liveStore）：受管控的引用容器，独立于状态库、独立于 store 的可序列化 state 树。
 * 结构化数据放 store、getState 读；非结构化活对象（useForm 返回值、DOM ref、命令式句柄、
 * 地图/播放器实例等）放 liveStore、getLive 读。两层对称，活对象无需专门的传递流程。
 *
 * 仅适用于 CSR SPA；SSR 下需每请求实例化并经 Context 提供，避免跨请求串用。
 */
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

/**
 * 把活对象生命周期绑定到组件：挂载登记、卸载注销。
 * 这一对 register / unregister 是活对象层成立的硬约束——杜绝脏引用。
 */
export function useRegisterLive<T>(key: string, value: T) {
  useEffect(() => {
    liveStore.register(key, value);

    return () => liveStore.unregister(key);
  }, [key, value]);
}
