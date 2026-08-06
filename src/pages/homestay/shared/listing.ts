/** 房型的单一来源：房源字段与 URL 校验都由此派生 */
export const ROOM_TYPE_VALUES = ["整套", "单间", "合住"] as const;

export type RoomType = (typeof ROOM_TYPE_VALUES)[number];

export interface Listing {
  id: string;
  title: string;
  city: string;
  pricePerNight: number;
  rating: number;
  roomType: RoomType;
}

/** 比列表项多出的描述类字段，单独接口按需拉取 */
export interface ListingDetail {
  listingId: string;
  description: string;
  amenities: string[];
  hostName: string;
  cancellationPolicy: string;
}
