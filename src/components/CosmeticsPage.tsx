import { useState, ChangeEvent, FormEvent } from "react";
import { Search, Sparkles, Camera, Trash2, Image as ImageIcon } from "lucide-react";
import { CosmeticItem, MakeupLook } from "../types";

interface CosmeticsPageProps {
  cosmetics: CosmeticItem[];
  makeupLooks: MakeupLook[];
  onAddCosmetic: (item: CosmeticItem) => void;
  onRemoveCosmetic: (id: string) => void;
  onAddMakeupLook: (look: MakeupLook) => void;
  onRemoveMakeupLook: (id: string) => void;
}

const COSMETIC_PRESETS = [
  { name: "TF黑金唇膏 #16", brand: "Tom Ford", category: "口红" as const, shade: "16 斯嘉丽红", url: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=60" },
  { name: "TF四色眼影盘", brand: "Tom Ford", category: "眼妆" as const, shade: "01 悬红流沙金", url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=60" },
  { name: "兰蔻持妆粉底霜", brand: "Lancome", category: "粉底" as const, shade: "PO-01 象牙白", url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60" },
  { name: "YSL自由之水修容", brand: "YSL", category: "修容" as const, shade: "Y03 冷灰色", url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=60" },
];

export default function CosmeticsPage({ cosmetics, makeupLooks, onAddCosmetic, onRemoveCosmetic, onAddMakeupLook, onRemoveMakeupLook }: CosmeticsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("妆容");
  const [showCosmeticForm, setShowCosmeticForm] = useState(false);
  const [showMakeupLookForm, setShowMakeupLookForm] = useState(false);
  const [capturedImage, setCapturedImage] = useState("");

  // Cosmetic Form
  const [cosmeticName, setCosmeticName] = useState("");
  const [cosmeticBrand, setCosmeticBrand] = useState("");
  const [cosmeticCategory, setCosmeticCategory] = useState<"眼妆" | "口红" | "高光" | "修容" | "粉底" | "其他">("眼妆");
  const [cosmeticShade, setCosmeticShade] = useState("");
  const [cosmeticUsableDays, setCosmeticUsableDays] = useState(180);

  // Makeup Look Form
  const [lookName, setLookName] = useState("");
  const [lookDescription, setLookDescription] = useState("");
  const [linkedEye, setLinkedEye] = useState("");
  const [linkedLip, setLinkedLip] = useState("");
  const [linkedFoundation, setLinkedFoundation] = useState("");
  const [linkedHighlighter, setLinkedHighlighter] = useState("");
  const [linkedContour, setLinkedContour] = useState("");
  const [linkedNoseShadow, setLinkedNoseShadow] = useState("");
  const [lookImage, setLookImage] = useState("");
  const [detailLook, setDetailLook] = useState<MakeupLook | null>(null);

  const categories = ["妆容", "眼妆", "口红", "高光", "修容", "粉底", "其他"];

  const triggerCamera = () => {
    const preset = COSMETIC_PRESETS[Math.floor(Math.random() * COSMETIC_PRESETS.length)];
    setCapturedImage(preset.url);
    if (!cosmeticName) setCosmeticName(preset.name);
    if (!cosmeticBrand) setCosmeticBrand(preset.brand);
    if (!cosmeticShade) setCosmeticShade(preset.shade);
    setCosmeticCategory(preset.category);
  };

  const handleLocalImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCapturedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCosmetic = (e: FormEvent) => {
    e.preventDefault();
    if (!cosmeticName.trim()) return;
    onAddCosmetic({
      id: "cosmetic_" + Date.now(),
      name: cosmeticName,
      image: capturedImage || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=60",
      brand: cosmeticBrand || "名媛高定",
      category: cosmeticCategory,
      shade: cosmeticShade || "通用色",
      usableDays: cosmeticUsableDays,
      remainingDays: cosmeticUsableDays,
      registerDate: new Date().toISOString().split("T")[0],
    });
    setCosmeticName(""); setCosmeticBrand(""); setCosmeticShade(""); setCapturedImage(""); setShowCosmeticForm(false);
  };

  const handleCreateMakeupLook = (e: FormEvent) => {
    e.preventDefault();
    if (!lookName.trim()) return;
    const compiledFormula: Record<string, string> = {};
    const linkIds: string[] = [];
    const linkItem = (key: string, val: string) => {
      if (!val) return;
      compiledFormula[key] = val;
      const found = cosmetics.find((c) => c.name === val || c.shade === val);
      if (found) linkIds.push(found.id);
    };
    linkItem("眼妆", linkedEye); linkItem("口红", linkedLip); linkItem("粉底", linkedFoundation);
    linkItem("高光", linkedHighlighter); linkItem("修容", linkedContour); linkItem("鼻影", linkedNoseShadow);

    onAddMakeupLook({
      id: "look_" + Date.now(),
      name: lookName,
      image: lookImage || "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&auto=format&fit=crop&q=60",
      description: lookDescription || "用户调色的高端定制妆面",
      cosmeticsUsed: compiledFormula,
      cosmeticIds: linkIds,
    });

    setLookName(""); setLookDescription(""); setLookImage(""); setLinkedEye(""); setLinkedLip("");
    setLinkedFoundation(""); setLinkedHighlighter(""); setLinkedContour(""); setLinkedNoseShadow("");
    setShowMakeupLookForm(false);
  };

  const filteredLooks = makeupLooks.filter((look) => {
    const q = searchQuery.toLowerCase();
    return look.name.toLowerCase().includes(q) || look.description.toLowerCase().includes(q);
  });

  const filteredCosmetics = cosmetics.filter((item) => {
    const q = searchQuery.toLowerCase();
    const match = item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || item.shade.toLowerCase().includes(q);
    return selectedCategory === "全部" ? match : item.category === selectedCategory && match;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif italic font-semibold text-[#111111]">高奢美妆收纳</h1>
          <p className="text-xs text-[#AAAAAA] mt-0.5">Luxury Cosmetics Organizer - {cosmetics.length} 件单品</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCosmeticForm(true)} className="px-4 py-2 bg-white border border-[#EBEBEB] text-[#111111] text-xs font-semibold rounded-full hover:bg-[#F5F5F5] transition">录入单品</button>
          <button onClick={() => { setShowMakeupLookForm(true); }} className="px-4 py-2 bg-[#111111] text-white text-xs font-semibold rounded-full hover:bg-[#333333] transition">新建妆容</button>
        </div>
      </div>

      {/* Category Filter + Search */}
      <div className="bg-white rounded-2xl p-4 border border-[#EBEBEB] flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                selectedCategory === cat ? "bg-[#111111] text-white" : cat === "妆容" ? "bg-[#F5F5F5] text-[#111111] border border-[#111111]/20" : "bg-[#F5F5F5] text-[#777777] hover:bg-[#EBEBEB]"
              }`}>
              {cat === "妆容" && <Sparkles className="w-3 h-3" />}{cat}
            </button>
          ))}
        </div>
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索美妆..."
            className="w-full md:w-48 bg-[#F5F5F5] border-0 rounded-full pl-9 pr-3 py-2 text-xs focus:outline-none" />
        </div>
      </div>

      {/* Makeup Looks Section */}
      {selectedCategory === "妆容" ? (
        <div className="grid grid-cols-2 gap-3">
          {filteredLooks.map((look) => (
            <div key={look.id} onClick={() => setDetailLook(look)} className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden hover:shadow-md transition-all cursor-pointer">
              <div className="aspect-[4/5] relative overflow-hidden">
                <img src={look.image} alt={look.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <span className="absolute top-2 left-2 bg-white/90 text-[#111111] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />妆容
                </span>
                <button onClick={(e) => { e.stopPropagation(); onRemoveMakeupLook(look.id); }} className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-[#C04040]/10 hover:text-[#C04040] text-[#AAAAAA] shadow-sm transition text-[10px]">×</button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent pt-6 pb-3 px-3">
                  <h3 className="text-[11px] font-bold text-white leading-tight line-clamp-1">{look.name}</h3>
                  <p className="text-[9px] text-white/70 line-clamp-1 mt-0.5">{look.description}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredLooks.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#AAAAAA] text-xs">暂无妆容方案，点击右上角新建</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredCosmetics.map((item) => {
            const ratio = item.remainingDays / item.usableDays;
            const isWarn = ratio < 0.25;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden hover:shadow-sm transition">
                <div className="aspect-square bg-stone-50 relative overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <span className="absolute top-2 left-2 text-[9px] bg-white/90 text-[#111111] px-2 py-0.5 rounded-full font-bold">{item.category}</span>
                  <button onClick={() => onRemoveCosmetic(item.id)} className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-white text-[#C04040] text-[9px] font-semibold shadow-sm border border-[#C04040]/20 hover:bg-[#C04040]/5 transition">删除</button>
                </div>
                <div className="p-3 space-y-2">
                  <span className="text-[10px] text-[#AAAAAA]">{item.brand}</span>
                  <h3 className="text-xs font-bold text-[#111111] truncate">{item.name}</h3>
                  <p className="text-[10px] text-[#111111] truncate">色号: {item.shade}</p>
                  <div className="pt-2 border-t border-[#EBEBEB] flex items-center justify-between text-[10px]">
                    <span className="text-[#AAAAAA]">寿命:</span>
                    <span className={`font-mono font-bold ${isWarn ? "text-[#C04040]" : "text-[#2D8B4E]"}`}>剩 {item.remainingDays} 天</span>
                  </div>
                  <div className="w-full h-1 bg-[#F5F5F5] rounded-full overflow-hidden">
                    <div className={`h-full ${isWarn ? "bg-[#C04040]" : "bg-[#111111]"}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cosmetic Add Form Modal */}
      {showCosmeticForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#EBEBEB] max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#EBEBEB]">
              <div>
                <h3 className="text-sm font-serif italic font-semibold text-[#111111]">录入化妆用品</h3>
                <p className="text-[9px] text-[#AAAAAA]">Snapshot & Set Life Days</p>
              </div>
              <button onClick={() => setShowCosmeticForm(false)} className="w-6 h-6 rounded-full bg-[#F5F5F5] flex items-center justify-center">x</button>
            </div>
            <form onSubmit={handleCreateCosmetic} className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#777777] uppercase tracking-wider block mb-1 font-bold">拍摄美妆单品</span>
                {capturedImage ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[#EBEBEB]">
                    <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setCapturedImage("")} className="absolute top-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded text-[10px]">重新拍摄</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={triggerCamera} className="aspect-video bg-[#111111] text-[#111111] rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-black transition">
                      <Camera className="w-6 h-6" />模拟拍照
                    </button>
                    <div className="aspect-video border border-dashed border-[#DDDDDD] rounded-xl bg-white flex flex-col items-center justify-center relative">
                      <input type="file" accept="image/*" onChange={handleLocalImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <span className="text-[10px] text-[#777777]">本地照片</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#777777] block mb-1">名称</label>
                  <input type="text" required value={cosmeticName} onChange={(e) => setCosmeticName(e.target.value)} placeholder="例如: 哑光口红 TF16" className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#111111]" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">品牌</label>
                    <input type="text" value={cosmeticBrand} onChange={(e) => setCosmeticBrand(e.target.value)} placeholder="Tom Ford" className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">色号</label>
                    <input type="text" value={cosmeticShade} onChange={(e) => setCosmeticShade(e.target.value)} placeholder="#16 斯佳丽红" className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">分类</label>
                    <select value={cosmeticCategory} onChange={(e: any) => setCosmeticCategory(e.target.value)} className="w-full bg-white border border-[#EBEBEB] rounded-lg px-2.5 py-2 focus:outline-none">
                      {categories.slice(1).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">可用天数</label>
                    <input type="number" value={cosmeticUsableDays} onChange={(e) => setCosmeticUsableDays(Math.max(1, Number(e.target.value)))} className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#EBEBEB] flex gap-2">
                <button type="button" onClick={() => setShowCosmeticForm(false)} className="flex-1 py-2.5 text-xs font-semibold border border-[#EBEBEB] rounded-full text-[#777777]">取消</button>
                <button type="submit" className="flex-1 py-2.5 text-xs font-semibold bg-[#111111] text-white rounded-full">存入库房</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Makeup Look Form Modal */}
      {showMakeupLookForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#EBEBEB] max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#EBEBEB]">
              <div>
                <h3 className="text-sm font-serif italic font-semibold text-[#111111]">设计妆容方案</h3>
                <p className="text-[9px] text-[#AAAAAA]">Create Makeup Look Formula</p>
              </div>
              <button onClick={() => { setShowMakeupLookForm(false); setLookImage(""); }} className="w-6 h-6 rounded-full bg-[#F5F5F5] flex items-center justify-center">x</button>
            </div>
            <form onSubmit={handleCreateMakeupLook} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#777777] block mb-1">方案名称</label>
                <input type="text" required value={lookName} onChange={(e) => setLookName(e.target.value)} placeholder="如: 清冷蜜桃乌龙妆" className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none focus:border-[#111111]" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#777777] block mb-1">灵感描述</label>
                <textarea value={lookDescription} onChange={(e) => setLookDescription(e.target.value)} placeholder="描述妆容的风格与适用场合..." rows={2} className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#777777] block mb-1">方案封面图</label>
                {lookImage ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[#EBEBEB]">
                    <img src={lookImage} alt="Look preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setLookImage("")} className="absolute top-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded text-[10px]">移除</button>
                  </div>
                ) : (
                  <div className="aspect-video border border-dashed border-[#DDDDDD] rounded-xl bg-white flex flex-col items-center justify-center gap-1 relative">
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setLookImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <ImageIcon className="w-5 h-5 text-[#AAAAAA]" />
                    <span className="text-[10px] text-[#AAAAAA]">上传妆容效果图</span>
                  </div>
                )}
              </div>
              <div className="bg-[#F5F5F5] border border-[#EBEBEB] rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-bold text-[#111111] uppercase block pb-1 border-b border-[#EBEBEB]">配置化妆品</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">眼妆</label>
                    <select value={linkedEye} onChange={(e) => setLinkedEye(e.target.value)} className="w-full bg-white border border-[#EBEBEB] rounded-lg px-2 py-1.5 text-xs">
                      <option value="">-- 选择 --</option>
                      {cosmetics.filter((c) => c.category === "眼妆").map((c) => (<option key={c.id} value={`${c.name} (${c.shade})`}>{c.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">口红</label>
                    <select value={linkedLip} onChange={(e) => setLinkedLip(e.target.value)} className="w-full bg-white border border-[#EBEBEB] rounded-lg px-2 py-1.5 text-xs">
                      <option value="">-- 选择 --</option>
                      {cosmetics.filter((c) => c.category === "口红").map((c) => (<option key={c.id} value={`${c.name} (${c.shade})`}>{c.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">粉底</label>
                    <select value={linkedFoundation} onChange={(e) => setLinkedFoundation(e.target.value)} className="w-full bg-white border border-[#EBEBEB] rounded-lg px-2 py-1.5 text-xs">
                      <option value="">-- 选择 --</option>
                      {cosmetics.filter((c) => c.category === "粉底").map((c) => (<option key={c.id} value={`${c.name} (${c.shade})`}>{c.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">高光</label>
                    <select value={linkedHighlighter} onChange={(e) => setLinkedHighlighter(e.target.value)} className="w-full bg-white border border-[#EBEBEB] rounded-lg px-2 py-1.5 text-xs">
                      <option value="">-- 选择 --</option>
                      {cosmetics.filter((c) => c.category === "高光").map((c) => (<option key={c.id} value={`${c.name} (${c.shade})`}>{c.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">修容</label>
                    <select value={linkedContour} onChange={(e) => setLinkedContour(e.target.value)} className="w-full bg-white border border-[#EBEBEB] rounded-lg px-2 py-1.5 text-xs">
                      <option value="">-- 选择 --</option>
                      {cosmetics.filter((c) => c.category === "修容").map((c) => (<option key={c.id} value={`${c.name} (${c.shade})`}>{c.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">鼻影</label>
                    <input type="text" value={linkedNoseShadow} onChange={(e) => setLinkedNoseShadow(e.target.value)} placeholder="自定义输入..." className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-1.5 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#EBEBEB] flex gap-2">
                <button type="button" onClick={() => { setShowMakeupLookForm(false); setLookImage(""); }} className="flex-1 py-2.5 text-xs font-semibold border border-[#EBEBEB] rounded-full text-[#777777]">取消</button>
                <button type="submit" className="flex-1 py-2.5 text-xs font-semibold bg-[#111111] text-white rounded-full">发布妆容方案</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Makeup Look Detail Modal */}
      {detailLook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDetailLook(null)}>
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#EBEBEB] max-w-md w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-[3/2] relative overflow-hidden">
              <img src={detailLook.image} alt={detailLook.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button onClick={() => setDetailLook(null)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-sm hover:bg-black/70 transition">×</button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pt-10 pb-4 px-5">
                <h2 className="text-base font-serif italic font-semibold text-white">{detailLook.name}</h2>
                <p className="text-[11px] text-white/70 mt-0.5">{detailLook.description}</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#EBEBEB]">
                <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
                <span className="text-[11px] font-bold text-[#111111] uppercase tracking-wider">化妆品清单</span>
              </div>
              {Object.keys(detailLook.cosmeticsUsed).length > 0 ? (
                <div className="space-y-1.5">
                  {Object.entries(detailLook.cosmeticsUsed).map(([category, itemName]) => (
                    <div key={category} className="flex items-center justify-between py-1.5 px-3 bg-[#F5F5F5] rounded-lg">
                      <span className="text-[10px] font-bold text-[#777777]">{category}</span>
                      <span className="text-[11px] text-[#111111] font-medium">{itemName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#AAAAAA] text-center py-4">暂无化妆品配置</p>
              )}
              <button onClick={() => setDetailLook(null)} className="w-full py-2.5 text-xs font-semibold border border-[#EBEBEB] rounded-full text-[#777777] hover:bg-[#F5F5F5] transition mt-2">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
