import { ClothingItem, CosmeticItem, MakeupLook, OutfitScheme, CalendarDayPlan } from "./types";

export const INITIAL_CLOTHING: ClothingItem[] = [
  {
    id: "c1",
    name: "海盐蓝天丝衬衫",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "上装",
    price: 329,
    brand: "ZARA",
    color: "海蓝色",
    season: "春",
    size: "S",
    wearCount: 4,
    warmth: 3,
    registerDate: "2026-03-10"
  },
  {
    id: "c2",
    name: "烟砂驼色羊绒大衣",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "外套",
    price: 1899,
    brand: "Massimo Dutti",
    color: "驼色",
    season: "冬",
    size: "M",
    wearCount: 1,
    warmth: 9,
    registerDate: "2025-11-15"
  },
  {
    id: "c3",
    name: "高腰复古水洗牛仔裤",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "下装",
    price: 499,
    brand: "Levi's",
    color: "经典蓝",
    season: "四季",
    size: "27",
    wearCount: 8,
    warmth: 5,
    registerDate: "2025-09-01"
  },
  {
    id: "c4",
    name: "米白色软糯羊毛粗针毛衣",
    image: "https://images.unsplash.com/photo-1574164904299-3a102b110380?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "上装",
    price: 399,
    brand: "UNIQLO",
    color: "米色",
    season: "秋",
    size: "M",
    wearCount: 6,
    warmth: 8,
    registerDate: "2025-10-20"
  },
  {
    id: "c5",
    name: "极简垂坠黑色西装阔腿裤",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "下装",
    price: 520,
    brand: "UR",
    color: "黑色",
    season: "春",
    size: "M",
    wearCount: 3,
    warmth: 4,
    registerDate: "2026-02-28"
  },
  {
    id: "c6",
    name: "英伦雕花黑色马丁靴",
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "鞋履",
    price: 1299,
    brand: "Dr.Martens",
    color: "棕黑色",
    season: "冬",
    size: "37",
    wearCount: 5,
    warmth: 7,
    registerDate: "2025-11-01"
  },
  {
    id: "c7",
    name: "奶油皮复古金色包袋",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    category: "包袋",
    price: 1580,
    brand: "COACH",
    color: "象牙白",
    season: "四季",
    size: "中号",
    wearCount: 9,
    warmth: 2,
    registerDate: "2025-05-18"
  }
];

export const INITIAL_COSMETICS: CosmeticItem[] = [
  {
    id: "co1",
    name: "香奈儿光影四色眼影 #308",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    brand: "CHANEL",
    category: "眼妆",
    shade: "308 哑光深大地",
    usableDays: 365,
    remainingDays: 240,
    registerDate: "2025-10-01"
  },
  {
    id: "co2",
    name: "迪奥传奇红唇丝绒 #999",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    brand: "Dior",
    category: "口红",
    shade: "999 传奇正红（丝绒）",
    usableDays: 180,
    remainingDays: 145,
    registerDate: "2026-01-10"
  },
  {
    id: "co3",
    name: "M.A.C Double Gleam 生姜高光",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    brand: "M.A.C",
    category: "高光",
    shade: "Double Gleam 香槟金闪",
    usableDays: 500,
    remainingDays: 420,
    registerDate: "2025-08-01"
  },
  {
    id: "co4",
    name: "毛戈平光影塑颜无痕修容膏",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    brand: "毛戈平",
    category: "修容",
    shade: "01 自然影灰",
    usableDays: 240,
    remainingDays: 180,
    registerDate: "2025-11-20"
  },
  {
    id: "co5",
    name: "雅诗兰黛DW持妆粉底液",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    brand: "Estee Lauder",
    category: "粉底",
    shade: "1C1 象牙白",
    usableDays: 120,
    remainingDays: 60,
    registerDate: "2026-02-05"
  }
];

export const INITIAL_MAKEUP_LOOKS: MakeupLook[] = [
  {
    id: "ml1",
    name: "法式清冷低饱奶茶妆",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "高级感十足的亚光清冷系妆容，适合初夏和办公室差旅。",
    cosmeticsUsed: {
      "眼妆": "香奈儿光影四色眼影 #308 (消肿深邃)",
      "口红": "橘粉奶茶唇蜜 + 迪奥传奇 #999（点涂薄咬唇）",
      "粉底": "雅诗兰黛DW #1C1 (清透持久亚光面感)",
      "高光": "M.A.C 生姜高光 (微打颧骨及鼻尖)",
      "修容": "毛戈平修容膏 01 (勾勒下颚阴影)"
    },
    cosmeticIds: ["co1", "co2", "co3", "co4", "co5"]
  },
  {
    id: "ml2",
    name: "明艳轻熟派璀璨红唇妆",
    image: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    description: "全场的绝对核心。强调气场十足的正红丝绒唇，及干净挺拔的轮廓线。",
    cosmeticsUsed: {
      "口红": "迪奥传奇丝绒 #999 (饱满厚度)",
      "粉底": "雅诗兰黛DW #1C1 (极致雾面瑕疵遮盖)",
      "高光": "M.A.C 生姜高光 (饱满眉中及唇峰)"
    },
    cosmeticIds: ["co2", "co3", "co5"]
  }
];

export const INITIAL_OUTFITS: OutfitScheme[] = [
  {
    id: "o1",
    name: "清晨海风温性衬衫装",
    rationale: "微暖色和清凉的海盐衬衫搭配，中和了商务西裤的严肃感。搭配高复古水洗牛仔裤和奶油风皮包，适合日常通勤与咖啡馆散步。",
    itemIds: ["c1", "c3", "c7"],
    makeupLookId: "ml1",
    background: {
      type: "color",
      value: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    },
    wearCount: 3,
    placements: [
      { itemId: "c1", type: "clothing", x: 20, y: 15, scale: 1.1, rotate: -5 },
      { itemId: "c3", type: "clothing", x: 60, y: 20, scale: 1.05, rotate: 2 },
      { itemId: "c7", type: "clothing", x: 40, y: 60, scale: 0.9, rotate: 10 }
    ]
  },
  {
    id: "o2",
    name: "都市名媛温绒御寒穿搭",
    rationale: "针对寒冷或阴雨气候，超强隔绝寒冷的驼绒大衣配上马丁靴，内部以米白色粗针毛衣打底，高级又有层次美感。",
    itemIds: ["c2", "c4", "c6", "c7"],
    makeupLookId: "ml2",
    background: {
      type: "color",
      value: "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)"
    },
    wearCount: 1,
    placements: [
      { itemId: "c2", type: "clothing", x: 25, y: 10, scale: 1.2, rotate: 0 },
      { itemId: "c4", type: "clothing", x: 65, y: 15, scale: 0.95, rotate: -3 },
      { itemId: "c6", type: "clothing", x: 30, y: 55, scale: 0.9, rotate: 8 },
      { itemId: "c7", type: "clothing", x: 68, y: 55, scale: 0.85, rotate: -5 }
    ]
  }
];

export const INITIAL_CALENDAR: CalendarDayPlan[] = [
  {
    date: "2026-05-18",
    outfitId: "o1",
    activities: ["外勤洽谈", "闺蜜下午茶"]
  },
  {
    date: "2026-05-20", // Matches the mock prompt current date
    outfitId: "o1",
    activities: ["日常通勤", "晚上面试与汇报总结"]
  },
  {
    date: "2026-05-22",
    outfitId: "o2",
    activities: ["周末差旅", "晚上高级名优鸡尾酒会"]
  }
];
