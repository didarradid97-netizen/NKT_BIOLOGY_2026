// ============================================
// 🏆 GLOBAL RATING — Қазақстан рейтингі
// ============================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getGlobalRating, getMyRank, updateMyRating } from "@/lib/ratingStorage";
import { getTestResults } from "@/lib/customTestStorage";
import { getDailyState } from "@/lib/dailyMissions";
import {
  Globe, ArrowLeft, Trophy, Medal, Crown, Zap, Flame,
  Star, TrendingUp, User,
} from "lucide-react";

export default function GlobalRating() {
  const navigate = useNavigate();
  const [rating, setRating] = useState<any[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [filter, setFilter] = useState<"all" | "week" | "streak">("all");

  useEffect(() => {
    const r = getGlobalRating();
    const results = getTestResults();
    const daily = getDailyState();
    const totalTests = results.length;
    const totalCorrect = results.reduce((s, t) => s + t.score, 0);
    const totalQ = results.reduce((s, t) => s + t.total, 0);
    const score = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
    const xp = daily.streak * 100 + totalTests * 50 + totalCorrect * 10;

    updateMyRating("Сен", score, totalTests, daily.streak, xp);
    setRating(getGlobalRating());
    setMyRank(getMyRank());
  }, []);

  const filtered = rating.slice(0, 100);

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] flex flex-col">
      <Navbar />
      <div className="max-w-[800px] mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#f59e0b]/20">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">🏆 Global Rating</h1>
          <p className="text-sm text-[#94a3b8]">Қазақстан оқушыларының рейтингі</p>
        </div>

        {/* My rank */}
        {myRank > 0 && (
          <div className="bg-gradient-to-r from-[#f59e0b]/10 to-[#fbbf24]/10 border border-[#f59e0b]/20 rounded-2xl p-5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#f59e0b]/20 flex items-center justify-center text-[#fbbf24] font-bold">{myRank}</div>
              <div>
                <p className="text-sm font-bold">Сенің орның</p>
                <p className="text-xs text-[#94a3b8]">{myRank} / {rating.length} оқушы</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#fbbf24]">{myRank <= 10 ? "🔥 Топ 10!" : myRank <= 50 ? "💪 Топ 50" : "📈 Прогресс бар"}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(["all", "week", "streak"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/20" : "bg-white/[0.04] text-[#94a3b8] border border-white/[0.08] hover:bg-white/[0.06]"}`}>
              {f === "all" ? "Барлығы" : f === "week" ? "Апта" : "Streak"}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.map((entry, i) => {
            const isMe = entry.name === "Сен";
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isMe ? "bg-[#f59e0b]/5 border-[#f59e0b]/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? "bg-[#fbbf24]/20 text-[#fbbf24]" : i === 1 ? "bg-gray-300/20 text-gray-300" : i === 2 ? "bg-[#cd7f32]/20 text-[#cd7f32]" : "bg-white/[0.06] text-[#64748b]"}`}>
                  {i < 3 ? <Crown className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <img src={entry.avatar} alt="" className="w-8 h-8 rounded-full bg-white/[0.06]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.name} {isMe && <span className="text-[#f59e0b] text-[10px]">(Сен)</span>}</p>
                  <p className="text-[10px] text-[#64748b]">{entry.testsCompleted} тест • {entry.streak} streak</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#fbbf24]">{entry.xp.toLocaleString()} XP</p>
                  <p className="text-[10px] text-[#64748b]">{entry.score}% дұрыс</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-[#64748b]">
          <p>💡 Көбірек тест тапсыр, streak сақта — рейтинг көтерілесің!</p>
        </div>
      </div>
    </div>
  );
}
