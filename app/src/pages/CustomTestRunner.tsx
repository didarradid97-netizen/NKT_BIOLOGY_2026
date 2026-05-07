// ============================================
// ▶️ TEST RUNNER + AI КӨМЕКШІ ӘР СҰРАҚҚА
// ============================================
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { getCustomTest, saveTestResult } from "@/lib/customTestStorage";
import {
  ArrowLeft, Clock, ChevronRight, ChevronLeft, Lightbulb,
  CheckCircle, XCircle, RotateCcw, Home, Loader2, Sparkles,
  Wifi, WifiOff, AlertTriangle, BookOpen, BrainCircuit,
  HelpCircle, GraduationCap, Zap, Volume2, VolumeX,
} from "lucide-react";

const HINT_API = "/api/hints";
const EXPLAIN_API = "/api/explain-question";

// Локалды подсказкалар
const LOCAL_HINTS: Record<string, string> = {
  жасуша: "Жасушаның негізгі бөліктері: ядро, митохондрия, рибосома. Прокариот vs Эукариот айырмашылығын есте сақта.",
  фотосинтез: "Фотосинтез: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Жарық фазасы (АТП+NADPH) + Кальвин циклі (глюкоза).",
  днк: "ДНҚ: A-T, G-C жұптары. Репликация S-фазада. Транскрипция → Трансляция → Ақуыз.",
  митоз: "Митоз: Профаза→Метафаза→Анафаза→Телофаза. 2n→2n. Соматикалық жасушалар.",
  мейоз: "Мейоз: 2 бөліну. I-ге кроссинговер. 2n→n. Гаметалар түзілуі.",
  эволюция: "Эволюция: Дарвин (өзгергіштік + сұрыпталу). Мутация → Арекеттесу → Изоляция.",
  экология: "Экожүйе: өндірушілер→тұтынушылар→ыдыратқыштар. 10% энергия заңы.",
  қан: "Қан: Эритроцит (O₂), лейкоцит (қорғаныс), тромбоцит (қанықтыру). Гемоглобин.",
};

function getLocalHint(question: string): string {
  const lower = question.toLowerCase();
  for (const [key, val] of Object.entries(LOCAL_HINTS)) {
    if (lower.includes(key)) return "💡 " + val + "\n\n⚠️ (Сервер offline — локалды жауап)";
  }
  return "💡 Сұрақты мұқият оқыңыз. Белгісіз сөздерді AI Жаттықтырушыға сұраңыз.\n⚠️ (Сервер offline — локалды)";
}

function getLocalExplanation(question: string, options: string[], correctIdx: number): string {
  const lower = question.toLowerCase();
  // Тақырып бойынша түсініктеме
  let base = "";
  if (lower.includes("фотосинтез")) base = "Фотосинтез — жарық энергиясын химиялық энергияға айналдыру. Хлоропластта жүреді. Негізгі өнімдер: глюкоза + оттегі.";
  else if (lower.includes("митохондрия")) base = "Митохондрия — жасушаның 'энергетикалық станциясы'. Тыныс алу процесі жүреді, АТФ түзіледі. Қос мембраналы органелла.";
  else if (lower.includes("днк") || lower.includes("дезокси")) base = "ДНҚ — дезоксирибонуклеин қышқылы. Нуклеотидтерден тұрады (А, Т, Г, Ц). Репликация, транскрипция, трансляция процестерінің негізі.";
  else if (lower.includes("митоз")) base = "Митоз — соматикалық жасушалардың көбеюі. 4 фаза: профаза, метафаза, анафаза, телофаза. Хромосома саны өзгермейді (2n→2n).";
  else if (lower.includes("мейоз")) base = "Мейоз — жыныстық жасушалар түзілуі. 2 бөліну. Кроссинговер болады. Хромосома саны жартылай азаяды (2n→n).";
  else if (lower.includes("генетик") || lower.includes("мендель")) base = "Генетика — тұқым қуалайтын белгілер заңдылығын зерттейді. Мендель заңдары: біртекті гибридтер, еркін комбинациялану, тізбекті доминанталық.";
  else if (lower.includes("эколог")) base = "Экология — ағзалар мен ортаның өзара қатынасы. Трофикалық деңгейлер, энергия ағыны (10% заңы), биогеоценоз.";
  else if (lower.includes("қан") || lower.includes("гемогло")) base = "Қан: плазма + формал элементтер. Эритроцит (гемоглобин арқылы O₂ тасымалдайды), лейкоцит (қорғаныс), тромбоцит (қанықтыру).";
  else if (lower.includes("жасуша") || lower.includes("клетка")) base = "Жасуша — тірі ағзалардың құрылымдық негізгі бірлігі. Прокариоттарда (бактериялар) ядро жоқ, эукариоттарда ядро, митохондрия, хлоропласт бар.";
  else base = "Бұл сұрақ бойынша негізгі ұғымды есте сақтаңыз. Терминдерді AI Жаттықтырушыға сұрап, тереңірек түсініңіз.";

  return `📚 **Сұрақ түсініктемесі:**\n${base}\n\n✅ **Дұрыс жауап:** ${options[correctIdx] || "Жауап белгісіз"}\n\n🎯 **Неге дұрыс?**\nСұрақты мұқият оқыңыз, контексті анықтаңыз. ОЗП-да осындай сұрақтар жиі кездеседі.\n\n⚠️ (Сервер offline — локалды түсіндірме)`;
}

export default function CustomTestRunner() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const test = getCustomTest(testId || "");

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintType, setHintType] = useState<"mini" | "full" | "explain">("mini");
  const [online, setOnline] = useState(true);
  const [errorInfo, setErrorInfo] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSidePanel, setShowSidePanel] = useState(false);

  useEffect(() => { if (test && timeLeft === 0) setTimeLeft(test.timeLimit * 60); }, [test]);
  useEffect(() => {
    if (!finished && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => { if (prev <= 1) { setFinished(true); return 0; } return prev - 1; });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [finished, timeLeft]);

  const getHint = useCallback(async (type?: "mini" | "full" | "explain") => {
    if (!test || hintLoading) return;
    const q = test.questions[current];
    if (!q) return;
    const useType = type || hintType;
    setHintLoading(true); setShowHint(true); setErrorInfo("");

    try {
      // Алдымен backend API-ны қолдану
      const endpoint = useType === "explain" ? EXPLAIN_API : HINT_API;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          hintType: useType === "explain" ? "full" : useType,
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      setHint(data.hint || data.explanation || getLocalExplanation(q.text, q.options, q.correctAnswer)); setOnline(true);
    } catch (err: any) {
      // Fallback — локалды түсіндірме
      if (useType === "explain") {
        setHint(getLocalExplanation(q.text, q.options, q.correctAnswer));
      } else {
        setHint(getLocalHint(q.text));
      }
      setOnline(false);
      setErrorInfo("AI offline — локалды түсіндірме");
    } finally { setHintLoading(false); }
  }, [test, current, hintLoading, hintType]);

  const handleAnswer = (opt: number) => { if (!finished) setAnswers(prev => ({ ...prev, [current]: opt })); };
  const handleFinish = () => { setFinished(true); setShowHint(false); };

  const handleSaveResult = () => {
    if (!test) return;
    let correct = 0;
    test.questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    saveTestResult({ testId: test.id, testTitle: test.title, score: correct, total: test.questions.length, answers, completedAt: new Date().toISOString() });
    navigate("/progress");
  };

  if (!test) return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Тест табылмады</div>;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((current + 1) / test.questions.length) * 100;
  const q = test.questions[current];

  // Нәтиже экраны
  if (finished) {
    let correct = 0;
    test.questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    const pct = Math.round((correct / test.questions.length) * 100);
    return (
      <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
        <div className="max-w-[900px] mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${pct >= 70 ? "bg-[#10b981]/20" : pct >= 50 ? "bg-[#f59e0b]/20" : "bg-red-500/20"}`}>
              {pct >= 70 ? <CheckCircle className="w-12 h-12 text-[#10b981]" /> : <XCircle className="w-12 h-12 text-red-400" />}
            </div>
            <h1 className="text-3xl font-bold mb-2">{pct >= 70 ? "Өте жақсы! 🎉" : pct >= 50 ? "Жақсы 👍" : "Қайта тырысыңыз 💪"}</h1>
            <p className="text-5xl font-extrabold bg-gradient-to-r from-[#34d399] to-[#3b82f6] bg-clip-text text-transparent">{correct}/{test.questions.length}</p>
            <p className="text-xl text-[#94a3b8] mt-2">{pct}%</p>
          </div>

          {/* Тақырыптық талдау */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-[#10b981]" /> Тақырыптық талдау</h3>
            <p className="text-sm text-[#94a3b8]">Дұрыс: {correct} • Қате: {test.questions.length - correct} • Пропущено: {test.questions.length - Object.keys(answers).length}</p>
            <div className="mt-3 h-3 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {test.questions.map((quest, i) => (
              <div key={quest.id} className={`rounded-2xl border p-4 ${answers[i] === quest.correctAnswer ? "bg-[#10b981]/5 border-[#10b981]/20" : "bg-red-500/5 border-red-500/20"}`}>
                <p className="text-sm font-medium mb-2">{i + 1}. {quest.text}</p>
                <div className="text-xs mb-2">
                  Сіздің жауабыңыз: <span className={answers[i] === quest.correctAnswer ? "text-[#10b981] font-bold" : "text-red-400 font-bold"}>{answers[i] !== undefined ? quest.options[answers[i]] : "Жоқ"}</span>
                  {" "}• Дұрыс: <span className="text-[#10b981] font-bold">{quest.options[quest.correctAnswer]}</span>
                </div>
                {quest.explanation && <p className="text-xs text-[#64748b] bg-white/[0.03] rounded-lg p-2 mt-1">💡 {quest.explanation}</p>}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => { setCurrent(0); setAnswers({}); setFinished(false); setTimeLeft(test.timeLimit * 60); }} className="px-5 py-3 rounded-xl bg-white/[0.06] text-[#e2e8f0] font-medium flex items-center gap-2 hover:bg-white/[0.10]"><RotateCcw className="w-4 h-4" /> Қайта</button>
            <button onClick={handleSaveResult} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold flex items-center gap-2 shadow-lg shadow-[#10b981]/20"><CheckCircle className="w-4 h-4" /> Нәтиже сақтау</button>
            <button onClick={() => navigate("/")} className="px-5 py-3 rounded-xl bg-white/[0.06] text-[#e2e8f0] font-medium flex items-center gap-2 hover:bg-white/[0.10]"><Home className="w-4 h-4" /> Басты</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button onClick={() => navigate("/my-tests")} className="p-2 rounded-lg bg-white/[0.06] text-[#94a3b8] hover:text-white shrink-0"><ArrowLeft className="w-4 h-4" /></button>
          <div className="flex-1 mx-2"><div className="h-2 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] rounded-full transition-all" style={{ width: `${progress}%` }} /></div><p className="text-[10px] text-[#64748b] mt-1 text-center">{current + 1} / {test.questions.length}</p></div>
          <div className={`flex items-center gap-1.5 text-sm font-mono shrink-0 ${timeLeft < 60 ? "text-red-400" : "text-[#e2e8f0]"}`}><Clock className="w-4 h-4" />{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-lg bg-white/[0.06] text-[#94a3b8] hover:text-white shrink-0">{soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Негізгі сұрақ аймағы */}
          <div className="lg:col-span-2 space-y-5">
            {/* Сұрақ карточкасы */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Сұрақ №{current + 1}</span>
                <div className="flex items-center gap-2">
                  {online ? <Wifi className="w-3.5 h-3.5 text-[#10b981]" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
                  <span className={`text-xs ${answers[current] !== undefined ? "text-[#10b981]" : "text-[#64748b]"}`}>{answers[current] !== undefined ? "Жауап берілді" : "Жауапсыз"}</span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-[#e2e8f0] mb-5 leading-relaxed">{q.text}</h2>
              {q.image && <img src={q.image} alt="" className="max-h-48 rounded-xl mb-4 border border-white/[0.08]" />}

              <div className="space-y-3">
                {q.options.map((opt, idx) => (
                  <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${answers[current] === idx ? "bg-[#10b981]/10 border-[#10b981]/30" : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]"}`}>
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${answers[current] === idx ? "bg-[#10b981] text-white" : "bg-white/[0.06] text-[#64748b]"}`}>{String.fromCharCode(65 + idx)}</span>
                    <span className="text-sm">{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Көмекші панелі (сұрақтың астында) */}
            <div className="bg-gradient-to-r from-[#10b981]/10 to-[#3b82f6]/10 border border-[#10b981]/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
                  <div>
                    <h3 className="text-sm font-bold text-[#e2e8f0]">🤖 AI Көмекші</h3>
                    <p className="text-[10px] text-[#64748b]">{online ? "Groq AI online" : "Fallback mode"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={hintType} onChange={(e) => setHintType(e.target.value as "mini" | "full" | "explain")} className="bg-[#0f172a]/80 border border-white/[0.12] rounded-lg px-2 py-1.5 text-xs text-[#e2e8f0]">
                    <option value="mini">🔍 Жеңіл</option>
                    <option value="full">📖 Толық</option>
                    <option value="explain">🎓 Түсіндірме</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => getHint("mini")} disabled={hintLoading} className="px-3 py-2 rounded-lg bg-[#10b981]/15 text-[#6ee7b7] text-xs font-medium flex items-center gap-1 hover:bg-[#10b981]/25 transition-all disabled:opacity-50 border border-[#10b981]/20">
                  {hintLoading && hintType === "mini" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-3 h-3" />} Жеңіл жардам
                </button>
                <button onClick={() => getHint("full")} disabled={hintLoading} className="px-3 py-2 rounded-lg bg-[#3b82f6]/15 text-[#60a5fa] text-xs font-medium flex items-center gap-1 hover:bg-[#3b82f6]/25 transition-all disabled:opacity-50 border border-[#3b82f6]/20">
                  {hintLoading && hintType === "full" ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookOpen className="w-3 h-3" />} Толық шешу
                </button>
                <button onClick={() => getHint("explain")} disabled={hintLoading} className="px-3 py-2 rounded-lg bg-[#f59e0b]/15 text-[#fbbf24] text-xs font-medium flex items-center gap-1 hover:bg-[#f59e0b]/25 transition-all disabled:opacity-50 border border-[#f59e0b]/20">
                  {hintLoading && hintType === "explain" ? <Loader2 className="w-3 h-3 animate-spin" /> : <GraduationCap className="w-3 h-3" />} Түсіндірме
                </button>
              </div>

              {showHint && (
                <div className="mt-4">
                  {hintLoading ? (
                    <div className="flex items-center gap-2 text-sm text-[#94a3b8]"><Loader2 className="w-4 h-4 animate-spin text-[#10b981]" /> AI ойлауда...</div>
                  ) : hint ? (
                    <div className="bg-[#0f172a]/60 border border-white/[0.08] rounded-xl p-4 text-sm text-[#e2e8f0] leading-relaxed whitespace-pre-line">{hint}</div>
                  ) : null}
                </div>
              )}

              {errorInfo && (
                <div className="flex items-center gap-2 text-xs text-amber-400 mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3 h-3" /> {errorInfo}
                </div>
              )}
            </div>

            {/* Навигация */}
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] text-[#e2e8f0] text-sm disabled:opacity-30 transition-all hover:bg-white/[0.10]"><ChevronLeft className="w-4 h-4" /> Алдыңғы</button>
              <div className="flex gap-1">
                {test.questions.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrent(idx)} className={`w-2.5 h-2.5 rounded-full transition-all ${idx === current ? "bg-[#10b981] w-6" : answers[idx] !== undefined ? "bg-[#3b82f6]" : "bg-white/[0.15]"}`} />
                ))}
              </div>
              {current < test.questions.length - 1 ? (
                <button onClick={() => setCurrent(current + 1)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-medium shadow-lg shadow-[#10b981]/20 transition-all hover:shadow-[#10b981]/30">Келесі <ChevronRight className="w-4 h-4" /></button>
              ) : (
                <button onClick={handleFinish} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white text-sm font-semibold shadow-lg shadow-[#3b82f6]/20 transition-all hover:shadow-[#3b82f6]/30">Аяқтау <CheckCircle className="w-4 h-4" /></button>
              )}
            </div>
          </div>

          {/* Боковая панель — нұсқаулық + сұрақтар тізімі */}
          <div className="space-y-4">
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#e2e8f0] mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-[#f59e0b]" /> Быстрый доступ</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                {test.questions.map((quest, idx) => (
                  <button key={idx} onClick={() => setCurrent(idx)} className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-left text-xs transition-all ${idx === current ? "bg-[#10b981]/15 border border-[#10b981]/25" : answers[idx] !== undefined ? "bg-[#3b82f6]/10 border border-[#3b82f6]/20" : "bg-white/[0.03] border border-transparent hover:bg-white/[0.06]"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${idx === current ? "bg-[#10b981] text-white" : answers[idx] !== undefined ? "bg-[#3b82f6] text-white" : "bg-white/[0.08] text-[#64748b]"}`}>{idx + 1}</span>
                    <span className="truncate text-[#94a3b8]">{quest.text.slice(0, 40)}...</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#f59e0b]/10 to-[#d97706]/5 border border-[#f59e0b]/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#fbbf24] mb-2 flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Көмек</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                🔍 <b>Жеңіл жардам</b> — сұраққа нұсқа бермейді<br/>
                📖 <b>Толық шешу</b> — қадамдап түсіндіреді<br/>
                🎓 <b>Түсіндірме</b> — неге дұрыс екенін айтады
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
