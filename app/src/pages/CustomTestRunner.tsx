// ============================================
// ▶️ TEST RUNNER + AI ПОДСКАЗКА (КАЗАХСКИЙ)
// ============================================
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { getCustomTest, saveTestResult } from "@/lib/customTestStorage";
import {
  ArrowLeft, Clock, ChevronRight, ChevronLeft, Lightbulb,
  CheckCircle, XCircle, RotateCcw, Home, Loader2, Sparkles,
  Wifi, WifiOff, AlertTriangle,
} from "lucide-react";

// ✅ Groq API тікелей фронтендтен — подсказкалар
async function askGroqHint(question: string, options: string[], hintType: string): Promise<string> {
  // @ts-ignore
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_GROQ_API_KEY табылмады");
  }

  const prompt = hintType === "mini"
    ? `ЖАЛПЫ ПОДСКАЗҚА бер (бірден жауап көрсетпе). Сұрақ: "${question}". Нұсқалар: ${options.join(", ")}. 1-2 сөйлеммен жардам бер.`
    : `ТОЛЫҚ ТҮСІНДІРМЕ бер. Сұрақ: "${question}". Нұсқалар: ${options.join(", ")}. Дұрыс жауапты неге сол екенін түсіндір.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Сен — биология тесттері бойынша AI көмекшісің. ОЗП/ҰБТ деңгейінде қысқа, пайдалы подсказкалар бересің. Қазақша жаз.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq қате: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Локалды подсказкалар (fallback)
const LOCAL_HINTS: Record<string, string> = {
  жасуша: "Жасушаның негізгі бөліктерін есте сақтаңыз: ядро, митохондрия, рибосома, хлоропласт (тек өсімдіктерде).",
  фотосинтез: "Фотосинтез формуласы: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Жарық энергиясын химиялық энергияға айналдыру.",
  днк: "ДНҚ = дезоксирибонуклеин қышқылы. Екі тізбекті спираль. Аденин-Тимин, Гуанин-Цитозин жұптары.",
  митоз: "Митоз = соматикалық жасушалардың көбеюі. 4 фаза: профаза, метафаза, анафаза, телофаза.",
  мейоз: "Мейоз = жыныстық жасушалар түзілуі. 2 бөліну. Кроссинговер болады. Хромосома саны жартылай азаяды.",
  эволюция: "Дарвин: өзгергіштік + борышық күрес + табиғи сұрыпталу. Мутациялар = эволюция материалы.",
  экология: "Экожүйе: өндірушілер, тұтынушылар, ыдыратқыштар. Энергия 10% заңы. Биоаккумуляция.",
  қан: "Эритроцит (O₂ тасымал), лейкоцит (қорғаныс), тромбоцит (қанықтыру). Гемоглобин = ақуыз + Fe.",
};

function getLocalHint(question: string): string {
  const lower = question.toLowerCase();
  for (const [key, val] of Object.entries(LOCAL_HINTS)) {
    if (lower.includes(key)) {
      return "💡 " + val + "\n\n⚠️ (Сервер offline — локалды подсказка)";
    }
  }
  return "💡 Сұрақты мұқият оқыңыз. Белгісіз сөздерді AI Жаттықтырушыға сұраңыз.\n⚠️ (Сервер offline)";
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
  const [hintType, setHintType] = useState<"mini" | "full">("mini");
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (test && timeLeft === 0) setTimeLeft(test.timeLimit * 60);
  }, [test]);

  useEffect(() => {
    if (!finished && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [finished, timeLeft]);

  const getHint = useCallback(async () => {
    if (!test || hintLoading) return;
    const q = test.questions[current];
    if (!q) return;
    setHintLoading(true);
    setShowHint(true);
    try {
      const content = await askGroqHint(q.text, q.options, hintType);
      setHint(content);
      setOnline(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Белгісіз қате";
      console.error("Groq hint error:", errorMsg);
      setHint(getLocalHint(q.text));
      setOnline(false);
    } finally {
      setHintLoading(false);
    }
  }, [test, current, hintLoading, hintType]);

  const handleAnswer = (opt: number) => {
    if (!finished) {
      setAnswers((prev) => ({ ...prev, [current]: opt }));
    }
  };

  const handleFinish = () => {
    setFinished(true);
    setShowHint(false);
  };

  const handleSaveResult = () => {
    if (!test) return;
    let correct = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    saveTestResult({
      testId: test.id,
      testTitle: test.title,
      score: correct,
      total: test.questions.length,
      answers,
      completedAt: new Date().toISOString(),
    });
    navigate("/progress");
  };

  if (!test) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        Тест табылмады
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((current + 1) / test.questions.length) * 100;

  if (finished) {
    let correct = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const pct = Math.round((correct / test.questions.length) * 100);

    return (
      <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
        <div className="max-w-[800px] mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${pct >= 70 ? "bg-[#10b981]/20" : pct >= 50 ? "bg-[#f59e0b]/20" : "bg-red-500/20"}`}>
              {pct >= 70 ? <CheckCircle className="w-10 h-10 text-[#10b981]" /> : <XCircle className="w-10 h-10 text-red-400" />}
            </div>
            <h1 className="text-2xl font-bold mb-2">{pct >= 70 ? "Өте жақсы!" : pct >= 50 ? "Жақсы" : "Қайта тырысыңыз"}</h1>
            <p className="text-4xl font-extrabold bg-gradient-to-r from-[#34d399] to-[#3b82f6] bg-clip-text text-transparent">{correct}/{test.questions.length} ({pct}%)</p>
          </div>

          <div className="space-y-3 mb-8">
            {test.questions.map((q, i) => (
              <div key={q.id} className={`rounded-2xl border p-4 ${answers[i] === q.correctAnswer ? "bg-[#10b981]/5 border-[#10b981]/20" : "bg-red-500/5 border-red-500/20"}`}>
                <p className="text-sm font-medium mb-2">{i + 1}. {q.text}</p>
                <div className="text-xs">
                  Сіздің жауабыңыз: <span className={answers[i] === q.correctAnswer ? "text-[#10b981]" : "text-red-400"}>{answers[i] !== undefined ? q.options[answers[i]] : "Жоқ"}</span>
                  {" "}• Дұрыс: <span className="text-[#10b981]">{q.options[q.correctAnswer]}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => { setCurrent(0); setAnswers({}); setFinished(false); setTimeLeft(test.timeLimit * 60); }} className="px-5 py-3 rounded-xl bg-white/[0.06] text-[#e2e8f0] font-medium flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Қайта</button>
            <button onClick={handleSaveResult} className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Сақтау</button>
            <button onClick={() => navigate("/")} className="px-5 py-3 rounded-xl bg-white/[0.06] text-[#e2e8f0] font-medium flex items-center gap-2"><Home className="w-4 h-4" /> Басты</button>
          </div>
        </div>
      </div>
    );
  }

  const q = test.questions[current];

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[900px] mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/my-tests")} className="p-2 rounded-lg bg-white/[0.06] text-[#94a3b8] hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
          <div className="flex-1 mx-4"><div className="h-2 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] rounded-full transition-all" style={{ width: `${progress}%` }} /></div></div>
          <div className={`flex items-center gap-1.5 text-sm font-mono ${timeLeft < 60 ? "text-red-400" : "text-[#e2e8f0]"}`}><Clock className="w-4 h-4" />{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6">
        {/* Question */}
        <div className="mb-6">
          <span className="text-sm text-[#94a3b8]">Сұрақ {current + 1} / {test.questions.length}</span>
          <h2 className="text-lg font-bold text-[#e2e8f0] mt-4 mb-6">{q.text}</h2>
          {q.image && <img src={q.image} alt="" className="max-h-48 rounded-xl mb-4 border border-white/[0.08]" />}
          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${answers[current] === idx ? "bg-[#10b981]/10 border-[#10b981]/30" : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]"}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${answers[current] === idx ? "bg-[#10b981] text-white" : "bg-white/[0.06] text-[#64748b]"}`}>{String.fromCharCode(65 + idx)}</span>
                <span className="text-sm">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Hint */}
        <div className="mb-6 bg-gradient-to-r from-[#f59e0b]/10 to-[#d97706]/5 border border-[#f59e0b]/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#fbbf24]" />
              <span className="text-sm font-medium text-[#fbbf24]">🤖 AI Подсказка</span>
              {online ? <Wifi className="w-3 h-3 text-[#10b981]" /> : <WifiOff className="w-3 h-3 text-red-400" />}
            </div>
            <div className="flex items-center gap-2">
              <select value={hintType} onChange={(e) => setHintType(e.target.value as "mini" | "full")} className="bg-[#0f172a]/80 border border-white/[0.12] rounded-lg px-2 py-1 text-xs text-[#e2e8f0]">
                <option value="mini">Жеңіл</option>
                <option value="full">Толық</option>
              </select>
              <button onClick={getHint} disabled={hintLoading} className="px-3 py-1.5 rounded-lg bg-[#f59e0b]/15 text-[#fbbf24] text-xs font-medium flex items-center gap-1 hover:bg-[#f59e0b]/25 transition-all disabled:opacity-50">
                {hintLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-3 h-3" />}
                {hintLoading ? "Ойлауда..." : "Подсказка алу"}
              </button>
            </div>
          </div>
          {showHint && (
            hintLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#94a3b8]"><Loader2 className="w-4 h-4 animate-spin text-[#fbbf24]" /> AI ойлауда...</div>
            ) : hint ? (
              <div className="text-sm text-[#e2e8f0] leading-relaxed bg-white/[0.03] rounded-xl p-3">{hint}</div>
            ) : null
          )}
          {!online && showHint && (
            <div className="flex items-center gap-2 text-xs text-amber-400 mt-2"><AlertTriangle className="w-3 h-3" /> Сервер offline — локалды подсказка</div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] text-[#e2e8f0] text-sm disabled:opacity-30 transition-all"><ChevronLeft className="w-4 h-4" /> Алдыңғы</button>
          {current < test.questions.length - 1 ? (
            <button onClick={() => setCurrent(current + 1)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-medium shadow-lg shadow-[#10b981]/20 transition-all">Келесі <ChevronRight className="w-4 h-4" /></button>
          ) : (
            <button onClick={handleFinish} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white text-sm font-semibold shadow-lg shadow-[#3b82f6]/20 transition-all">Аяқтау <CheckCircle className="w-4 h-4" /></button>
          )}
        </div>
      </div>
    </div>
  );
}
