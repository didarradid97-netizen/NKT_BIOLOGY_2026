import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { isAuthenticated } from "@/lib/auth";
import {
  getGamifyState,
  checkStreak,
  checkAchievements,
  ACHIEVEMENTS,
  getXPForNextLevel,
} from "@/lib/gamification";
import {
  ArrowLeft,
  Trophy,
  Flame,
  Star,
  Target,
  Zap,
  Lock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function GamificationPage() {
  const navigate = useNavigate();
  const [state, setState] = useState(getGamifyState());
  const [newAchv, setNewAchv] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const fresh = checkStreak();
    const { newAchievements } = checkAchievements();
    setState(fresh);
    setNewAchv(newAchievements);
  }, [navigate]);

  const xpCurrent = state.xp;
  const xpNext = getXPForNextLevel(state.level);
  const xpPrev = getXPForNextLevel(state.level - 1);
  const xpProgress = ((xpCurrent - xpPrev) / (xpNext - xpPrev)) * 100;

  const achievedIds = new Set(state.achievements);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Профильге оралу
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#f59e0b]/20">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Геймификация</h1>
          <p className="text-white/50 mt-1">XP жина, деңгей көтер, жетістік ал!</p>
        </div>

        {/* XP & Level */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-white/40">Деңгей</div>
              <div className="text-4xl font-bold text-[#f59e0b]">{state.level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/40">XP</div>
              <div className="text-2xl font-bold">{state.xp.toLocaleString()}</div>
            </div>
          </div>

          <div className="mb-2 flex justify-between text-xs text-white/40">
            <span>{xpCurrent - xpPrev} / {xpNext - xpPrev} XP</span>
            <span>Деңгей {state.level + 1}</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#f59e0b] to-[#10b981] rounded-full transition-all"
              style={{ width: `${Math.max(0, Math.min(100, xpProgress))}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <Flame className="w-8 h-8 text-[#ef4444] mx-auto mb-2" />
            <div className="text-3xl font-bold">{state.streak}</div>
            <div className="text-sm text-white/40">Күн streak</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <Target className="w-8 h-8 text-[#10b981] mx-auto mb-2" />
            <div className="text-3xl font-bold">{state.testsCompleted}</div>
            <div className="text-sm text-white/40">Тапсырған тест</div>
          </div>
        </div>

        {/* New Achievements */}
        {newAchv.length > 0 && (
          <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-2xl p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-2 mb-2 text-[#6ee7b7] font-semibold">
              <Sparkles className="w-5 h-5" />
              Жаңа жетістіктер!
            </div>
            <div className="flex flex-wrap gap-2">
              {newAchv.map((a) => (
                <span key={a.id} className="px-3 py-1 bg-[#10b981]/20 rounded-full text-sm text-[#6ee7b7]">
                  {a.icon} {a.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-[#f59e0b]" />
          Жетістіктер ({achievedIds.size}/{ACHIEVEMENTS.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = achievedIds.has(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition ${
                  unlocked
                    ? "bg-[#10b981]/10 border-[#10b981]/20"
                    : "bg-white/[0.03] border-white/[0.06] opacity-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    unlocked ? "bg-[#10b981]/15" : "bg-white/5"
                  }`}>
                    {unlocked ? ach.icon : <Lock className="w-4 h-4 text-white/30" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{ach.title}</div>
                    <div className="text-xs text-white/40">{ach.description}</div>
                  </div>
                  {unlocked && (
                    <Zap className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard Demo */}
        <h2 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#f59e0b]" />
          Сынып рейтинг (Demo)
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
          {[
            { name: "Айгерім", level: 15, xp: 2400, rank: 1 },
            { name: "Нұрислам", level: 12, xp: 1840, rank: 3 },
            { name: "Данияр", level: 14, xp: 2100, rank: 2 },
            { name: "Аружан", level: 10, xp: 1500, rank: 4 },
            { name: "Ердәулет", level: 8, xp: 1200, rank: 5 },
          ].map((u, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${
              u.name === "Нұрислам" ? "bg-[#10b981]/10 border border-[#10b981]/20" : "bg-white/[0.03]"
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                u.rank === 1 ? "bg-[#f59e0b] text-white" : u.rank === 2 ? "bg-[#94a3b8] text-white" : u.rank === 3 ? "bg-[#b45309] text-white" : "bg-white/10 text-white/50"
              }`}>
                {u.rank}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{u.name} {u.name === "Нұрислам" ? "(Сіз)" : ""}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#f59e0b]">Lv. {u.level}</div>
                <div className="text-[10px] text-white/30">{u.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
