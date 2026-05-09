import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getLeaderboard, getRank, getLeague, RANKS, LEAGUES } from "@/lib/multiplayer";
import type { LeaderboardEntry } from "@/lib/multiplayer";
import {
  Trophy, Crown, Flame, Star, Target, Swords,
  TrendingUp, ArrowLeft, Zap, Award,
} from "lucide-react";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "week" | "duel">("all");
  const [myId] = useState(() => {
    // Get current player ID from storage
    return "player_" + Math.random().toString(36).slice(2, 8);
  });

  useEffect(() => {
    setBoard(getLeaderboard());
  }, []);

  // Mock data if empty
  const displayBoard =
    board.length > 0
      ? board
      : [
          { playerId: "1", name: "Алдияр", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aldiyar", xp: 5200, wins: 45, totalBattles: 62, streak: 7, rank: "Алмаз", league: "Алтын лига" },
          { playerId: "2", name: "Айгуль", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aigul", xp: 4800, wins: 38, totalBattles: 55, streak: 5, rank: "Алмаз", league: "Алтын лига" },
          { playerId: "3", name: "Нұржан", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nurzhan", xp: 3500, wins: 28, totalBattles: 40, streak: 3, rank: "Платина", league: "Қызыл лига" },
          { playerId: "4", name: "Мадина", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Madina", xp: 2800, wins: 22, totalBattles: 35, streak: 4, rank: "Алтын", league: "Қызыл лига" },
          { playerId: "5", name: "Ерасыл", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yerasyl", xp: 1500, wins: 12, totalBattles: 20, streak: 2, rank: "Күміс", league: "Көк лига" },
          { playerId: myId, name: "Сен", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You", xp: 800, wins: 6, totalBattles: 12, streak: 1, rank: "Күміс", league: "Көк лига" },
        ];

  const myEntry = displayBoard.find((e) => e.playerId === myId);
  const myRank = displayBoard.findIndex((e) => e.playerId === myId) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">🏆 Leaderboard</h1>
          <p className="text-white/60">Үздіктер тізімі</p>
        </div>

        {/* My Stats */}
        {myEntry && (
          <div className="bg-gradient-to-r from-[#fbbf24]/10 to-[#f59e0b]/10 border border-[#fbbf24]/20 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-extrabold text-[#fbbf24]">#{myRank}</div>
              <img src={myEntry.avatar} alt="" className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <p className="font-bold">{myEntry.name} <span className="text-[#fbbf24] text-sm">(Сіз)</span></p>
                <div className="flex gap-3 text-xs text-white/50">
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {myEntry.streak}</span>
                  <span className="flex items-center gap-1"><Swords className="w-3 h-3 text-red-400" /> {myEntry.wins}W</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {myEntry.xp} XP</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: RANKS.find((r) => r.name === myEntry.rank)?.color || "#fff" }}>{myEntry.rank}</p>
                <p className="text-[10px] text-white/50">{myEntry.league}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(["all", "week", "duel"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? "bg-[#fbbf24]/15 text-[#fbbf24] border border-[#fbbf24]/20" : "bg-white/5 text-white/50 border border-white/10"}`}
            >
              {f === "all" ? "Барлығы" : f === "week" ? "Апта" : "Битва"}
            </button>
          ))}
        </div>

        {/* Leaderboard List */}
        <div className="space-y-2">
          {displayBoard.map((entry, i) => {
            const rank = RANKS.find((r) => r.name === entry.rank);
            const isMe = entry.playerId === myId;

            return (
              <div
                key={entry.playerId}
                className={`flex items-center gap-3 p-3 rounded-xl border transition ${isMe ? "bg-[#fbbf24]/5 border-[#fbbf24]/20" : "bg-white/5 border-white/10"}`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 3 ? "bg-[#fbbf24]/20 text-[#fbbf24]" : "bg-white/10 text-white/60"}`}>
                  {i < 3 ? <Crown className="w-4 h-4" /> : i + 1}
                </div>

                {/* Avatar */}
                <img src={entry.avatar} alt="" className="w-10 h-10 rounded-full bg-white/10" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {entry.name} {isMe && <span className="text-[#fbbf24]">(Сіз)</span>}
                  </p>
                  <div className="flex gap-2 text-[10px] text-white/50">
                    <span>{entry.totalBattles} битва</span>
                    <span>{entry.wins} жеңіс</span>
                  </div>
                </div>

                {/* XP & Rank */}
                <div className="text-right">
                  <p className="text-sm font-bold text-[#fbbf24]">{entry.xp.toLocaleString()} XP</p>
                  <p className="text-[10px]" style={{ color: rank?.color || "#fff" }}>{entry.rank}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leagues */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-3">🏆 Лигалар</h3>
          <div className="space-y-2">
            {LEAGUES.map((league, i) => (
              <div key={league.name} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i >= 3 ? "bg-[#fbbf24]/20" : "bg-white/10"}`}>
                  <Award className={`w-4 h-4 ${i >= 3 ? "text-[#fbbf24]" : "text-white/60"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{league.name}</p>
                </div>
                <p className="text-xs text-white/50">{league.min}+ XP</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/battle")}
            className="px-6 py-3 bg-gradient-to-r from-[#ef4444] to-[#f59e0b] text-white rounded-xl font-bold flex items-center gap-2 mx-auto hover:opacity-90 transition"
          >
            <Swords className="w-5 h-5" /> Битва бастау!
          </button>
        </div>

        <button onClick={() => navigate("/")} className="mt-6 flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>
      </div>
    </div>
  );
}
