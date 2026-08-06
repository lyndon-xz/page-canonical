export interface BatchFavoriteFailure {
  hotelId: string;
  reason: string;
}

export interface BatchFavoriteResult {
  succeededIds: string[];
  failures: BatchFavoriteFailure[];
}
