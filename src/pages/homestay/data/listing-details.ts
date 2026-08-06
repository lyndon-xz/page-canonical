import type { ListingDetail } from "../shared/listing";

export const MOCK_LISTING_DETAILS: Record<string, ListingDetail> = {
  l1: {
    listingId: "l1",
    description:
      "老城区石库门改造，二层带独立小院。步行五分钟到早点铺，巷口有夜宵摊。",
    amenities: ["独立小院", "洗衣机", "投影仪", "厨房"],
    hostName: "沈阿姨",
    cancellationPolicy: "入住前 7 天可全额退款，7 天内退 50%。",
  },
  l2: {
    listingId: "l2",
    description: "湖景落地窗，清晨能看到雾气从水面升起。适合两人安静住几天。",
    amenities: ["湖景", "地暖", "浴缸", "早餐"],
    hostName: "老陈",
    cancellationPolicy: "入住前 3 天可全额退款，3 天内不可退。",
  },
  l3: {
    listingId: "l3",
    description: "青旅式合住，六人间。楼下就是公共厨房和桌游区，方便认识人。",
    amenities: ["公共厨房", "储物柜", "桌游区"],
    hostName: "阿树",
    cancellationPolicy: "随时可退，扣除一晚房费作为手续费。",
  },
  l4: {
    listingId: "l4",
    description: "顶层复式，露台可以看城市天际线。夏天晚上很适合坐着吹风。",
    amenities: ["露台", "中央空调", "洗碗机", "健身房"],
    hostName: "Vivian",
    cancellationPolicy: "入住前 14 天可全额退款，14 天内退 30%。",
  },
  l5: {
    listingId: "l5",
    description: "临街单间，楼下是书店和咖啡馆。隔音一般，但位置极好。",
    amenities: ["独立卫浴", "书桌", "咖啡机"],
    hostName: "小林",
    cancellationPolicy: "入住前 1 天可全额退款。",
  },
  l6: {
    listingId: "l6",
    description: "民宿主自己设计的一栋小房子，木结构，屋后有片竹林。",
    amenities: ["竹林庭院", "壁炉", "手冲咖啡", "自行车"],
    hostName: "阿念",
    cancellationPolicy: "入住前 7 天可全额退款，7 天内退 50%。",
  },
  l7: {
    listingId: "l7",
    description: "海边整套两居，从阳台能直接看到潮水。步行到沙滩三分钟。",
    amenities: ["海景阳台", "烧烤炉", "冲浪板", "停车位"],
    hostName: "老周",
    cancellationPolicy: "入住前 5 天可全额退款，5 天内不可退。",
  },
};
