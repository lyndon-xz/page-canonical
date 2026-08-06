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

export interface ListingDetail {
  listingId: string;
  description: string;
  amenities: string[];
  hostName: string;
  cancellationPolicy: string;
}
