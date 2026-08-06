export interface Hotel {
  id: string;
  name: string;
  city: string;
  pricePerNight: number;
  rating: number;
  star: number;
  distanceKm: number;
}

export interface HotelPage {
  items: Hotel[];
  hasMore: boolean;
  total: number;
}
