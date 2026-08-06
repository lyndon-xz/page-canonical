/** 批量收藏里单项的失败原因 */
export interface BatchFavoriteFailure {
  hotelId: string;
  reason: string;
}

export interface BatchFavoriteResult {
  succeededIds: string[];
  failures: BatchFavoriteFailure[];
}
