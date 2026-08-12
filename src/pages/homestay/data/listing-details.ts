import type { ListingDetail } from "../shared/listing";

export const MOCK_LISTING_DETAILS: Record<string, ListingDetail> = {
  l1: {
    listingId: "l1",
    description:
      "西湖步行十分钟，上下两层的原木复式整套。二楼有张朝湖的书桌，早晚都能听见鸟叫。",
    amenities: ["西湖步行可达", "原木复式", "洗衣机", "厨房"],
    hostName: "沈阿姨",
    cancellationPolicy: "入住前 7 天可全额退款，7 天内退 50%。",
  },
  l2: {
    listingId: "l2",
    description:
      "大理古城边的白族小院，二楼单间推窗就是洱海。清晨常有雾气从水面升起。",
    amenities: ["洱海景观", "独立卫浴", "院子躺椅", "早餐"],
    hostName: "老陈",
    cancellationPolicy: "入住前 3 天可全额退款，3 天内不可退。",
  },
  l3: {
    listingId: "l3",
    description:
      "曾厝垵巷子里的青旅式合住，六人间。楼下就是公共厨房和桌游区，方便认识人。",
    amenities: ["公共厨房", "储物柜", "桌游区"],
    hostName: "阿树",
    cancellationPolicy: "随时可退，扣除一晚房费作为手续费。",
  },
  l4: {
    listingId: "l4",
    description:
      "宽窄巷子步行十分钟的川西庭院，整套两进院子。天井里摆了茶桌，午后适合坐着喝茶。",
    amenities: ["川西庭院", "天井茶桌", "中央空调", "洗碗机"],
    hostName: "Vivian",
    cancellationPolicy: "入住前 14 天可全额退款，14 天内退 30%。",
  },
  l5: {
    listingId: "l5",
    description:
      "束河古镇的临街单间，天气好时从窗口能看到玉龙雪山。楼下是书店和咖啡馆。",
    amenities: ["雪山视野", "独立卫浴", "书桌", "咖啡机"],
    hostName: "小林",
    cancellationPolicy: "入住前 1 天可全额退款。",
  },
  l6: {
    listingId: "l6",
    description:
      "八大关的老洋房整套，二层带花园。上世纪三十年代的德式建筑，木地板保留着原样。",
    amenities: ["老洋房花园", "壁炉", "手冲咖啡", "自行车"],
    hostName: "阿念",
    cancellationPolicy: "入住前 7 天可全额退款，7 天内退 50%。",
  },
  l7: {
    listingId: "l7",
    description:
      "遇龙河边的稻田民宿，合住四人间。清早推门就是稻田与喀斯特山峰，可以借自行车沿河骑。",
    amenities: ["稻田景观", "公共厨房", "自行车", "烧烤炉"],
    hostName: "老周",
    cancellationPolicy: "入住前 5 天可全额退款，5 天内不可退。",
  },
};
