export enum ConfirmScene {
  RemoveFavorite = "removeFavorite",
  CancelInquiry = "cancelInquiry",
}

export type ConfirmRequest =
  | { scene: ConfirmScene.RemoveFavorite; listingId: string }
  | { scene: ConfirmScene.CancelInquiry };
