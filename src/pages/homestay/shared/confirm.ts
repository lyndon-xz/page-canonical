export enum ConfirmScene {
  RemoveFavorite = "removeFavorite",
  CancelInquiry = "cancelInquiry",
}

/**
 * 待确认的操作。目标房源随场景一起进来，不借道选中态——
 * 借道会让「弹窗要处理谁」与「详情区在看谁」共用一个字段，改一个必然动另一个。
 */
export type ConfirmRequest =
  | { scene: ConfirmScene.RemoveFavorite; listingId: string }
  | { scene: ConfirmScene.CancelInquiry };
