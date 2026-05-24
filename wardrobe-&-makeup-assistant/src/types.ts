export interface ClothingItem {
  id: string;
  name: string;
  image: string; // URL or local data url
  category: string; // "上装" | "下装" | "外套" | "鞋履" | "包袋" | "饰品"
  price: number;
  brand: string;
  color: string;
  season: string; // "春" | "夏" | "秋" | "冬" | "四季"
  size: string;
  wearCount: number;
  warmth: number; // 衣服冷暖值: 1(极致冷/薄) - 10(温暖/极厚)
  registerDate: string;
}

export interface DragPlacement {
  itemId: string;
  type: "clothing" | "cosmetic" | "photo";
  x: number; // percentage of canvas (0 to 100)
  y: number; // percentage of canvas (0 to 100)
  scale: number; // zoom size factor (0.5 to 2.0)
  rotate: number; // degrees
}

export interface OutfitScheme {
  id: string;
  name: string;
  rationale: string;
  scene?: string; // 场景分类: 日常/办公/聚会/约会/运动
  itemIds: string[]; // references of ClothingItem
  makeupLookId?: string; // reference to MakeupLook
  background: {
    type: "color" | "scenery";
    value: string; // grid pattern, solid hex, gradient or unspash link
  };
  placements?: DragPlacement[]; // placement mapping on interactive board
  wearCount: number; // custom wear stats for outfit
}

export interface CosmeticItem {
  id: string;
  name: string;
  image: string;
  brand: string;
  category: "眼妆" | "鼻影" | "修容" | "高光" | "口红" | "粉底" | "其他";
  shade: string; // 色号
  usableDays: number; // 可用总天数
  remainingDays: number; // 剩余可用天数
  registerDate: string;
}

export interface MakeupLook {
  id: string;
  name: string;
  image: string;
  description: string;
  cosmeticsUsed: {
    [key in "眼妆" | "鼻影" | "修容" | "高光" | "口红" | "粉底" | "其他"]?: string; // Name/shade of the item used
  };
  cosmeticIds: string[]; // active linking ids
}

export interface CalendarDayPlan {
  date: string; // YYYY-MM-DD
  outfitId?: string; // primary matching outfit ID
  customItemIds?: string[]; // alternative individual item sets
  activities: string[]; // schedule lists
}
