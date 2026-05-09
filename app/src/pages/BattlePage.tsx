import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Swords, Users, Zap, Clock, Trophy, ArrowLeft,
  Loader2, Crown, Target, Flame, Star, UserPlus,
  CheckCircle, XCircle, Play,
} from "lucide-react";
import {
  createRoom, joinRoom, addAIPlayer, setReady,
  submitAnswer, processAITurn, getRoom, deleteRoom,
  type BattleRoom, type BattlePlayer,
} from "@/lib/multiplayer";

type Phase = "lobby" | "create" | "join" | "room" | "battle" | "result";

export default function BattlePage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [room, setRoom] = useState<BattleRoom | null>(null);
  const [playerName, setPlayerName] = useState("Ойыншы");
  const [roomName, setRoomName] = useState("");
  const [selectedMode, setSelectedMode] = useState<"duel" | "group">("duel");
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll room state
  useEffect(() => {
    if (!room || phase !== "battle") return;

    const poll = setInterval(() => {
      const updated = room.id ? getRoom(room.id) : null;
      if (updated) {
        setRoom(updated);
        setCurrentQ(updated.currentQuestion);

        if (updated.status === "finished") {
          setPhase("result");
          clearInterval(poll);
        }

        // Process AI turns
        processAITurn(updated.id);
      }
    }, 1000);

    return () => clearInterval(poll);
  }, [room?.id, phase]);

  // Create room
  const handleCreate = () => {
    if (!roomName.trim()) {
      setError("Бөлме атын енгізіңіз");
      return;
    }
    const newRoom = createRoom(roomName, selectedMode);
    const joined = joinRoom(newRoom.id, playerName);
    if (joined) {
      setRoom(joined);
      setPhase("room");
      setError("");
    }
  };

  // Add AI opponent
  const addAI = () => {
    if (!room) return;
    const updated = addAIPlayer(room.id);
    if (updated) setRoom({ ...updated });
  };

  // Ready up
  const handleReady = () => {
    if (!room) return;
    const me = room.players.find((p) => p.name === playerName);
    if (me) {
      const updated = setReady(room.id, me.id);
      if (updated) {
        setRoom({ ...updated });
        // Start countdown
        if (updated.status === "starting") {
          setCountdown(3);
          const cd = setInterval(() => {
            setCountdown((c) => {
              if (c <= 1) {
                clearInterval(cd);
                setPhase("battle");
                return 0;
              }
              return c - 1;
            });
          }, 1000);
        }
      }
    }
  };

  // Submit answer
  const handleAnswer = (idx: number) => {
    if (!room || selectedAnswer !== null) return;
    setSelectedAnswer(idx);

    const me = room.players.find((p) => p.name === playerName);
    if (me) {
      submitAnswer(room.id, me.id, currentQ, idx);
    }
    setShowResult(true);

    // Auto next after delay
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
    }, 2000);
  };

  // Current question data
  const q = room?.questions?.[currentQ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ef4444] to-[#f59e0b] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">⚔️ Битва</h1>
          <p className="text-white/60">Досыңмен не AI-мен жарыс!</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* PHASE: Lobby */}
        {phase === "lobby" && (
          <div className="grid gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <label className="text-sm text-white/60 mb-2 block">Атыңыз</label>
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white mb-4 outline-none focus:border-[#ef4444]/50"
                placeholder="Ойыншы аты"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setPhase("create")}
                  className="flex-1 py-3 bg-gradient-to-r from-[#ef4444] to-[#f59e0b] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  <Swords className="w-5 h-5" /> Бөлме ашу
                </button>
              </div>
            </div>

            {/* Quick Start vs AI */}
            <button
              onClick={() => {
                const room = createRoom("AI Duel", "duel");
                joinRoom(room.id, playerName);
                addAIPlayer(room.id);
                const r = getRoom(room.id);
                if (r) {
                  setRoom(r);
                  setPhase("room");
                }
              }}
              className="p-6 bg-gradient-to-r from-[#a855f7]/10 to-[#3b82f6]/10 border border-[#a855f7]/20 rounded-2xl hover:border-[#a855f7]/40 transition text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#a855f7]/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#a855f7]" />
                </div>
                <div>
                  <h3 className="font-bold">Жылдам AI Битва</h3>
                  <p className="text-xs text-white/50">1 на 1 против AI. 10 сұрақ. 20 секунд.</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* PHASE: Create */}
        {phase === "create" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Бөлме жасау</h2>

            <label className="text-sm text-white/60 mb-2 block">Бөлме аты</label>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white mb-4 outline-none focus:border-[#ef4444]/50"
              placeholder="Мыс: ҰБТ дайындық"
            />

            <label className="text-sm text-white/60 mb-2 block">Режим</label>
            <div className="flex gap-3 mb-6">
              {(["duel", "group"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`flex-1 py-3 rounded-xl border font-medium text-sm transition ${
                    selectedMode === mode
                      ? "border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444]"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {mode === "duel" ? "1 на 1" : "Топ (6 адам)"}
                </button>
              ))}
            </div>

            <button
              onClick={handleCreate}
              className="w-full py-3 bg-gradient-to-r from-[#ef4444] to-[#f59e0b] text-white rounded-xl font-bold hover:opacity-90 transition"
            >
              Бөлме ашу
            </button>
          </div>
        )}

        {/* PHASE: Room */}
        {phase === "room" && room && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{room.name}</h2>
              <span className="text-xs px-2 py-1 bg-white/10 rounded-full">ID: {room.id.slice(0, 6)}</span>
            </div>

            {/* Players */}
            <div className="space-y-2 mb-6">
              {room.players.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <img src={p.avatar} alt="" className="w-8 h-8 rounded-full bg-white/10" />
                  <span className="flex-1 text-sm font-medium">{p.name} {p.name === playerName && "(Сіз)"}</span>
                  {p.isReady ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
                  )}
                </div>
              ))}

              {/* Empty slots */}
              {room.mode === "duel" && room.players.length < 2 && (
                <button
                  onClick={addAI}
                  className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-white/20 rounded-xl text-sm text-white/50 hover:border-[#a855f7]/40 hover:text-[#a855f7] transition"
                >
                  <UserPlus className="w-4 h-4" /> AI қарсылас қосу
                </button>
              )}
            </div>

            {/* Countdown */}
            {countdown > 0 && (
              <div className="text-center mb-4">
                <p className="text-4xl font-extrabold text-[#f59e0b] animate-pulse">{countdown}</p>
              </div>
            )}

            {/* Actions */}
            {!room.players.find((p) => p.name === playerName)?.isReady && (
              <button
                onClick={handleReady}
                className="w-full py-3 bg-gradient-to-r from-[#ef4444] to-[#f59e0b] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
              >
                <Play className="w-5 h-5" /> Дайын!
              </button>
            )}
          </div>
        )}

        {/* PHASE: Battle */}
        {phase === "battle" && room && q && (
          <div>
            {/* Scoreboard */}
            <div className="flex items-center justify-between mb-4 bg-white/5 rounded-xl p-3">
              {room.players.map((p) => (
                <div key={p.id} className="text-center">
                  <img src={p.avatar} alt="" className="w-8 h-8 rounded-full mx-auto mb-1" />
                  <p className="text-xs font-medium">{p.name}</p>
                  <p className="text-xs text-[#f59e0b]">{p.score} XP</p>
                </div>
              ))}
            </div>

            {/* Question progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                <span>Сұрақ {currentQ + 1}/{room.questions.length}</span>
                <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> Streak</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ef4444] to-[#f59e0b] rounded-full transition-all"
                  style={{ width: `${((currentQ + 1) / room.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">{q.text}</h3>
              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.correctIndex;
                  const isSelected = selectedAnswer === i;
                  let btnClass = "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ";

                  if (showResult) {
                    if (isCorrect) btnClass += "bg-emerald-500/15 border-emerald-500/40";
                    else if (isSelected) btnClass += "bg-red-500/15 border-red-500/40";
                    else btnClass += "bg-white/5 border-white/10 opacity-50";
                  } else {
                    btnClass += "bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer";
                  }

                  return (
                    <button key={i} onClick={() => handleAnswer(i)} disabled={showResult} className={btnClass}>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showResult && isCorrect ? "bg-emerald-500 text-white" : showResult && isSelected ? "bg-red-500 text-white" : "bg-white/10 text-white/60"}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className="mt-4 p-3 bg-white/5 rounded-xl">
                  <p className="text-xs text-white/60">{q.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PHASE: Result */}
        {phase === "result" && room && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <Crown className="w-16 h-16 text-[#fbbf24] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Битва аяқталды! 🏆</h2>

            <div className="space-y-3 mb-6">
              {[...room.players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.id} className={`flex items-center gap-3 p-4 rounded-xl ${i === 0 ? "bg-[#fbbf24]/10 border border-[#fbbf24]/20" : "bg-white/5"}`}>
                  <span className="text-xl font-bold w-8">{i + 1}</span>
                  <img src={p.avatar} alt="" className="w-10 h-10 rounded-full" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-white/50">{Object.keys(p.answers).length}/{room.questions.length} жауап</p>
                  </div>
                  <p className="text-xl font-bold text-[#f59e0b]">{p.score}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setPhase("lobby");
                  setRoom(null);
                  setCurrentQ(0);
                  setSelectedAnswer(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#ef4444] to-[#f59e0b] text-white rounded-xl font-bold flex items-center gap-2"
              >
                <Swords className="w-5 h-5" /> Жаңа битва
              </button>
            </div>
          </div>
        )}

        <button onClick={() => navigate("/")} className="mt-6 flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>
      </div>
    </div>
  );
}
