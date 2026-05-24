import { useState, useRef, useCallback } from "react";
import { Search, Plus, Sparkles, Image as ImageIcon, Check, Trash, Upload, Loader2 } from "lucide-react";
import { ClothingItem, OutfitScheme, MakeupLook, DragPlacement } from "../types";

interface StudioPageProps {
  clothing: ClothingItem[];
  outfits: OutfitScheme[];
  makeupLooks: MakeupLook[];
  onAddOutfit: (outfit: OutfitScheme) => void;
  onRemoveOutfit: (id: string) => void;
  onIncrementItemWear: (itemId: string, diff: number) => void;
  onIncrementOutfitWear: (outfitId: string, diff: number) => void;
}

const BG_PRESETS = [
  { name: "纯白", value: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)" },
  { name: "浅灰", value: "linear-gradient(135deg, #F5F5F5 0%, #EBEBEB 100%)" },
  { name: "中灰", value: "linear-gradient(135deg, #EBEBEB 0%, #DDDDDD 100%)" },
  { name: "深灰", value: "linear-gradient(135deg, #DDDDDD 0%, #AAAAAA 100%)" },
];

export default function StudioPage({ clothing, outfits, makeupLooks, onAddOutfit, onRemoveOutfit }: StudioPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部搭配");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [aiFeedbackMessage, setAiFeedbackMessage] = useState("");

  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasBackground, setCanvasBackground] = useState({ type: "color" as const, value: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)" });
  const [canvasPlacements, setCanvasPlacements] = useState<DragPlacement[]>([]);
  const [selectedOutfitName, setSelectedOutfitName] = useState("");
  const [selectedOutfitRationale, setSelectedOutfitRationale] = useState("");
  const [associatedMakeupId, setAssociatedMakeupId] = useState("");
  const [activePlacementId, setActivePlacementId] = useState<string | null>(null);

  // Drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Canvas filters & save
  const [canvasCategory, setCanvasCategory] = useState("全部");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [outfitCategory, setOutfitCategory] = useState("日常");
  const [sceneCategories, setSceneCategories] = useState<string[]>(() => {
    const cached = localStorage.getItem("couture_scene_categories");
    return cached ? JSON.parse(cached) : ["日常", "办公", "聚会", "约会", "运动"];
  });
  const [newSceneInput, setNewSceneInput] = useState("");
  const [showNewSceneInput, setShowNewSceneInput] = useState(false);
  const [showMainSceneInput, setShowMainSceneInput] = useState(false);
  const [mainNewScene, setMainNewScene] = useState("");

  const getPosFromEvent = useCallback((e: React.PointerEvent<HTMLDivElement>): { x: number; y: number } => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handlePointerDown = useCallback((itemId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActivePlacementId(itemId);
    setDraggingId(itemId);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingId) return;
    e.preventDefault();
    const pos = getPosFromEvent(e);
    setCanvasPlacements((prev) =>
      prev.map((p) => (p.itemId === draggingId ? { ...p, x: pos.x, y: pos.y } : p))
    );
  }, [draggingId, getPosFromEvent]);

  const handlePointerUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setActivePlacementId(null);
  }, []);

  const handleAiCurator = async () => {
    setIsAiLoading(true);
    setAiFeedbackMessage("");
    try {
      const response = await fetch("/api/gemini/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: clothing, prompt: aiCustomPrompt || "适合今天出行的穿搭" }),
      });
      if (!response.ok) throw new Error("API 请求失败");
      const result = await response.json();

      setSelectedOutfitName(result.outfitName || "AI 定制穿搭");
      setSelectedOutfitRationale(result.rationale || "AI 智能推荐");

      if (makeupLooks.length > 0) setAssociatedMakeupId(makeupLooks[0].id);

      const matchingItems = clothing.filter((c) => result.itemNamesList?.some((name: string) => name.includes(c.name) || c.name.includes(name)));
      const finalItems = matchingItems.length > 0 ? matchingItems : clothing.slice(0, 3);

      const placements: DragPlacement[] = finalItems.map((item, idx) => ({
        itemId: item.id,
        type: "clothing" as const,
        x: 20 + idx * 22,
        y: 25 + (idx % 2 === 0 ? 5 : -5),
        scale: 1.0,
        rotate: idx % 2 === 0 ? -4 : 4,
      }));

      setCanvasPlacements(placements);
      setCanvasBackground({ type: "color", value: "linear-gradient(135deg, #F5F5F5 0%, #EBEBEB 100%)" });
      setShowCanvas(true);

      if (result.isFallback) setAiFeedbackMessage(result.message || "本地引擎推荐已启用");
    } catch (err: any) {
      alert("AI穿搭生成失败: " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const addItemToCanvas = (itemId: string) => {
    if (canvasPlacements.some((p) => p.itemId === itemId)) return;
    setCanvasPlacements([...canvasPlacements, { itemId, type: "clothing", x: 35 + Math.random() * 15, y: 30 + Math.random() * 15, scale: 1.0, rotate: Math.floor(Math.random() * 20) - 10 }]);
    setActivePlacementId(itemId);
  };

  const [isRemovingBg, setIsRemovingBg] = useState(false);

  const addImageToCanvas = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsRemovingBg(true);
    try {
      const { removeBackground: removeBg } = await import("@imgly/background-removal");
      const blob = await removeBg(file, {
        model: "isnet",
        output: { format: "image/png" },
      });
      const url = URL.createObjectURL(blob);
      const id = "photo_" + Date.now();
      setCanvasPlacements((prev) => [...prev, { itemId: id, type: "photo", x: 50, y: 40, scale: 1.0, rotate: 0 }]);
      setActivePlacementId(id);
      uploadedImages.current.set(id, url);
    } catch {
      // Fallback: use original image if bg removal fails
      const reader = new FileReader();
      reader.onloadend = () => {
        const id = "photo_" + Date.now();
        setCanvasPlacements((prev) => [...prev, { itemId: id, type: "photo", x: 50, y: 40, scale: 1.0, rotate: 0 }]);
        setActivePlacementId(id);
        uploadedImages.current.set(id, reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const uploadedImages = useRef<Map<string, string>>(new Map());

  const updatePlacement = (itemId: string, type: "scale" | "rotate" | "x" | "y", value: number) => {
    setCanvasPlacements(canvasPlacements.map((p) => {
      if (p.itemId !== itemId) return p;
      if (type === "scale") return { ...p, scale: Math.max(0.5, Math.min(2.0, value)) };
      if (type === "rotate") return { ...p, rotate: value };
      if (type === "x") return { ...p, x: Math.max(0, Math.min(100, value)) };
      if (type === "y") return { ...p, y: Math.max(0, Math.min(100, value)) };
      return p;
    }));
  };

  const removePlacement = (itemId: string) => {
    setCanvasPlacements(canvasPlacements.filter((p) => p.itemId !== itemId));
    if (activePlacementId === itemId) setActivePlacementId(null);
  };

  const handleSaveOutfit = () => {
    if (canvasPlacements.length === 0) { alert("请至少添加一件单品到画板"); return; }
    if (!selectedOutfitName.trim()) setSelectedOutfitName("穿搭方案 " + new Date().toLocaleDateString("zh-CN"));
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    if (!selectedOutfitName.trim()) { alert("请为穿搭方案命名"); return; }
    const linkedIds = canvasPlacements.filter((p) => p.type === "clothing").map((p) => p.itemId);

    onAddOutfit({
      id: "outfit_" + Date.now(),
      name: selectedOutfitName,
      rationale: selectedOutfitRationale || outfitCategory + "穿搭",
      scene: outfitCategory,
      itemIds: linkedIds,
      makeupLookId: associatedMakeupId || undefined,
      background: canvasBackground,
      placements: canvasPlacements,
      wearCount: 0,
    });

    setShowSaveModal(false);
    setShowCanvas(false);
    setSelectedOutfitName("");
    setSelectedOutfitRationale("");
    setOutfitCategory("日常");
    setCanvasPlacements([]);
    setAssociatedMakeupId("");
    uploadedImages.current.clear();
  };

  const BASE_SCENE_KEYWORDS: Record<string, string[]> = {
    "日常": ["日常", "休闲", "出街", "逛街"],
    "办公": ["办公", "通勤", "上班", "职场"],
    "聚会": ["聚会", "派对", "晚宴", "party"],
    "约会": ["约会", "date", "浪漫"],
    "运动": ["运动", "健身", "户外", "跑步"],
  };

  const filteredOutfits = outfits.filter((out) => {
    const q = searchQuery.toLowerCase();
    const matchText = out.name.toLowerCase().includes(q) || out.rationale.toLowerCase().includes(q);
    if (selectedCategory === "全部搭配") return matchText;
    if (out.scene === selectedCategory) return matchText;
    // Fallback: keyword match in name/rationale for legacy outfits without scene field
    const kw = BASE_SCENE_KEYWORDS[selectedCategory] || [selectedCategory.toLowerCase()];
    const text = (out.name + out.rationale).toLowerCase();
    return matchText && kw.some((k) => text.includes(k));
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-serif italic font-semibold text-[#111111] leading-tight">灵感创意室</h1>
          <p className="text-xs text-[#AAAAAA] mt-0.5">Dynamic Look Creator - AI智能穿搭 + 手作画板</p>
        </div>

        {/* AI Prompt Bar */}
        <div className="flex bg-white rounded-full p-1.5 border border-[#EBEBEB] shadow-sm">
          <input
            type="text" value={aiCustomPrompt} onChange={(e) => setAiCustomPrompt(e.target.value)}
            placeholder="描述场景：如'今天下雨去画廊散步'..."
            className="flex-1 bg-transparent px-4 text-xs outline-none text-[#111111] placeholder-[#AAAAAA]"
          />
          <button onClick={handleAiCurator} disabled={isAiLoading}
            className="px-4 py-2 bg-[#111111] text-white hover:bg-[#444444] transition text-xs font-semibold rounded-full flex items-center gap-1.5 disabled:opacity-60">
            <Sparkles className="w-3.5 h-3.5" />
            {isAiLoading ? "生成中..." : "AI+ 智能穿搭"}
          </button>
        </div>
      </div>

      {aiFeedbackMessage && (
        <div className="p-3 text-xs bg-[#F5F5F5] text-[#111111] rounded-xl border border-[#111111]/20 flex items-center justify-between">
          <span>{aiFeedbackMessage}</span>
          <button onClick={() => setAiFeedbackMessage("")} className="font-bold">x</button>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center justify-between pb-1 border-b border-[#EBEBEB]">
        <div className="flex gap-1 text-xs overflow-x-auto no-scrollbar items-center">
          {["全部搭配", ...sceneCategories].map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition whitespace-nowrap ${
                selectedCategory === cat ? "bg-[#111111] text-white" : "text-[#777777] hover:bg-[#F5F5F5]"
              }`}>{cat}</button>
          ))}
          {showMainSceneInput ? (
            <input
              type="text"
              value={mainNewScene}
              onChange={(e) => setMainNewScene(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && mainNewScene.trim()) {
                  const v = mainNewScene.trim();
                  if (!sceneCategories.includes(v)) {
                    const updated = [...sceneCategories, v];
                    setSceneCategories(updated);
                    localStorage.setItem("couture_scene_categories", JSON.stringify(updated));
                  }
                  setMainNewScene("");
                  setShowMainSceneInput(false);
                }
                if (e.key === "Escape") { setMainNewScene(""); setShowMainSceneInput(false); }
              }}
              onBlur={() => { if (!mainNewScene.trim()) setShowMainSceneInput(false); }}
              placeholder="新分类"
              className="w-16 px-2 py-1.5 rounded-full text-[10px] bg-[#F5F5F5] border border-[#EBEBEB] outline-none focus:border-[#111111] font-medium"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setShowMainSceneInput(true)}
              className="w-6 h-6 rounded-full border border-dashed border-[#AAAAAA] flex items-center justify-center text-[#AAAAAA] hover:border-[#111111] hover:text-[#111111] transition flex-shrink-0"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="relative ml-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#AAAAAA]" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索穿搭..."
            className="bg-[#F5F5F5] border-0 rounded-full pl-8 pr-3 py-1.5 text-[11px] focus:outline-none w-32" />
        </div>
      </div>

      {/* Cards Grid — 一排两个 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Create Card — 缩小与穿搭卡片并排 */}
        <div className="bg-white rounded-2xl border border-dashed border-[#111111]/40 p-4 flex flex-col items-center justify-center text-center min-h-[200px] shadow-sm hover:border-[#111111] transition-all group cursor-pointer"
          onClick={() => { setShowCanvas(true); setCanvasPlacements([]); setSelectedOutfitName("我的穿搭方案"); setSelectedOutfitRationale(""); if (makeupLooks.length > 0) setAssociatedMakeupId(makeupLooks[0].id); }}>
          <div className="w-10 h-10 rounded-full border-2 border-[#111111]/50 bg-[#FFFFFF] flex items-center justify-center text-[#111111] transition-all group-hover:scale-105">
            <Plus className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-serif italic font-semibold text-[#111111] mt-3">新建穿搭画板</h3>
          <p className="text-[10px] text-[#AAAAAA] mt-1 max-w-[140px] leading-relaxed">从衣橱选单品自由排版</p>
        </div>

        {/* Outfit Cards — Collage Preview */}
        {filteredOutfits.map((out) => {
          const linkedClothes = clothing.filter((c) => out.itemIds.includes(c.id));
          return (
            <div key={out.id} className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
              {/* Collage Canvas */}
              <div className="relative aspect-[4/5] overflow-hidden" style={{ background: out.background.value }}>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#111111 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                {out.placements && out.placements.length > 0 ? (
                  out.placements.map((placed) => {
                    const item = linkedClothes.find((c) => c.id === placed.itemId);
                    if (!item) return null;
                    return (
                      <div
                        key={placed.itemId}
                        className="absolute pointer-events-none"
                        style={{
                          left: `${placed.x}%`,
                          top: `${placed.y}%`,
                          transform: `translate(-50%, -50%) scale(${placed.scale * 0.55}) rotate(${placed.rotate}deg)`,
                          width: "64px",
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-20 object-cover"
                          style={{ mixBlendMode: "multiply" }}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="flex -space-x-2 items-center justify-center h-full">
                    {linkedClothes.slice(0, 3).map((clo, idx) => (
                      <img key={clo.id} src={clo.image} alt={clo.name} style={{ transform: `rotate(${(idx - 1) * 7}deg)` }}
                        className="w-14 h-20 object-cover rounded-xl border-2 border-white shadow-md bg-stone-100" referrerPolicy="no-referrer" />
                    ))}
                  </div>
                )}
                {/* Compact text overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent pt-8 pb-2.5 px-3 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[8px] font-semibold text-white/80 bg-white/15 px-1.5 py-0.5 rounded-full">
                      {out.scene || "日常"}
                    </span>
                    <h3 className="text-[11px] font-bold text-white leading-tight line-clamp-1 mt-1">{out.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white/90 flex-shrink-0">穿{out.wearCount}次</span>
                </div>
                <button
                  onClick={() => onRemoveOutfit(out.id)}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/40 text-white/80 flex items-center justify-center text-[10px] hover:bg-[#C04040] transition"
                >×</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Canvas Modal — Full Screen */}
      {showCanvas && (
        <div className="fixed inset-0 bg-[#F5F5F5] z-50 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#EBEBEB] flex-shrink-0">
            <button onClick={() => setShowCanvas(false)} className="text-[#777777] text-xs font-medium hover:text-[#111111] flex-shrink-0">取消</button>
            <span className="text-sm font-serif italic font-semibold text-[#111111]">穿搭画板</span>
            <button onClick={handleSaveOutfit} className="px-4 py-1.5 bg-[#111111] text-white text-xs font-semibold rounded-full hover:bg-black transition flex-shrink-0">保存</button>
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className="flex-1 relative overflow-hidden"
            style={{ background: canvasBackground.value, touchAction: draggingId ? "none" : "auto" }}
            onClick={handleCanvasClick}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#111111 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

            {canvasPlacements.length > 0 ? (
              canvasPlacements.map((placed) => {
                const item = clothing.find((c) => c.id === placed.itemId);
                const photoUrl = placed.type === "photo" ? uploadedImages.current.get(placed.itemId) : null;
                const imageSrc = placed.type === "photo" ? photoUrl : item?.image;
                if (!imageSrc) return null;
                const isActive = activePlacementId === placed.itemId;
                return (
                  <div
                    key={placed.itemId}
                    onPointerDown={(e) => handlePointerDown(placed.itemId, e)}
                    className={`absolute cursor-grab active:cursor-grabbing transition-shadow ${
                      isActive ? "z-20" : "z-10"
                    }`}
                    style={{
                      left: `${placed.x}%`,
                      top: `${placed.y}%`,
                      transform: `translate(-50%, -50%) scale(${placed.scale}) rotate(${placed.rotate}deg)`,
                      touchAction: "none",
                      width: "100px",
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt=""
                      className="w-full h-28 object-cover pointer-events-none"
                      style={{ mixBlendMode: placed.type === "photo" ? undefined : "multiply" }}
                      referrerPolicy="no-referrer"
                    />
                    {isActive && (
                      <div className="absolute -top-1.5 -right-1.5 flex gap-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); removePlacement(placed.itemId); }}
                          className="w-5 h-5 bg-[#C04040] text-white rounded-full text-[10px] flex items-center justify-center shadow"
                        >×</button>
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-lg border border-[#EBEBEB] text-[10px]">
                        <button onClick={(e) => { e.stopPropagation(); updatePlacement(placed.itemId, "scale", placed.scale - 0.1); }}
                          className="w-5 h-5 flex items-center justify-center text-[#111111] font-bold">−</button>
                        <span className="font-mono text-[#777777] w-8 text-center">{Math.round(placed.scale * 100)}%</span>
                        <button onClick={(e) => { e.stopPropagation(); updatePlacement(placed.itemId, "scale", placed.scale + 0.1); }}
                          className="w-5 h-5 flex items-center justify-center text-[#111111] font-bold">+</button>
                        <div className="w-px h-4 bg-[#EBEBEB] mx-0.5" />
                        <button onClick={(e) => { e.stopPropagation(); updatePlacement(placed.itemId, "rotate", placed.rotate - 15); }}
                          className="w-5 h-5 flex items-center justify-center text-[#111111] font-bold">↺</button>
                        <span className="font-mono text-[#777777] w-7 text-center">{placed.rotate}°</span>
                        <button onClick={(e) => { e.stopPropagation(); updatePlacement(placed.itemId, "rotate", placed.rotate + 15); }}
                          className="w-5 h-5 flex items-center justify-center text-[#111111] font-bold">↻</button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-2">
                  <ImageIcon className="w-10 h-10 text-[#AAAAAA]/40 mx-auto" />
                  <p className="text-xs text-[#AAAAAA]">点击下方单品添加到画板</p>
                </div>
              </div>
            )}
          </div>

          {/* Background presets + custom color */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-t border-[#EBEBEB] flex-shrink-0 overflow-x-auto no-scrollbar">
            <span className="text-[9px] text-[#AAAAAA] flex-shrink-0">底色</span>
            {BG_PRESETS.map((bg) => (
              <button
                key={bg.name}
                onClick={() => setCanvasBackground({ type: "color", value: bg.value })}
                className={`w-6 h-6 rounded-full border-2 transition flex-shrink-0 ${
                  canvasBackground.value === bg.value ? "border-[#111111]" : "border-[#EBEBEB]"
                }`}
                style={{ background: bg.value }}
                title={bg.name}
              />
            ))}
            <div className="w-px h-4 bg-[#EBEBEB] flex-shrink-0" />
            <label className="w-6 h-6 rounded-full border-2 border-dashed border-[#AAAAAA] flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-[#111111] transition relative">
              <span className="text-[14px] text-[#AAAAAA] leading-none">+</span>
              <input
                type="color"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setCanvasBackground({ type: "color", value: e.target.value })}
              />
            </label>
          </div>

          {/* Category Filter */}
          <div className="bg-white border-t border-[#EBEBEB] flex-shrink-0 px-4 py-2">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {["全部", "上装", "下装", "外套", "鞋履", "包袋", "饰品"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCanvasCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition ${
                    canvasCategory === cat ? "bg-[#111111] text-white" : "bg-[#F5F5F5] text-[#777777]"
                  }`}
                >{cat}</button>
              ))}
            </div>
          </div>

          {/* Bottom Drawer — Add Clothing + Upload */}
          <div className="bg-white border-t border-[#EBEBEB] flex-shrink-0">
            <div className="flex items-center gap-2 px-4 py-2">
              <Plus className="w-3.5 h-3.5 text-[#AAAAAA]" />
              <span className="text-[10px] font-semibold text-[#777777]">添加衣物到画板</span>
              <span className="text-[9px] text-[#AAAAAA] ml-auto">{canvasPlacements.length} 件已添加</span>
              <label className={`w-6 h-6 rounded-full border border-dashed flex items-center justify-center transition cursor-pointer flex-shrink-0 ${
                isRemovingBg ? "border-[#111111] text-[#111111] animate-pulse" : "border-[#AAAAAA] text-[#AAAAAA] hover:border-[#111111] hover:text-[#111111]"
              }`}>
                {isRemovingBg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                <input type="file" accept="image/*" onChange={addImageToCanvas} className="hidden" disabled={isRemovingBg} />
              </label>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
              {clothing
                .filter((item) => canvasCategory === "全部" || item.category === canvasCategory)
                .map((item) => {
                  const isAdded = canvasPlacements.some((p) => p.itemId === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => { if (isAdded) removePlacement(item.id); else addItemToCanvas(item.id); }}
                      className={`relative flex-shrink-0 w-16 h-20 rounded-lg bg-white border overflow-hidden p-1 transition ${
                        isAdded ? "border-[#111111] ring-1 ring-[#111111] opacity-60" : "border-[#EBEBEB] hover:border-[#AAAAAA]"
                      }`}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md pointer-events-none" referrerPolicy="no-referrer" />
                      {isAdded && (
                        <div className="absolute inset-0 bg-[#111111]/20 rounded-md flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-[#111111]" />
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Save Modal */}
          {showSaveModal && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-30">
              <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-[#EBEBEB] w-full sm:max-w-md p-5 space-y-4 shadow-2xl animate-in">
                <h3 className="text-base font-serif italic font-semibold text-[#111111] text-center">保存穿搭方案</h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">方案名称</label>
                    <input
                      type="text" value={selectedOutfitName} onChange={(e) => setSelectedOutfitName(e.target.value)}
                      placeholder="如: 暖灰羊绒与焦糖乐福"
                      className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">穿搭说明</label>
                    <textarea
                      value={selectedOutfitRationale} onChange={(e) => setSelectedOutfitRationale(e.target.value)}
                      placeholder="描述穿搭心得与推荐场景..."
                      rows={2}
                      className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#111111] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] block mb-1">穿搭分类</label>
                    <div className="flex gap-1.5 flex-wrap items-center">
                      {sceneCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setOutfitCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-medium transition ${
                            outfitCategory === cat ? "bg-[#111111] text-white" : "bg-[#F5F5F5] text-[#777777]"
                          }`}
                        >{cat}</button>
                      ))}
                      {showNewSceneInput ? (
                        <input
                          type="text"
                          value={newSceneInput}
                          onChange={(e) => setNewSceneInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newSceneInput.trim()) {
                              const v = newSceneInput.trim();
                              if (!sceneCategories.includes(v)) {
                                const updated = [...sceneCategories, v];
                                setSceneCategories(updated);
                                localStorage.setItem("couture_scene_categories", JSON.stringify(updated));
                                setOutfitCategory(v);
                              }
                              setNewSceneInput("");
                              setShowNewSceneInput(false);
                            }
                            if (e.key === "Escape") { setNewSceneInput(""); setShowNewSceneInput(false); }
                          }}
                          onBlur={() => { if (!newSceneInput.trim()) setShowNewSceneInput(false); }}
                          placeholder="新分类"
                          className="w-16 px-2 py-1.5 rounded-full text-[10px] bg-[#F5F5F5] border border-[#EBEBEB] outline-none focus:border-[#111111]"
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowNewSceneInput(true)}
                          className="w-6 h-6 rounded-full border border-dashed border-[#AAAAAA] flex items-center justify-center text-[#AAAAAA] hover:border-[#111111] hover:text-[#111111] transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 py-2.5 text-xs font-semibold border border-[#EBEBEB] rounded-full text-[#777777]"
                  >取消</button>
                  <button
                    onClick={handleConfirmSave}
                    className="flex-1 py-2.5 text-xs font-semibold bg-[#111111] text-white rounded-full"
                  >确认保存</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
