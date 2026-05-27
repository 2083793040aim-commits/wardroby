import { useState, ChangeEvent, FormEvent } from "react";
import { Search, Camera, Trash2, Edit3, ArrowUpDown, Plus, Loader2 } from "lucide-react";
import { ClothingItem } from "../types";

interface WardrobePageProps {
  clothing: ClothingItem[];
  onAddClothing: (item: ClothingItem) => void;
  onRemoveClothing: (id: string) => void;
}

const FASHION_PRESETS = [
  { name: "象牙白宽松西装", url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=60" },
  { name: "丝绒祖母绿吊带裙", url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60" },
  { name: "焦糖色针织开衫", url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60" },
  { name: "灰调垂坠抽绳裤", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60" },
  { name: "复古金扣乐福鞋", url: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500&auto=format&fit=crop&q=60" },
];

export default function WardrobePage({ clothing, onAddClothing, onRemoveClothing }: WardrobePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "wear-high" | "wear-low" | "none">("none");
  const [showAddForm, setShowAddForm] = useState(false);
  const [capturedImage, setCapturedImage] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("上装");
  const [newItemPrice, setNewItemPrice] = useState<number>(299);
  const [newItemBrand, setNewItemBrand] = useState("");
  const [newItemColor, setNewItemColor] = useState("");
  const [newItemSeason, setNewItemSeason] = useState("四季");
  const [newItemSize, setNewItemSize] = useState("M");
  const [newItemWarmth, setNewItemWarmth] = useState<number>(5);
  const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("couture_custom_categories");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { }
    }
    return ["上装", "下装", "外套", "鞋履", "包袋", "饰品"];
  });
  const [showEditCategoriesModal, setShowEditCategoriesModal] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");

  const categories = ["全部", ...customCategories];

  const handleSaveCategories = (nextCats: string[]) => {
    setCustomCategories(nextCats);
    localStorage.setItem("couture_custom_categories", JSON.stringify(nextCats));
  };

  const triggerCameraShot = () => {
    setCameraCountdown(3);
    const interval = setInterval(() => {
      setCameraCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          const randomPreset = FASHION_PRESETS[Math.floor(Math.random() * FASHION_PRESETS.length)];
          setCapturedImage(randomPreset.url);
          if (!newItemName) setNewItemName(randomPreset.name);
          setCameraCountdown(null);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 600);
  };

  const handleLocalImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRemovingBg(true);
    try {
      const { removeBackground: removeBg } = await import("@imgly/background-removal");
      const blob = await removeBg(file, {
        model: "isnet",
        output: { format: "image/png" },
      });
      const url = URL.createObjectURL(blob);
      setCapturedImage(url);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => setCapturedImage(reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleCreateClothing = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const finalImage = capturedImage || "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=60";
    const newItem: ClothingItem = {
      id: "clothing_" + Date.now(),
      name: newItemName,
      image: finalImage,
      category: newItemCategory,
      price: newItemPrice,
      brand: newItemBrand || "雅致定制",
      color: newItemColor || "经典色",
      season: newItemSeason,
      size: newItemSize || "自由尺码",
      wearCount: 0,
      warmth: newItemWarmth,
      registerDate: new Date().toISOString().split("T")[0],
    };
    onAddClothing(newItem);
    setNewItemName(""); setCapturedImage(""); setNewItemBrand(""); setNewItemColor("");
    setNewItemPrice(299); setNewItemWarmth(5); setShowAddForm(false);
  };

  const filteredClothing = clothing
    .filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || item.color.toLowerCase().includes(q);
      const matchCategory = selectedCategory === "全部" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "wear-high") return b.wearCount - a.wearCount;
      if (sortBy === "wear-low") return a.wearCount - b.wearCount;
      return 0;
    });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif italic font-semibold text-[#111111]">私享珍藏衣橱</h1>
          <p className="text-xs text-[#AAAAAA] mt-0.5">Personal Archive - {clothing.length} 件单品</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-[#EBEBEB] space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索名称、品牌、颜色..."
            className="w-full bg-[#F5F5F5] border border-[#EBEBEB] pl-10 pr-4 py-2.5 rounded-full text-xs placeholder-[#AAAAAA] focus:outline-none focus:border-[#111111] text-[#111111]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-xs rounded-full transition whitespace-nowrap font-medium ${
                selectedCategory === cat ? "bg-[#111111] text-white" : "bg-[#F5F5F5] text-[#777777] hover:bg-[#EBEBEB]"
              }`}
            >
              {cat}
            </button>
          ))}
          <button onClick={() => setShowEditCategoriesModal(true)} className="px-4 py-1.5 border border-dashed border-[#111111] text-[#111111] text-xs font-medium rounded-full flex items-center gap-1 whitespace-nowrap">
            <Edit3 className="w-3 h-3" />编辑
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#EBEBEB]">
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#AAAAAA]" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#F5F5F5] border-0 rounded-lg px-2.5 py-1 text-xs text-[#111111] focus:outline-none"
            >
              <option value="none">默认排序</option>
              <option value="price-asc">价格: 低→高</option>
              <option value="price-desc">价格: 高→低</option>
              <option value="wear-high">穿着: 多→少</option>
              <option value="wear-low">穿着: 少→多</option>
            </select>
          </div>
          {(searchQuery || selectedCategory !== "全部" || sortBy !== "none") && (
            <button onClick={() => { setSearchQuery(""); setSelectedCategory("全部"); setSortBy("none"); }} className="text-[10px] text-[#111111] font-semibold hover:underline">
              重置筛选
            </button>
          )}
        </div>
      </div>

      {/* List Header & Add Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#AAAAAA] uppercase tracking-wider">精品列表 ({filteredClothing.length})</span>
        <button
          onClick={() => { setShowAddForm(true); setCapturedImage(""); }}
          className="w-7 h-7 rounded-full border border-dashed border-[#AAAAAA] flex items-center justify-center text-[#AAAAAA] hover:border-[#111111] hover:text-[#111111] transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid */}
      {filteredClothing.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredClothing.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="aspect-[3/4] bg-[#F5F5F5] relative overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                <span className="absolute top-2 left-2 text-[8px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-[#111111]">{item.season}季 - {item.category}</span>
                <button onClick={() => onRemoveClothing(item.id)} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/30 text-white flex items-center justify-center text-[10px] hover:bg-[#C04040] transition shadow-sm">×</button>
              </div>
              <div className="p-3 space-y-1.5">
                <span className="text-[9px] text-[#AAAAAA] font-bold tracking-wide">{item.brand}</span>
                <h3 className="text-[11px] font-bold text-[#111111] leading-tight line-clamp-2">{item.name}</h3>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[11px] text-[#AAAAAA]">穿 {item.wearCount} 次</span>
                  <span className="text-[#AAAAAA] border border-[#EBEBEB] rounded-full px-1.5 py-0.5">{item.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#EBEBEB] space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6 text-[#AAAAAA]" />
          </div>
          <h3 className="text-sm font-semibold text-[#111111]">未找到匹配单品</h3>
          <p className="text-[11px] text-[#AAAAAA] max-w-xs mx-auto">调整筛选条件或录入新的时尚单品</p>
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#EBEBEB] max-w-md w-full p-5 max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#EBEBEB]">
              <div>
                <h3 className="text-sm font-serif italic font-semibold text-[#111111]">录入高级成衣</h3>
                <p className="text-[9px] text-[#AAAAAA]">Archive New Garment</p>
              </div>
              <button onClick={() => setShowAddForm(false)} className="w-6 h-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#777777]">x</button>
            </div>

            <form onSubmit={handleCreateClothing} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-[#777777] uppercase tracking-wider block mb-1">照片录入</label>
                {capturedImage ? (
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#EBEBEB]">
                    {isRemovingBg && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setCapturedImage("")} className="absolute bottom-2 right-2 bg-black/80 text-white text-[9px] px-2.5 py-1 rounded-full z-20">重新上传</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={triggerCameraShot} className="aspect-[4/3] bg-[#111111] text-white rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-black transition">
                      {cameraCountdown !== null ? (
                        <span className="text-2xl font-bold">{cameraCountdown}</span>
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-[#111111]" />
                          <span className="text-[10px] font-medium">模拟拍照</span>
                        </>
                      )}
                    </button>
                    <div className={`aspect-[4/3] border border-dashed rounded-xl bg-white flex flex-col items-center justify-center relative ${isRemovingBg ? "border-[#111111]" : "border-[#DDDDDD]"}`}>
                      <input type="file" accept="image/*" onChange={handleLocalImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isRemovingBg} />
                      {isRemovingBg ? (
                        <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
                      ) : (
                        <span className="text-[10px] text-[#777777]">本地照片</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-[#777777] block mb-1 uppercase tracking-wider">名称</label>
                  <input type="text" required value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="例如: 暖灰双排扣风衣" className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#111111]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#777777] block mb-1 uppercase tracking-wider">分类</label>
                  <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} className="w-full bg-white border border-[#EBEBEB] rounded-lg px-2.5 py-2 text-xs focus:outline-none">
                    {categories.slice(1).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#777777] block mb-1 uppercase tracking-wider">品牌</label>
                  <input type="text" value={newItemBrand} onChange={(e) => setNewItemBrand(e.target.value)} placeholder="Marni / Loro Piana" className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#111111]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#777777] block mb-1 uppercase tracking-wider">色系</label>
                  <input type="text" value={newItemColor} onChange={(e) => setNewItemColor(e.target.value)} placeholder="燕麦浅驼 / 海盐蓝" className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#111111]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#777777] block mb-1 uppercase tracking-wider">尺码</label>
                  <input type="text" value={newItemSize} onChange={(e) => setNewItemSize(e.target.value)} placeholder="M / 27" className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#111111]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#777777] block mb-1 uppercase tracking-wider">价格</label>
                  <input type="number" required value={newItemPrice} onChange={(e) => setNewItemPrice(Number(e.target.value))} className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#111111] font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#777777] block mb-1 uppercase tracking-wider">季节</label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-[#F5F5F5] rounded-lg">
                    {["春", "夏", "秋", "冬"].map((s) => (
                      <button key={s} type="button" onClick={() => setNewItemSeason(s)} className={`py-1 text-[11px] rounded font-medium transition ${newItemSeason === s ? "bg-white text-[#111111] shadow-sm" : "text-[#777777]"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBEBEB] flex gap-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2.5 text-xs font-semibold border border-[#EBEBEB] rounded-full text-[#777777] hover:bg-[#F5F5F5] transition">取消</button>
                <button type="submit" className="flex-1 py-2.5 text-xs font-semibold bg-[#111111] text-white rounded-full hover:bg-black transition">确认保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Categories Modal */}
      {showEditCategoriesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#EBEBEB] max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#EBEBEB]">
              <div>
                <h3 className="text-base font-serif italic font-semibold text-[#111111]">编辑分类</h3>
                <p className="text-[9px] text-[#AAAAAA]">Configure Categories</p>
              </div>
              <button onClick={() => setShowEditCategoriesModal(false)} className="w-6 h-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#777777]">x</button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {customCategories.map((cat) => (
                <div key={cat} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#EBEBEB] text-xs font-semibold text-[#111111]">
                  <span>{cat}</span>
                  <button onClick={() => { handleSaveCategories(customCategories.filter((c) => c !== cat)); if (selectedCategory === cat) setSelectedCategory("全部"); }} className="text-[#C04040] hover:bg-[#C04040]/10 rounded-lg p-1 transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#EBEBEB]">
              <input type="text" placeholder="新分类名称" value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { const v = newCatInput.trim(); if (v && !customCategories.includes(v)) { handleSaveCategories([...customCategories, v]); setNewCatInput(""); } } }} className="flex-1 bg-white border border-[#EBEBEB] rounded-lg px-3 py-1.5 text-xs focus:outline-none" />
              <button onClick={() => { const v = newCatInput.trim(); if (v && !customCategories.includes(v)) { handleSaveCategories([...customCategories, v]); setNewCatInput(""); } }} className="px-4 py-1.5 bg-[#111111] text-white rounded-lg text-xs font-semibold hover:bg-[#333333] transition">添加</button>
            </div>
            <button onClick={() => setShowEditCategoriesModal(false)} className="w-full py-2.5 bg-[#111111] text-white rounded-full text-xs font-semibold hover:bg-black transition">完成</button>
          </div>
        </div>
      )}
    </div>
  );
}
