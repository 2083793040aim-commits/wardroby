import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, Sparkles, CheckCircle, CalendarRange, Trash2 } from "lucide-react";
import { CalendarDayPlan, ClothingItem, OutfitScheme, MakeupLook } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CalendarPageProps {
  plans: CalendarDayPlan[];
  outfits: OutfitScheme[];
  clothing: ClothingItem[];
  makeupLooks: MakeupLook[];
  onUpdatePlan: (plan: CalendarDayPlan) => void;
}

export default function CalendarPage({ plans, outfits, clothing, makeupLooks, onUpdatePlan }: CalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState("2026-05-20");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState("");
  const [activityTime, setActivityTime] = useState("09:00");

  const baseDay = new Date("2026-05-20T00:00:00Z");
  const datesList: string[] = [];
  for (let i = -6; i <= 7; i++) {
    const d = new Date(baseDay);
    d.setDate(baseDay.getDate() + i);
    datesList.push(d.toISOString().split("T")[0]);
  }

  const selectedPlan: CalendarDayPlan = plans.find((p) => p.date === selectedDate) || { date: selectedDate, activities: [], outfitId: undefined };
  const selectedOutfit = outfits.find((o) => o.id === selectedPlan.outfitId);
  const selectedMakeup = selectedOutfit ? makeupLooks.find((m) => m.id === selectedOutfit.makeupLookId) : null;
  const selectedClothingItems = selectedOutfit ? clothing.filter((c) => selectedOutfit.itemIds.includes(c.id)) : [];

  const handlePrevDate = () => {
    const idx = datesList.indexOf(selectedDate);
    if (idx > 0) setSelectedDate(datesList[idx - 1]);
  };
  const handleNextDate = () => {
    const idx = datesList.indexOf(selectedDate);
    if (idx < datesList.length - 1) setSelectedDate(datesList[idx + 1]);
  };

  const handleAddActivity = () => {
    if (!newActivity.trim()) return;
    const itemWithTime = `${activityTime} | ${newActivity.trim()}`;
    onUpdatePlan({ ...selectedPlan, activities: [...(selectedPlan.activities || []), itemWithTime] });
    setNewActivity("");
    setShowAddActivity(false);
  };

  const handleRemoveActivity = (index: number) => {
    onUpdatePlan({ ...selectedPlan, activities: (selectedPlan.activities || []).filter((_, i) => i !== index) });
  };

  const handleAssignOutfit = (outfitId: string) => {
    onUpdatePlan({ ...selectedPlan, outfitId });
  };

  const getWeekday = (dateStr: string) => {
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return weekdays[new Date(dateStr).getUTCDay()];
  };
  const getDay = (dateStr: string) => dateStr.split("-")[2];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif italic font-semibold text-[#111111]">穿搭日程计划</h1>
          <p className="text-xs text-[#AAAAAA] mt-0.5">安排每天的风格，管理闪耀时刻</p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[#F5F5F5] text-[#111111] hover:bg-[#EBEBEB] transition"
        >
          <CalendarRange className="w-3.5 h-3.5" />
          {isExpanded ? "收起" : "周视图"}
        </button>
      </div>

      {/* Date Strip */}
      <div className="bg-white rounded-2xl p-4 border border-[#EBEBEB]">
        <AnimatePresence mode="popLayout">
          {isExpanded ? (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3">
              <div className="text-[10px] font-semibold text-[#AAAAAA] flex items-center justify-between pb-2 border-b border-[#EBEBEB]">
                <span>全周穿搭概览</span>
                <span className="font-mono">May 2026</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {datesList.slice(3, 10).map((dStr) => {
                  const dayPlan = plans.find((p) => p.date === dStr);
                  const planOutfit = dayPlan ? outfits.find((o) => o.id === dayPlan.outfitId) : null;
                  const isCur = dStr === selectedDate;
                  return (
                    <button
                      key={dStr}
                      onClick={() => setSelectedDate(dStr)}
                      className={`flex flex-col items-center justify-between p-2.5 rounded-xl border text-center transition min-h-[88px] ${
                        isCur ? "bg-[#111111] border-[#111111] text-white" : "bg-[#F5F5F5] border-[#EBEBEB] text-[#111111] hover:bg-white"
                      }`}
                    >
                      <span className="text-[10px] opacity-70">周{getWeekday(dStr)}</span>
                      <span className="text-base font-bold">{getDay(dStr)}</span>
                      <div className="w-full flex justify-center">
                        {planOutfit ? (
                          <span className={`inline-block w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold ${isCur ? "bg-white/20 text-white" : "bg-[#2D8B4E] text-white"}`}>✓</span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DDDDDD]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-between">
              <button onClick={handlePrevDate} className="p-1.5 rounded-lg hover:bg-[#F5F5F5] transition">
                <ChevronLeft className="w-4 h-4 text-[#777777]" />
              </button>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1 justify-center">
                {datesList.slice(2, 11).map((dStr) => {
                  const isSelected = dStr === selectedDate;
                  const hasOutfit = plans.some((p) => p.date === dStr && p.outfitId);
                  return (
                    <button
                      key={dStr}
                      onClick={() => setSelectedDate(dStr)}
                      className={`flex flex-col items-center min-w-[46px] py-1.5 rounded-xl transition relative ${
                        isSelected ? "bg-[#111111] text-white shadow-sm" : "text-[#777777] hover:bg-[#F5F5F5]"
                      }`}
                    >
                      <span className="text-[10px]">周{getWeekday(dStr)}</span>
                      <span className="text-sm font-bold leading-tight mt-0.5">{getDay(dStr)}</span>
                      {hasOutfit && <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-[#111111]" : "bg-[#111111]"}`} />}
                    </button>
                  );
                })}
              </div>
              <button onClick={handleNextDate} className="p-1.5 rounded-lg hover:bg-[#F5F5F5] transition">
                <ChevronRight className="w-4 h-4 text-[#777777]" />
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Daily Schedule */}
      <div className="bg-white rounded-2xl p-4 border border-[#EBEBEB]">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[#111111]" />
          <h3 className="text-sm font-semibold text-[#111111] flex-1">当日日程安排</h3>
          {!showAddActivity ? (
            <button onClick={() => setShowAddActivity(true)} className="w-6 h-6 rounded-full border border-dashed border-[#AAAAAA] flex items-center justify-center text-[#AAAAAA] hover:border-[#111111] hover:text-[#111111] transition flex-shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={() => setShowAddActivity(false)} className="w-6 h-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#777777] hover:bg-[#EBEBEB] transition flex-shrink-0 text-sm leading-none">×</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {(selectedPlan.activities || []).length > 0 ? (
            selectedPlan.activities.map((act, index) => {
              const parts = act.split(" | ");
              const time = parts.length > 1 ? parts[0] : "全天";
              const text = parts.length > 1 ? parts[1] : act;
              return (
                <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] border border-[#EBEBEB] rounded-full text-[11px] group">
                  <span className="text-[10px] font-mono font-bold text-[#111111] bg-[#FFFFFF] px-1.5 py-0.5 rounded-full">{time}</span>
                  <span className="text-[#111111] font-medium">{text}</span>
                  <button onClick={() => handleRemoveActivity(index)} className="text-[#AAAAAA] hover:text-[#C04040] transition ml-0.5">x</button>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-[#AAAAAA] italic">暂无安排</span>
          )}
        </div>
        {showAddActivity && (
          <div className="flex items-center gap-2">
            <input type="time" value={activityTime} onChange={(e) => setActivityTime(e.target.value)} className="bg-[#F5F5F5] border-0 rounded-full px-3 py-1.5 text-xs text-[#111111] focus:outline-none font-mono" />
            <input type="text" placeholder="添加行程..." value={newActivity} onChange={(e) => setNewActivity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddActivity()} className="flex-1 bg-[#F5F5F5] border-0 rounded-full px-3 py-1.5 text-xs text-[#111111] focus:outline-none placeholder-[#AAAAAA]" />
            <button onClick={handleAddActivity} className="px-4 py-1.5 bg-[#111111] text-white rounded-full text-xs font-semibold hover:bg-black transition flex items-center gap-1 flex-shrink-0">
              <Plus className="w-3 h-3" />添加
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-5 border border-[#EBEBEB]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EBEBEB] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#111111] text-white flex items-center justify-center font-mono font-bold text-base">{getDay(selectedDate)}</div>
                <div>
                  <h2 className="text-base font-semibold text-[#111111]">周{getWeekday(selectedDate)} 穿搭方案</h2>
                  <p className="text-[10px] text-[#AAAAAA] font-mono">{selectedDate}</p>
                </div>
              </div>
              {selectedOutfit && (
                <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-[#2D8B4E]/10 text-[#2D8B4E] border border-[#2D8B4E]/20 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />已安排
                </span>
              )}
            </div>

            {selectedOutfit ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#F5F5F5] rounded-xl border border-[#EBEBEB]">
                  <span className="text-[9px] text-[#111111] font-bold uppercase tracking-widest block mb-1">Selected Combination</span>
                  <h3 className="font-bold text-[#111111] text-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#111111]" />{selectedOutfit.name}
                  </h3>
                  <p className="text-[11px] text-[#777777] mt-1.5 leading-relaxed">{selectedOutfit.rationale}</p>
                  {selectedMakeup && (
                    <div className="mt-3 pt-3 border-t border-[#EBEBEB] flex items-center gap-2 text-xs">
                      <span className="text-[9px] bg-[#F5F5F5] text-[#111111] font-bold px-1.5 py-0.5 rounded">搭配妆容</span>
                      <span className="font-bold text-[#111111]">{selectedMakeup.name}</span>
                    </div>
                  )}
                </div>

                {/* Visual Layout */}
                <div>
                  <h4 className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-2">配装方案图</h4>
                  <div className="w-full h-56 rounded-xl relative overflow-hidden border border-[#EBEBEB] flex items-center justify-center p-4" style={{ background: selectedOutfit.background.value }}>
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#111111 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    {selectedOutfit.placements && selectedOutfit.placements.length > 0 ? (
                      selectedOutfit.placements.map((placed) => {
                        const item = clothing.find((c) => c.id === placed.itemId);
                        if (!item) return null;
                        return (
                          <div key={placed.itemId} className="absolute bg-white rounded-xl p-1.5 shadow-md border border-[#EBEBEB] flex flex-col items-center max-w-[70px]" style={{ left: `${placed.x}%`, top: `${placed.y}%`, transform: `translate(-50%, -50%) scale(${placed.scale * 0.82}) rotate(${placed.rotate}deg)` }}>
                            <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-md" referrerPolicy="no-referrer" />
                            <span className="text-[8px] font-bold text-center mt-0.5 truncate w-full text-[#111111]">{item.name}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex -space-x-4 items-center justify-center">
                        {selectedClothingItems.map((item, index) => (
                          <div key={item.id} style={{ transform: `rotate(${(index - 1) * 8}deg)` }} className="w-20 h-28 bg-white border border-[#EBEBEB] rounded-xl p-1 shadow-lg">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Item List */}
                <div>
                  <h4 className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-2">包含单品 ({selectedClothingItems.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedClothingItems.map((item) => (
                      <div key={item.id} className="bg-[#F5F5F5] p-2 rounded-xl border border-[#EBEBEB] flex items-center gap-2">
                        <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover bg-stone-200 flex-shrink-0" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-[#111111] truncate">{item.name}</p>
                          <p className="text-[9px] text-[#AAAAAA] truncate">{item.brand} - {item.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => onUpdatePlan({ ...selectedPlan, outfitId: undefined })} className="w-full py-2.5 text-xs font-semibold text-[#C04040] border border-[#C04040]/30 rounded-full hover:bg-[#C04040]/5 transition">
                  取消今日穿搭计划
                </button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-[#111111]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#111111]">今天还没有安排穿搭</h3>
                  <p className="text-[11px] text-[#AAAAAA] mt-1 max-w-xs mx-auto">选择已有的穿搭方案，或在灵感室中设计新的搭配装入日程</p>
                </div>
                {outfits.length > 0 && (
                  <div className="space-y-2 max-w-sm mx-auto pt-2 text-left">
                    <span className="text-[10px] font-bold text-[#AAAAAA] uppercase tracking-wider block">选择搭配方案：</span>
                    <div className="divide-y divide-[#EBEBEB] bg-[#F5F5F5] rounded-xl border border-[#EBEBEB] max-h-[140px] overflow-y-auto">
                      {outfits.map((out) => (
                        <button key={out.id} onClick={() => handleAssignOutfit(out.id)} className="w-full text-left p-2.5 rounded-lg hover:bg-white transition text-xs font-semibold flex items-center justify-between">
                          <span className="text-[#111111] truncate mr-2">{out.name}</span>
                          <span className="text-[10px] text-[#111111] flex-shrink-0">选择</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-[#F5F5F5] rounded-2xl p-5 border border-[#EBEBEB] space-y-3">
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#DDDDDD] text-[#777777]">Aesthetic Guide</span>
            <div>
              <h4 className="text-sm font-semibold text-[#111111]">极简胶囊美学日志</h4>
              <p className="text-[11px] text-[#777777] mt-1.5 leading-relaxed">高质感穿搭的秘诀在于每一次组合所形成的协调气场。通过日程提前勾勒色调，让每一日都充满从容。</p>
            </div>
            <div className="pt-2 border-t border-[#EBEBEB] text-[10px] text-[#111111] font-semibold">
              Tip: 维持燕麦色、杏白、海盐蓝的穿插呼应
            </div>
          </div>
          <div className="bg-[#F5F5F5] rounded-2xl p-5 border border-[#EBEBEB] space-y-2">
            <h4 className="text-sm font-semibold text-[#111111]">功能指引</h4>
            <ul className="text-[11px] text-[#777777] space-y-1.5 leading-relaxed">
              <li>- 一键规划每日重要出行场景</li>
              <li>- 多件单品互动贴片直观查阅</li>
              <li>- 自动汇总配装所需细节</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
