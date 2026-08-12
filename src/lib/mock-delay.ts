const MOCK_DELAY_MS = 300;

/** mock 服务统一的模拟网络耗时 */
export function mockDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}
