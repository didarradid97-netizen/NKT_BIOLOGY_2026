// ============================================
// 🎁 DAILY HUB — 1 Minute Biology + Daily Missions + Cheat Sheet
// ============================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { getDailyState, completeMission, markFactRead } from "@/lib/dailyMissions";
import { getMentorSettings } from "@/lib/mentorStorage";
import {
  Zap, ArrowLeft, CheckCircle, Clock, BookOpen, Sparkles,
  Flame, Award, Target, Lightbulb, Volume2,
} from "lucide-react";

export default function DailyHub() {
  const navigate = useNavigate();
  const [state, setState] = useState(getDailyState());
  const [cheatTopic, setCheatTopic] = useState("");
  const [cheatResult, setCheatResult] = useState("");
  const [cheatLoading, setCheatLoading] = useState(false);
  const [factRead, setFactRead] = useState(state.todayFactRead);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setState(getDailyState());
  }, []);

  const refresh = () => {
    const s = getDailyState();
    setState(s);
    setFactRead(s.todayFactRead);
  };

  const complete = (id: string) => {
    completeMission(id);
    refresh();
  };

  const readFact = () => {
    markFactRead();
    setFactRead(true);
    refresh();
  };

  const speakFact = () => {
    if (speaking) { speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(state.todayFact);
    u.lang = "ru-RU"; u.rate = 0.9;
    u.onend = () => setSpeaking(false);
    speechSynthesis.cancel(); speechSynthesis.speak(u); setSpeaking(true);
  };

  const generateCheatSheet = async () => {
    if (!cheatTopic.trim()) return;
    setCheatLoading(true);
    setCheatResult("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Сен — кәсіпқой биология оқытушысы. 30 секундтық қысқа түсіндірме бер. Bullet points. Тек маңыздысы." },
            { role: "user", content: `"${cheatTopic}" тақырыбын 30 секундта түсіндір. 3-5 маңызды нүкте.` },
          ],
          temperature: 0.6,
        }),
      });
      const data = await res.json();
      setCheatResult(data.response || "❌ AI жауабы алынбады. Серверді тексеріңіз.");
    } catch {
      // Fallback cheat sheets
      const fallback: Record<string, string> = {
        "митоз": `📌 **Митоз 30 секундта:**\n• 4 фаза: профаза → метафаза → анафаза → телофаза\n• Соматикалық жасушалар көбеюі\n• 2n→2n (хромосома саны өзгермейді)\n• Кроссинговер ЖОҚ\n• Мақсаты: өсу, жөндеу, ажалсыз көбею`,
        "мейоз": `📌 **Мейоз 30 секундта:**\n• 2 бөліну: мейоз I + мейоз II\n• 2n→n (хромосома жартылай)\n• Кроссинговер бар (I профаза)\n• Жыныстық жасушалар түзіледі\n• Генетикалық әртүрлендіру көзі`,
        "фотосинтез": `📌 **Фотосинтез 30 секундта:**\n• Формула: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂\n• Жарық фазасы: гранада, АТФ түзіледі\n• Кальвин циклі: стромада, глюкоза түзіледі\n• Хлорофилл жарықты сіңіреді\n• Өсімдік оттегі бөледі`,
        "днк": `📌 **ДНҚ 30 секундта:**\n• Дезоксирибонуклеин қышқылы\n• Нуклеотидтерден: фосфор + декстроза + азотты негіз\n• A-T, G-C жұптары\n• Репликация: S-фазада, полимераза\n• Қос спираль: Уотсон-Крик (1953)`,
      };
      const key = Object.keys(fallback).find((k) => cheatTopic.toLowerCase().includes(k));
      setCheatResult(key ? fallback[key] : `📌 **${cheatTopic}** бойынша қысқа түсіндірме:\n\n• Негізгі анықтамасын есте сақта\n• Негізгі 3 формула/факт\n• ОЗП-да жиі кездесетін сұрақтарға назар аудар\n\n⚠️ (Сервер offline — локалды жауап)`);
    } finally {
      setCheatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] flex flex-col">
      <Navbar />
      <div className="max-w-[700px] mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#f59e0b]/20">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">📚 Daily Hub</h1>
          <p className="text-sm text-[#94a3b8]">Күнде 1 факт, 1 миссия, 1 мақсат</p>
        </div>

        {/* Streak */}
        <div className="bg-gradient-to-r from-[#f59e0b]/10 to-[#ef4444]/10 border border-[#f59e0b]/20 rounded-2xl p-5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-[#ef4444]" />
            <div>
              <p className="text-lg font-bold">{state.streak} күн streak 🔥</p>
              <p className="text-xs text-[#94a3b8]">Күнде кіріп, миссия орында</p>
            </div>
          </div>
          <Award className="w-8 h-8 text-[#fbbf24]" />
        </div>

        {/* 1 Minute Biology */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-[#10b981]" /> 1 Minute Biology</h3>
            <div className="flex gap-2">
              <button onClick={speakFact} className="p-2 rounded-lg bg-white/[0.06] text-[#94a3b8] hover:text-[#10b981] transition-all">
                {speaking ? <Volume2 className="w-4 h-4 text-[#10b981] animate-pulse" /> : <Volume2 className="w-4 h-4" />}
              </button>
              {factRead ? (
                <span className="px-2 py-1 rounded-lg bg-[#10b981]/15 text-[#10b981] text-[10px] font-bold">Оқылды ✓</span>
              ) : (
                <button onClick={readFact} className="px-3 py-1 rounded-lg bg-[#10b981]/15 text-[#10b981] text-[10px] font-bold">Оқыдым деп белгіле</button>
              )}
            </div>
          </div>
          <p className="text-sm leading-relaxed bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">{state.todayFact}</p>
        </div>

        {/* AI Cheat Sheet */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#f59e0b]" /> 📝 AI Cheat Sheet</h3>
          <p className="text-xs text-[#64748b] mb-3">Тақырып жаз — AI 30 секундта түсіндіреді</p>
          <div className="flex gap-2 mb-3">
            <input
              value={cheatTopic}
              onChange={(e) => setCheatTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateCheatSheet()}
              placeholder="Мысалы: митоз, фотосинтез, ДНҚ..."
              className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#f59e0b]/50"
            />
            <button onClick={generateCheatSheet} disabled={cheatLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ef4444] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#f59e0b]/20">
              {cheatLoading ? "Ойлауда..." : "30с ⏱"}
            </button>
          </div>
          {cheatResult && (
            <div className="bg-[#0f172a]/80 border border-white/[0.08] rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line">
              {cheatResult}
            </div>
          )}
        </div>

        {/* Daily Missions */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-[#ef4444]" /> 🎁 Daily Missions</h3>
          <div className="space-y-3">
            {state.missions.map((m) => (
              <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${m.completed ? "bg-[#10b981]/5 border-[#10b981]/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.completed ? "bg-[#10b981]/20 text-[#10b981]" : "bg-white/[0.06] text-[#64748b]"}`}>
                    {m.completed ? <CheckCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`text-sm ${m.completed ? "text-[#10b981] line-through" : "text-[#e2e8f0]"}`}>{m.title}</p>
                    <p className="text-[10px] text-[#64748b]">+{m.reward} XP</p>
                  </div>
                </div>
                {!m.completed && (
                  <button onClick={() => complete(m.id)} className="px-3 py-1.5 rounded-lg bg-[#10b981]/15 text-[#10b981] text-[10px] font-bold hover:bg-[#10b981]/25 transition-all">
                    Орындадым
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={() => navigate("/tests")} className="px-5 py-2.5 rounded-xl bg-[#10b981] text-white font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Тест тапсыру
          </button>
        </div>
      </div>
    </div>
  );
}
