// ============================================
// ▶️ TEST RUNNER + AI КӨМЕКШІ — Public & Custom тесттер
// ============================================
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { getCustomTest, saveTestResult } from "@/lib/customTestStorage";
import { recordWrongAnswer } from "@/lib/memoryStorage";
import { getMotivationMessage } from "@/lib/mentorStorage";
import {
  ArrowLeft, Clock, ChevronRight, ChevronLeft, Lightbulb,
  CheckCircle, XCircle, RotateCcw, Home, Loader2, Sparkles,
  Wifi, WifiOff, AlertTriangle, BookOpen, GraduationCap,
  Zap, Volume2, VolumeX, Heart, Skull, Timer, Flame,
} from "lucide-react";

const HINT_API = "/api/hints";
const EXPLAIN_API = "/api/explain-question";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface TestData {
  id: string;
  title: string;
  description?: string;
  category?: string;
  timeLimit: number;
  questions: Question[];
}

// Локалды подсказкалар
const LOCAL_HINTS: Record<string, string> = {
  жасуша: "Жасушаның негізгі бөліктері: ядро, митохондрия, рибосома. Прокариот vs Эукариот айырмашылығын есте сақта.",
  фотосинтез: "Фотосинтез: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Жарық фазасы + Кальвин циклі.",
  днк: "ДНҚ: A-T, G-C жұптары. Репликация S-фазада.",
  митоз: "Митоз: Профаза→Метафаза→Анафаза→Телофаза. 2n→2n.",
  мейоз: "Мейоз: 2 бөліну. Кроссинговер. 2n→n.",
  эволюция: "Эволюция: Дарвин (өзгергіштік + сұрыпталу).",
  экология: "Экожүйе: өндірушілер→тұтынушылар→ыдыратқыштар. 10% заңы.",
  қан: "Қан: Эритроцит (O₂), лейкоцит (қорғаныс), тромбоцит (қанықтыру).",
};

function getLocalHint(q: string): string {
  const lower = q.toLowerCase();
  for (const [key, val] of Object.entries(LOCAL_HINTS)) {
    if (lower.includes(key)) return "💡 " + val + "\n\n⚠️ (Сервер offline — локалды жауап)";
  }
  return "💡 Сұрақты мұқият оқыңыз.\n⚠️ (Сервер offline)";
}

function getLocalExplanation(q: string, options: string[], correctIdx: number): string {
  const lower = q.toLowerCase();
  let base = "";
  if (lower.includes("фотосинтез")) base = "Фотосинтез — жарык энергиясын химиялық энергияға айналдыру. Хлоропластта жүреді.";
  else if (lower.includes("митохондрия")) base = "Митохондрия — 'энергетикалық станция'. Тыныс алу, АТФ түзіледі.";
  else if (lower.includes("днк") || lower.includes("дезокси")) base = "ДНҚ — дезоксирибонуклеин қышқылы. Нуклеотидтерден тұрады.";
  else if (lower.includes("митоз")) base = "Митоз — соматикалық жасушалар көбеюі. 4 фаза: профаза, метафаза, анафаза, телофаза.";
  else if (lower.includes("мейоз")) base = "Мейоз — жыныстық жасушалар түзілуі. 2 бөліну. Хромосома жартылай азаяды.";
  else if (lower.includes("генетик") || lower.includes("мендель")) base = "Генетика — тұқым қуалайтын белгілер заңдылығы. Мендель заңдары.";
  else if (lower.includes("эколог")) base = "Экология — ағзалар мен ортаның өзара қатынасы. 10% энергия заңы.";
  else if (lower.includes("қан") || lower.includes("гемогло")) base = "Қан: плазма + формал элементтер. Эритроцит, лейкоцит, тромбоцит.";
  else if (lower.includes("жасуша") || lower.includes("клетка")) base = "Жасуша — тірі ағзалардың негізгі бірлігі. Прокариот vs Эукариот.";
  else base = "Бұл сұрақ бойынша негізгі ұғымды есте сақтаңыз.";

  return `📚 **Сұрақ түсініктемесі:**\n${base}\n\n✅ **Дұрыс жауап:** ${options[correctIdx] || "Белгісіз"}\n\n🎯 **Неге дұрыс?**\nСұрақты мұқият оқыңыз, контексті анықтаңыз. ОЗП-да осындай сұрақтар жиі кездеседі.\n\n⚠️ (Сервер offline — локалды түсіндірме)`;
}

// Public тесттерді жүктеу (public/tests/all-tests.json)
async function loadPublicTest(testId: string): Promise<TestData | null> {
  try {
    const res = await fetch('/tests/all-tests.json');
    if (!res.ok) return null;
    const data = await res.json();

    // all-tests.json құрылымы: { "probny1": { title, description, questions, time, data: [...] }, ... }
    const raw = data[testId];
    if (!raw) return null;

    // Сыртқы форматты ішкі TestData форматына түрлендіру
    const mapped: TestData = {
      id: testId,
      title: raw.title || testId,
      description: raw.description || "",
      timeLimit: raw.time || 45,
      questions: (raw.data || []).map((q: any, idx: number) => ({
        id: `${testId}-q${idx}`,
        text: q.q || "Сұрақ",
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: typeof q.correct === "number" ? q.correct : 0,
        explanation: q.explanation || "",
      })),
    };
    return mapped;
  } catch {
    return null;
  }
}

export default function CustomTestRunner() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<TestData | null>(null);
  const [loadingTest, setLoadingTest] = useState(true);

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

  // 🔥 ЖАҢА ФИЧАЛАР: Survival + Stress + Voice + Motivation
  const [survivalMode, setSurvivalMode] = useState(false);
  const [stressMode, setStressMode] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [motivationMsg, setMotivationMsg] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [cheatLoading, setCheatLoading] = useState(false);

  // Тестті жүктеу (localStorage немесе public/tests/)
  useEffect(() => {
    if (!testId) return;
    setLoadingTest(true);

    (async () => {
      // 1. Алдымен localStorage-тен іздеу (custom tests)
      const custom = getCustomTest(testId);
      if (custom) {
        setTest(custom as TestData);
        setTimeLeft(custom.timeLimit * 60);
        setLoadingTest(false);
        return;
      }

      // 2. Public/tests/ ішінен іздеу (75 пробный тесттер)
      const publicTest = await loadPublicTest(testId);
      if (publicTest) {
        setTest(publicTest);
        setTimeLeft(publicTest.timeLimit * 60);
        setLoadingTest(false);
        return;
      }

      // 3. Табылмады
      setTest(null);
      setLoadingTest(false);
    })();
  }, [testId]);

  // Таймер
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
      setHint(data.hint || data.explanation || getLocalExplanation(q.text, q.options, q.correctAnswer));
      setOnline(true);
    } catch {
      setHint(useType === "explain"
        ? getLocalExplanation(q.text, q.options, q.correctAnswer)
        : getLocalHint(q.text)
      );
      setOnline(false);
      setErrorInfo("AI offline — локалды түсіндірме");
    } finally { setHintLoading(false); }
  }, [test, current, hintLoading, hintType]);

  const speakQuestion = useCallback(() => {
    if (!test || speaking) return;
    const q = test.questions[current];
    const text = `Сұрақ: ${q.text}. Нұсқалар: ${q.options.map((o, i) => String.fromCharCode(65 + i) + ") " + o).join(", ")}`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ru-RU"; u.rate = 0.9;
    u.onend = () => setSpeaking(false);
    speechSynthesis.cancel(); speechSynthesis.speak(u); setSpeaking(true);
  }, [test, current, speaking]);

  const getCheatSheet = useCallback(async () => {
    if (!test || cheatLoading) return;
    const q = test.questions[current];
    setCheatLoading(true); setShowHint(true); setErrorInfo("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Сен — кәсіпқой биология оқытушысы. 30 секундтық қысқа түсіндірме бер. Тек маңыздысы." },
            { role: "user", content: `"${q.text}" сұрағын 30 секундта түсіндір. Нұсқалар: ${q.options.join(", ")}. Дұрыс: ${q.options[q.correctAnswer]}` },
          ],
          temperature: 0.6,
        }),
      });
      const data = await res.json();
      setHint(data.response || "❌ AI жауабы алынбады");
      setOnline(true);
    } catch {
      setHint(getLocalExplanation(q.text, q.options, q.correctAnswer));
      setOnline(false);
      setErrorInfo("AI offline — локалды түсіндірме");
    } finally { setCheatLoading(false); }
  }, [test, current, cheatLoading]);
    if (!finished && test && !gameOver) {
      setAnswers(prev => ({ ...prev, [current]: opt }));
      const q = test.questions[current];
      // Survival Mode: қате = game over
      if (survivalMode && opt !== q.correctAnswer) {
        setGameOver(true);
        setFinished(true);
      }
      // Memory AI: қате тақырыпты есте сақтау
      if (opt !== q.correctAnswer) {
        const topic = q.text.split(" ").slice(0, 3).join(" ");
        recordWrongAnswer(topic);
      }
      // Motivation
      const correctCount = Object.entries({ ...answers, [current]: opt }).filter(([i, a]) => test.questions[Number(i)]?.correctAnswer === a).length;
      const totalAnswered = Object.keys({ ...answers, [current]: opt }).length;
      setMotivationMsg(getMotivationMessage(correctCount, totalAnswered, 0));
    }
  };

  const handleFinish = () => {
    setFinished(true);
    setShowHint(false);
    const correct = test?.questions.filter((q, i) => answers[i] === q.correctAnswer).length || 0;
    const total = test?.questions.length || 1;
    setMotivationMsg(getMotivationMessage(correct, total, 0));
  };

  const handleSaveResult = () => {
    if (!test) return;
    let correct = 0;
    test.questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    saveTestResult({ testId: test.id, testTitle: test.title, score: correct, total: test.questions.length, answers, completedAt: new Date().toISOString() });
    navigate("/progress");
  };

  // Жүктелуде
  if (loadingTest) {
    return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#10b981]" /></div>;
  }

  // Тест табылмады
  if (!test) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center gap-4">
        <XCircle className="w-12 h-12 text-red-400" />
        <h1 className="text-xl font-bold">Тест табылмады</h1>
        <p className="text-sm text-[#94a3b8]">ID: {testId}</p>
        <button onClick={() => navigate("/tests")} className="px-4 py-2 rounded-xl bg-[#10b981] text-white text-sm">Тесттерге оралу</button>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((current + 1) / test.questions.length) * 100;
  const q = test.questions[current];

  // Нәтиже экраны
  if (finished) {
    let correct = 0;
    test.questions.forEach((quest, i) => { if (answers[i] === quest.correctAnswer) correct++; });
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

          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#10b981]" /> Тақырыптық талдау</h3>
            <p className="text-sm text-[#94a3b8]">Дұрыс: {correct} • Қате: {test.questions.length - correct}</p>
            <div className="mt-3 h-3 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] rounded-full" style={{ width: `${pct}%` }} /></div>
          </div>

          <div className="space-y-3 mb-8">
            {test.questions.map((quest, i) => (
              <div key={quest.id} className={`rounded-2xl border p-4 ${answers[i] === quest.correctAnswer ? "bg-[#10b981]/5 border-[#10b981]/20" : "bg-red-500/5 border-red-500/20"}`}>
                <p className="text-sm font-medium mb-2">{i + 1}. {quest.text}</p>
                <div className="text-xs mb-2">
                  Сіздің жауабыңыз: <span className={answers[i] === quest.correctAnswer ? "text-[#10b981] font-bold" : "text-red-400 font-bold"}>{answers[i] !== undefined ? quest.options[answers[i]] : "Жоқ"}</span>
                  {" "}• Дұрыс: <span className="text-[#10b981] font-bold">{quest.options[quest.correctAnswer]}</span>
                </div>
                {quest.explanation && <p className="text-xs text-[#64748b] bg-white/[0.03] rounded-lg p-2">💡 {quest.explanation}</p>}
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
          <button onClick={() => navigate("/tests")} className="p-2 rounded-lg bg-white/[0.06] text-[#94a3b8] hover:text-white shrink-0"><ArrowLeft className="w-4 h-4" /></button>
          <div className="flex-1 mx-2">
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
            <p className="text-[10px] text-[#64748b] mt-1 text-center">{current + 1} / {test.questions.length} • {test.title}</p>
          </div>
          <div className={`flex items-center gap-1.5 text-sm font-mono shrink-0 ${timeLeft < 60 ? "text-red-400" : "text-[#e2e8f0]"}`}><Clock className="w-4 h-4" />{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-lg bg-white/[0.06] text-[#94a3b8] hover:text-white shrink-0">{soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
          <button onClick={() => setSurvivalMode(!survivalMode)} title="Survival Mode" className={`p-2 rounded-lg shrink-0 transition-all ${survivalMode ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/[0.06] text-[#94a3b8] hover:text-white"}`}><Skull className="w-4 h-4" /></button>
          <button onClick={() => setStressMode(!stressMode)} title="Stress Mode" className={`p-2 rounded-lg shrink-0 transition-all ${stressMode ? "bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30 animate-pulse" : "bg-white/[0.06] text-[#94a3b8] hover:text-white"}`}><Timer className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Stress heartbeat overlay */}
      {stressMode && !finished && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-red-500/[0.02] animate-pulse" />
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Негізгі аймақ */}
          <div className="lg:col-span-2 space-y-5">
            {/* Motivation Banner */}
            {motivationMsg && (
              <div className="bg-gradient-to-r from-[#10b981]/10 to-[#3b82f6]/10 border border-[#10b981]/20 rounded-xl p-3 flex items-center gap-2 animate-pulse">
                <Heart className="w-4 h-4 text-[#ec4899] flex-shrink-0" />
                <p className="text-xs text-[#e2e8f0] font-medium">{motivationMsg}</p>
              </div>
            )}

            {/* Game Over Banner */}
            {gameOver && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-6 text-center">
                <Skull className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-red-400 mb-2">❌ Survival Mode: Game Over</h2>
                <p className="text-sm text-[#94a3b8] mb-4">Қате жауап бердіңіз. Қайта тырысыңыз!</p>
                <button onClick={() => { setGameOver(false); setCurrent(0); setAnswers({}); setFinished(false); setTimeLeft(test.timeLimit * 60); }} className="px-5 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-all">
                  <RotateCcw className="w-4 h-4 inline mr-2" /> Қайта
                </button>
              </div>
            )}

            {/* Сұрақ */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">Сұрақ №{current + 1} / {test.questions.length}</span>
                <div className="flex items-center gap-2">
                  {online ? <Wifi className="w-3.5 h-3.5 text-[#10b981]" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
                  <span className={`text-xs ${answers[current] !== undefined ? "text-[#10b981]" : "text-[#64748b]"}`}>{answers[current] !== undefined ? "✓ Жауап берілді" : "○ Жауапсыз"}</span>
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

            {/* 🤖 AI Көмекші — Сұрақтың астында */}
            <div className="bg-gradient-to-r from-[#10b981]/10 to-[#3b82f6]/10 border border-[#10b981]/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
                  <div>
                    <h3 className="text-sm font-bold text-[#e2e8f0]">🤖 AI Көмекші</h3>
                    <p className="text-[10px] text-[#64748b]">{online ? "Groq AI online" : "Fallback mode"}</p>
                  </div>
                </div>
                <select value={hintType} onChange={e => setHintType(e.target.value as "mini" | "full" | "explain")} className="bg-[#0f172a]/80 border border-white/[0.12] rounded-lg px-2 py-1.5 text-xs text-[#e2e8f0]">
                  <option value="mini">🔍 Жеңіл</option>
                  <option value="full">📖 Толық</option>
                  <option value="explain">🎓 Түсіндірме</option>
                </select>
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
                <button onClick={speakQuestion} disabled={speaking} className="px-3 py-2 rounded-lg bg-[#ec4899]/15 text-[#f472b6] text-xs font-medium flex items-center gap-1 hover:bg-[#ec4899]/25 transition-all disabled:opacity-50 border border-[#ec4899]/20">
                  {speaking ? <Flame className="w-3 h-3 animate-pulse" /> : <Volume2 className="w-3 h-3" />} Дыбыстау
                </button>
                <button onClick={getCheatSheet} disabled={cheatLoading} className="px-3 py-2 rounded-lg bg-[#06b6d4]/15 text-[#22d3ee] text-xs font-medium flex items-center gap-1 hover:bg-[#06b6d4]/25 transition-all disabled:opacity-50 border border-[#06b6d4]/20">
                  {cheatLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} 30с Cheat Sheet
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

          {/* Боковая панель */}
          <div className="space-y-4">
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#e2e8f0] mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-[#f59e0b]" /> Сұрақтар тізімі</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                {test.questions.map((quest, idx) => (
                  <button key={idx} onClick={() => setCurrent(idx)} className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-left text-xs transition-all ${idx === current ? "bg-[#10b981]/15 border border-[#10b981]/25" : answers[idx] !== undefined ? "bg-[#3b82f6]/10 border border-[#3b82f6]/20" : "bg-white/[0.03] border border-transparent hover:bg-white/[0.06]"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${idx === current ? "bg-[#10b981] text-white" : answers[idx] !== undefined ? "bg-[#3b82f6] text-white" : "bg-white/[0.08] text-[#64748b]"}`}>{idx + 1}</span>
                    <span className="truncate text-[#94a3b8]">{quest.text.slice(0, 35)}...</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#f59e0b]/10 to-[#d97706]/5 border border-[#f59e0b]/20 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[#fbbf24] mb-2">💡 Көмек</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                🔍 <b>Жеңіл</b> — нұсқа бермейді<br/>
                📖 <b>Толық</b> — қадамдап шешу<br/>
                🎓 <b>Түсіндірме</b> — неге дұрыс
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
