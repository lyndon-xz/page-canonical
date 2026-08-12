/** 把 catch 到的未知值转成可展示的错误文案 */
export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
