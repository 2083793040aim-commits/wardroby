import { useState, useEffect } from "react";
import { Calendar, Shirt, Sparkles, Palette, User, Plus } from "lucide-react";
import { ClothingItem, CosmeticItem, MakeupLook, OutfitScheme, CalendarDayPlan } from "./types";
import {
  INITIAL_CLOTHING,
  INITIAL_COSMETICS,
  INITIAL_MAKEUP_LOOKS,
  INITIAL_OUTFITS,
  INITIAL_CALENDAR,
} from "./initialData";

import CalendarPage from "./components/CalendarPage";
import WardrobePage from "./components/WardrobePage";
import StudioPage from "./components/StudioPage";
import CosmeticsPage from "./components/CosmeticsPage";
import ProfilePage from "./components/ProfilePage";

const TABS = [
  { key: "calendar", label: "日程", icon: Calendar },
  { key: "wardrobe", label: "衣橱", icon: Shirt },
  { key: "studio", label: "灵感", icon: Sparkles, isCenter: true },
  { key: "cosmetics", label: "美妆", icon: Palette },
  { key: "profile", label: "我的", icon: User },
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<"calendar" | "wardrobe" | "studio" | "cosmetics" | "profile">("studio");

  const [clothing, setClothing] = useState<ClothingItem[]>(() => {
    const cached = localStorage.getItem("couture_clothing");
    return cached ? JSON.parse(cached) : INITIAL_CLOTHING;
  });

  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>(() => {
    const cached = localStorage.getItem("couture_cosmetics");
    return cached ? JSON.parse(cached) : INITIAL_COSMETICS;
  });

  const [makeupLooks, setMakeupLooks] = useState<MakeupLook[]>(() => {
    const cached = localStorage.getItem("couture_makeup_looks");
    return cached ? JSON.parse(cached) : INITIAL_MAKEUP_LOOKS;
  });

  const [outfits, setOutfits] = useState<OutfitScheme[]>(() => {
    const cached = localStorage.getItem("couture_outfits");
    return cached ? JSON.parse(cached) : INITIAL_OUTFITS;
  });

  const [plans, setPlans] = useState<CalendarDayPlan[]>(() => {
    const cached = localStorage.getItem("couture_plans");
    return cached ? JSON.parse(cached) : INITIAL_CALENDAR;
  });

  useEffect(() => { localStorage.setItem("couture_clothing", JSON.stringify(clothing)); }, [clothing]);
  useEffect(() => { localStorage.setItem("couture_cosmetics", JSON.stringify(cosmetics)); }, [cosmetics]);
  useEffect(() => { localStorage.setItem("couture_makeup_looks", JSON.stringify(makeupLooks)); }, [makeupLooks]);
  useEffect(() => { localStorage.setItem("couture_outfits", JSON.stringify(outfits)); }, [outfits]);
  useEffect(() => { localStorage.setItem("couture_plans", JSON.stringify(plans)); }, [plans]);

  const handleAddClothing = (item: ClothingItem) => setClothing([item, ...clothing]);
  const handleRemoveClothing = (id: string) => setClothing(clothing.filter((c) => c.id !== id));

  const handleAddOutfit = (outfit: OutfitScheme) => setOutfits([outfit, ...outfits]);
  const handleRemoveOutfit = (id: string) => setOutfits(outfits.filter((o) => o.id !== id));

  const handleIncrementItemWear = (itemId: string, diff: number) => {
    setClothing((prev) =>
      prev.map((c) => c.id === itemId ? { ...c, wearCount: Math.max(0, c.wearCount + diff) } : c)
    );
  };

  const handleIncrementOutfitWear = (outfitId: string, diff: number) => {
    setOutfits((prev) =>
      prev.map((o) => o.id === outfitId ? { ...o, wearCount: Math.max(0, o.wearCount + diff) } : o)
    );
  };

  const handleAddCosmetic = (item: CosmeticItem) => setCosmetics([item, ...cosmetics]);
  const handleRemoveCosmetic = (id: string) => setCosmetics(cosmetics.filter((c) => c.id !== id));

  const handleAddMakeupLook = (look: MakeupLook) => setMakeupLooks([look, ...makeupLooks]);
  const handleRemoveMakeupLook = (id: string) => setMakeupLooks(makeupLooks.filter((l) => l.id !== id));

  const handleUpdatePlan = (updatedPlan: CalendarDayPlan) => {
    const originalPlan = plans.find((p) => p.date === updatedPlan.date);
    const outfitScheduledFreshly = updatedPlan.outfitId && (!originalPlan || originalPlan.outfitId !== updatedPlan.outfitId);

    if (outfitScheduledFreshly) {
      setOutfits((currentOutfits) =>
        currentOutfits.map((out) =>
          out.id === updatedPlan.outfitId ? { ...out, wearCount: out.wearCount + 1 } : out
        )
      );
      const scheduledOutfit = outfits.find((o) => o.id === updatedPlan.outfitId);
      if (scheduledOutfit) {
        setClothing((currentClothing) =>
          currentClothing.map((item) =>
            scheduledOutfit.itemIds.includes(item.id) ? { ...item, wearCount: item.wearCount + 1 } : item
          )
        );
      }
    }

    const exists = plans.some((p) => p.date === updatedPlan.date);
    if (exists) {
      setPlans(plans.map((p) => (p.date === updatedPlan.date ? updatedPlan : p)));
    } else {
      setPlans([...plans, updatedPlan]);
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case "calendar":
        return <CalendarPage plans={plans} outfits={outfits} clothing={clothing} makeupLooks={makeupLooks} onUpdatePlan={handleUpdatePlan} />;
      case "wardrobe":
        return <WardrobePage clothing={clothing} onAddClothing={handleAddClothing} onRemoveClothing={handleRemoveClothing} />;
      case "studio":
        return <StudioPage clothing={clothing} outfits={outfits} makeupLooks={makeupLooks} onAddOutfit={handleAddOutfit} onRemoveOutfit={handleRemoveOutfit} onIncrementItemWear={handleIncrementItemWear} onIncrementOutfitWear={handleIncrementOutfitWear} />;
      case "cosmetics":
        return <CosmeticsPage cosmetics={cosmetics} makeupLooks={makeupLooks} onAddCosmetic={handleAddCosmetic} onRemoveCosmetic={handleRemoveCosmetic} onAddMakeupLook={handleAddMakeupLook} onRemoveMakeupLook={handleRemoveMakeupLook} />;
      case "profile":
        return <ProfilePage clothing={clothing} cosmetics={cosmetics} outfits={outfits} />;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-white text-[#111111] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-5 py-4 flex items-center justify-between bg-white border-b border-[#EBEBEB]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#111111] leading-none">Wardroby</h1>
            <p className="text-[10px] text-[#AAAAAA] tracking-wider">智能穿搭美妆助手</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-4">
        <div className="animate-in">{renderPage()}</div>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="flex-shrink-0 bg-white/95 backdrop-blur-lg border-t border-[#EBEBEB] safe-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;

            if (tab.isCenter) {
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className="relative -mt-2 flex flex-col items-center"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isActive ? "bg-[#111111] scale-105" : "bg-[#555555] hover:bg-[#111111]"
                  }`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-[10px] mt-1 font-medium tracking-wide ${
                    isActive ? "text-[#111111] font-semibold" : "text-[#AAAAAA]"
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className="flex flex-col items-center gap-0.5 py-1 transition-all duration-200 active:scale-95"
              >
                <Icon className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? "text-[#111111]" : "text-[#AAAAAA]"
                }`} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${
                  isActive ? "text-[#111111] font-semibold" : "text-[#AAAAAA]"
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
