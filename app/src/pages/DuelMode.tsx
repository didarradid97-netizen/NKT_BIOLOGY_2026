// ============================================
// ⚔️ DUEL MODE — Екі ойыншы онлайн жарыс
// ============================================
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Swords, ArrowLeft, Loader2, Zap, Trophy, Clock, Crown,
  User, ChevronRight, AlertCircle,
} from "lucide-react";

interface DuelPlayer {
  name: string;
  score: number;
  currentQ: number;
  answered: boolean;
}

const DUEL_QUESTIONS = [
  { q: "Жасушаның энергетикалық станциясы?", options: ["Митохондрия", "Ядро", "Рибосома", "Гольджи"], correct: 0 },
  { q: "Фотосинтезде оттегі бөлінетін фаза?", options: ["Жарық", "Кальвин", "Гликолиз", "Кребс"], correct: 0 },
  { q: "ДНҚ қос спиральын кім ашты?", options: ["Уотсон мен Крик", "Мендель", "Дарвин", "Линней"], correct: 0 },
  { q: "Мейоз нәтижесінде не түзіледі?", options: ["4 гаплоидты", "2 диплоидты", "4 диплоидты", "2 гаплоидты"], correct: 0 },
  { q: "Табиғи сұрыпталу авторы?", options: ["Дарвин", "Ламарк", "Мальтус", "Уоллес"], correct: 0 },
  { q: "Қан құрамындағы оттегі тасымалдаушы?", options: ["Гемоглобин", "Инсулин", "Адреналин", "Тромбин"], correct: 0 },
  { q: "Өсімдік теңізіндегі өндіруші?", options: ["Жасыл өсімдік", "Бактерия", "Зоопланктон", "Балық"], correct: 0 },
  { q: "Вирус құрылымында бар?", options: ["Капсид", "Митохондрия", "Ядро", "Рибосома"], correct: 0 },
];

export default function DuelMode() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"lobby" | "playing" | "finished">("lobby");
  const [playerName, setPlayerName] = useState("Сен");
  const [enemyName] = useState("AI Opponent");
  const [currentQ, setCurrentQ] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [enemyScore, setEnemyScore] = useState(0);
  const [myAnswered, setMyAnswered] = useState(false);
  const [enemyAnswered, setEnemyAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startDuel = () => {
    setPhase("playing");
    setCurrentQ(0);
    setMyScore(0);
    setEnemyScore(0);
    setMyAnswered(false);
    setEnemyAnswered(false);
    setSelectedOption(null);
    setTimeLeft(15);
    setStreak(0);
  };

  // Enemy AI simulation
  useEffect(() => {
    if (phase !== "playing" || enemyAnswered) return;
    const delay = 2000 + Math.random() * 5000; // 2-7 seconds
    const t = setTimeout(() => {
      const correct = Math.random() > 0.3; // 70% accuracy
      setEnemyScore((s) => s + (correct ? 1 : 0));
      setEnemyAnswered(true);
    }, delay);
    return () => clearTimeout(t);
  }, [phase, currentQ, enemyAnswered]);

  // Timer
  useEffect(() => {
    if (phase !== "playing" || myAnswered) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setMyAnswered(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, currentQ, myAnswered]);

  const handleAnswer = (idx: number) => {
    if (myAnswered || phase !== "playing") return;
    setMyAnswered(true);
    setSelectedOption(idx);
    const isCorrect = idx === DUEL_QUESTIONS[currentQ].correct;
    if (isCorrect) {
      setMyScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  // Next question
  useEffect(() => {
    if (phase !== "playing") return;
    if (myAnswered && enemyAnswered) {
      const t = setTimeout(() => {
        if (currentQ >= DUEL_QUESTIONS.length - 1) {
          setPhase("finished");
          return;
        }
        setCurrentQ((q) => q + 1);
        setMyAnswered(false);
        setEnemyAnswered(false);
        setSelectedOption(null);
        setTimeLeft(15);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [myAnswered, enemyAnswered, phase, currentQ]);

  const q = DUEL_QUESTIONS[currentQ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] flex flex-col">
      <Navbar />
      <div className="max-w-[800px] mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>

        {/* LOBBY */}
        {phase === "lobby" && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ef4444] to-[#f59e0b] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#ef4444]/20">
              <Swords className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">⚔️ Duel Mode</h1>
            <p className="text-sm text-[#94a3b8] mb-8">Кім тез жауап береді? AI қарсыласпен жарыс!</p>
            <div className="max-w-sm mx-auto mb-6">
              <label className="text-xs text-[#64748b] mb-2 block">Атыңыз</label>
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#ef4444]/50"
                placeholder="Атыңыз"
              />
            </div>
            <button onClick={startDuel} className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#f59e0b] text-white font-bold text-lg shadow-lg shadow-[#ef4444]/20 flex items-center gap-2 mx-auto">
              <Swords className="w-5 h-5" /> Duel бастау!
            </button>
          </div>
        )}

        {/* PLAYING */}
        {phase === "playing" && q && (
          <div>
            {/* Scoreboard */}
            <div className="flex items-center justify-between mb-6 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981] font-bold text-sm">{playerName[0]}</div>
                <div>
                  <p className="text-xs font-bold">{playerName}</p>
                  <p className="text-xs text-[#10b981]">{myScore} дұрыс</p>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-mono font-bold ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-[#f59e0b]"}`}>
                  <Clock className="w-4 h-4 inline mr-1" />{timeLeft}
                </div>
                <p className="text-[10px] text-[#64748b]">{currentQ + 1}/{DUEL_QUESTIONS.length}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold">{enemyName}</p>
                  <p className="text-xs text-[#f59e0b]">{enemyScore} дұрыс</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] font-bold text-sm">AI</div>
              </div>
            </div>

            {/* Streak */}
            {streak >= 2 && (
              <div className="text-center mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f59e0b]/15 text-[#fbbf24] text-xs font-bold border border-[#f59e0b]/20">
                  <Zap className="w-3 h-3" /> {streak} streak!
                </span>
              </div>
            )}

            {/* Question */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 mb-4">
              <h2 className="text-lg font-bold mb-4 text-center">{q.q}</h2>
              <div className="space-y-3">
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === q.correct;
                  const isSelected = selectedOption === idx;
                  let btnClass = "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ";
                  if (myAnswered) {
                    if (isCorrect) btnClass += "bg-[#10b981]/10 border-[#10b981]/40";
                    else if (isSelected) btnClass += "bg-red-500/10 border-red-500/40";
                    else btnClass += "bg-white/[0.02] border-white/[0.06] opacity-50";
                  } else {
                    btnClass += "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06] cursor-pointer";
                  }
                  return (
                    <button key={idx} onClick={() => handleAnswer(idx)} disabled={myAnswered} className={btnClass}>
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${myAnswered && isCorrect ? "bg-[#10b981] text-white" : myAnswered && isSelected ? "bg-red-400 text-white" : "bg-white/[0.06] text-[#64748b]"}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm">{opt}</span>
                      {myAnswered && isCorrect && <Zap className="w-4 h-4 text-[#10b981] ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {myAnswered && !enemyAnswered && (
              <div className="text-center text-sm text-[#94a3b8] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Қарсылас ойлауда...
              </div>
            )}
          </div>
        )}

        {/* FINISHED */}
        {phase === "finished" && (
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${myScore > enemyScore ? "bg-[#10b981]/20" : myScore === enemyScore ? "bg-[#f59e0b]/20" : "bg-red-500/20"}`}>
              {myScore > enemyScore ? <Crown className="w-12 h-12 text-[#fbbf24]" /> : myScore === enemyScore ? <Trophy className="w-12 h-12 text-[#f59e0b]" /> : <AlertCircle className="w-12 h-12 text-red-400" />}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {myScore > enemyScore ? "🏆 Жеңіс!" : myScore === enemyScore ? "🤝 Тең түстіңдер!" : "💪 Қайта тырыс!"}
            </h1>
            <p className="text-sm text-[#94a3b8] mb-6">
              {playerName}: {myScore} vs {enemyName}: {enemyScore}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={startDuel} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#f59e0b] text-white font-bold flex items-center gap-2 shadow-lg">
                <Swords className="w-4 h-4" /> Жаңа Duel
              </button>
              <button onClick={() => navigate("/global-rating")} className="px-6 py-3 rounded-xl bg-white/[0.06] text-[#e2e8f0] font-medium flex items-center gap-2 hover:bg-white/[0.10]">
                <Trophy className="w-4 h-4" /> Рейтинг
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
