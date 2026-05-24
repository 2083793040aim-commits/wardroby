import { useState } from "react";
import { Crown, AlertTriangle, Sparkles } from "lucide-react";
import { ClothingItem, CosmeticItem, OutfitScheme } from "../types";

interface ProfilePageProps {
  clothing: ClothingItem[];
  cosmetics: CosmeticItem[];
  outfits: OutfitScheme[];
}

export default function ProfilePage({ clothing, cosmetics, outfits }: ProfilePageProps) {
  const [showVipModal, setShowVipModal] = useState(false);

  const totalItems = clothing.length;
  const totalOutfits = outfits.length;
  const totalCosmetics = cosmetics.length;

  const mostWorn = clothing.length > 0 ? [...clothing].sort((a, b) => b.wearCount - a.wearCount)[0] : null;
  const avgWear = clothing.length > 0 ? Math.round(clothing.reduce((acc, c) => acc + c.wearCount, 0) / clothing.length * 10) / 10 : 0;
  const expiringCosmetics = cosmetics.filter((c) => c.remainingDays < 90);

  return (
    <div className="space-y-5">
      {/* Profile Banner */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#111111] to-[#555555] p-0.5 shadow-md flex-shrink-0">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="text-3xl font-serif italic font-semibold text-[#111111]">A</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-serif italic font-semibold text-[#111111]">Aveline Somerset</h2>
              <span className="text-[10px] bg-[#F5F5F5] text-[#111111] border border-[#111111]/20 px-2 py-0.5 rounded-full font-bold">V4 认证会员</span>
            </div>
            <p className="text-xs text-[#777777] max-w-md">删繁就简，用质感和细节堆砌自我的轻古典浪漫主义</p>
            <button onClick={() => setShowVipModal(true)} className="px-4 py-1.5 bg-[#111111] text-white text-[10px] font-bold rounded-full hover:bg-[#333333] transition inline-flex items-center gap-1">
              <Crown className="w-3 h-3" />查看勋章
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#F5F5F5] rounded-2xl border border-[#EBEBEB] p-5 space-y-3">
          <h3 className="text-sm font-serif italic font-semibold text-[#111111]">珍藏配比</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[#777777]">库内服饰</span><span className="font-bold">{totalItems} 件</span></div>
            <div className="flex justify-between"><span className="text-[#777777]">穿搭方案</span><span className="font-bold">{totalOutfits} 款</span></div>
            <div className="flex justify-between"><span className="text-[#777777]">单衣平均穿着率</span><span className="font-bold">{avgWear} 次/件</span></div>
            <div className="pt-2">
              <span className="text-[10px] text-[#AAAAAA] block mb-1">流转指数 84%</span>
              <div className="w-full h-1.5 bg-[#DDDDDD] rounded-full overflow-hidden">
                <div className="h-full bg-[#111111] rounded-full" style={{ width: "84%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F5F5F5] rounded-2xl border border-[#EBEBEB] p-5 space-y-3">
          <h3 className="text-sm font-serif italic font-semibold text-[#111111]">最高频明星单品</h3>
          {mostWorn ? (
            <div className="flex items-center gap-3">
              <img src={mostWorn.image} alt={mostWorn.name} className="w-16 h-20 object-cover rounded-xl border border-[#EBEBEB]" referrerPolicy="no-referrer" />
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] text-[#111111] font-bold">{mostWorn.brand}</span>
                <p className="text-xs font-bold text-[#111111] truncate">{mostWorn.name}</p>
                <p className="text-[10px] text-[#777777] font-mono">已穿 <span className="text-[#111111] font-bold font-serif text-base">{mostWorn.wearCount}</span> 次</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#AAAAAA] italic">暂无穿着数据</p>
          )}
        </div>

        <div className="bg-[#F5F5F5] rounded-2xl border border-[#EBEBEB] p-5 space-y-3">
          <h3 className="text-sm font-serif italic font-semibold text-[#111111]">美妆保质提醒</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[#777777]">化妆单品</span><span className="font-bold">{totalCosmetics} 件</span></div>
            <div className={`p-3 rounded-xl flex gap-2 items-start ${expiringCosmetics.length > 0 ? "bg-[#777777]/10 border border-[#777777]/30" : "bg-[#2D8B4E]/10 border border-[#2D8B4E]/30"}`}>
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${expiringCosmetics.length > 0 ? "text-[#777777]" : "text-[#2D8B4E]"}`} />
              <span className="text-[10px] leading-relaxed">
                {expiringCosmetics.length > 0 ? <><span className="font-bold">{expiringCosmetics.length}</span> 件美妆不足90天，请优先消耗</> : "所有美妆寿命充足"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Style Report & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 space-y-3">
          <span className="text-[9px] font-bold text-[#111111] uppercase tracking-wider">Style Manifesto</span>
          <h3 className="text-lg font-serif italic font-semibold text-[#111111]">美学风格评估报告</h3>
          <p className="text-xs text-[#777777] leading-relaxed">你的衣柜包含海盐蓝衬衫、驼色毛呢大衣、大地色眼妆等，展现出高级清冷与极简通勤的双重追求。</p>
          <p className="text-[11px] text-[#AAAAAA] italic">智能推荐：深灰直筒羊毛西服裤将使匹配度大幅提升。</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 space-y-3">
          <span className="text-[9px] font-bold text-[#111111] uppercase tracking-wider">Preferences</span>
          <h3 className="text-lg font-serif italic font-semibold text-[#111111]">偏好设置与状态</h3>
          <div className="space-y-2 text-xs divide-y divide-[#EBEBEB]">
            <div className="flex items-center justify-between py-2">
              <span className="text-[#777777]">相机模拟</span>
              <span className="text-[10px] font-mono font-bold bg-[#F5F5F5] px-2 py-0.5 rounded">3s 倒计时</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#777777]">API 连接状态</span>
              <span className="text-[10px] font-mono font-bold text-[#2D8B4E] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#2D8B4E]" />就绪</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#777777]">本地存储</span>
              <span className="text-[10px] font-mono font-bold text-[#111111]">LocalStorage 已激活</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIP Modal */}
      {showVipModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#EBEBEB] p-6 text-center max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center text-3xl mx-auto">&#x1f451;</div>
            <div>
              <h3 className="text-lg font-serif italic font-semibold text-[#111111]">Ethereal VIP 认证</h3>
              <p className="text-xs text-[#777777] mt-1">通过高级面部设计和衣物排版，您解锁了法式自然古典流派。</p>
            </div>
            <div className="py-2.5 bg-white border border-[#EBEBEB] rounded-xl font-mono text-xs text-[#111111] font-bold tracking-wider">AESTHETIC GRADE: COUTURE SUPREME</div>
            <button onClick={() => setShowVipModal(false)} className="w-full py-2.5 bg-[#111111] text-white rounded-full text-xs font-bold tracking-wider hover:bg-black transition">继续保持风尚</button>
          </div>
        </div>
      )}
    </div>
  );
}
