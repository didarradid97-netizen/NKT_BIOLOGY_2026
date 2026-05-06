// ============================================
// 🤖📄 AI ТЕСТ ГЕНЕРАТОРЫ (КАЗАХСКИЙ)
// ============================================
import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { saveCustomTest } from "@/lib/customTestStorage";
import { useTilt } from "@/hooks/use3DEffects";
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Upload,
  Loader2,
  Save,
  Check,
  AlertCircle,
  Wand2,
  Wifi,
  WifiOff,
} from "lucide-react";

// ✅ Groq API тікелей фронтендтен
async function generateTestsWithGroq(content: string, count: number): Promise<any[]> {
  const apiKey = (import.meta as Record<string, unknown> & { env: Record<string, string> }).env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_GROQ_API_KEY табылмады. Vercel → Settings → Environment Variables-қа қосыңыз.");
  }

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
          content: `Сен — NKT BIOLOGY платформасының AI тест генераторысың. Биология мәтінінен қазақша тест сұрақтары жасайсың.

Ережелер:
1. ҚАЗАҚША тест сұрақтары
2. Әр сұрақта 4 нұсқа (A, B, C, D)
3. Дұрыс жауапты белгіле
4. Түсініктеме бер
5. ОЗП/ҰБТ деңгейінде қиындық
6. Тек JSON форматында жауап бер:

[
  {
    "text": "Сұрақ мәтіні",
    "options": ["A нұсқа", "B нұсқа", "C нұсқа", "D нұсқа"],
    "correctAnswer": 0,
    "explanation": "Түсініктеме"
  }
]`,
        },
        {
          role: "user",
          content: `Мына мәтін бойынша ${count} тест сұрағы жаса:\n\n${content.slice(0, 3000)}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq қате: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content;
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : parsed.questions || [];
}

// Fallback — егер Groq API жоқ болса
function getFallbackQuestions(content: string): any[] {
  const lower = content.toLowerCase();
  const questions: any[] = [];

  if (lower.includes("фотосинтез") || lower.includes("хлоропласт") || lower.includes("хлорофилл")) {
    questions.push(
      { id: "f1", text: "Фотосинтез процесінде не түзіледі?", options: ["Глюкоза және оттегі", "Су және CO₂", "Азот", "Аммиак"], correctAnswer: 0, explanation: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂" },
      { id: "f2", text: "Фотосинтез қай органеллада жүреді?", options: ["Митохондрия", "Хлоропласт", "Рибосома", "Лизосома"], correctAnswer: 1, explanation: "Хлоропластта хлорофилл бар" },
      { id: "f3", text: "Фотосинтездің жарық фазасында түзіледі:", options: ["АТП және NADPH", "Глюкоза", "CO₂", "Су"], correctAnswer: 0, explanation: "Жарық реакцияларында АТП және NADPH түзіледі" },
    );
  }
  if (lower.includes("жасуша") || lower.includes("клетка") || lower.includes("митохондрия")) {
    questions.push(
      { id: "c1", text: "Жасушаның энергетикалық станциясы қайсы?", options: ["Ядро", "Митохондрия", "Рибосома", "Гольджи"], correctAnswer: 1, explanation: "Митохондрияда АТФ түзіледі" },
      { id: "c2", text: "Прокариоттарда жоқ органелла:", options: ["Рибосома", "Плазмида", "Ядро", "Цитоплазма"], correctAnswer: 2, explanation: "Прокариоттарда нақты ядро жоқ" },
    );
  }
  if (lower.includes("днк") || lower.includes("генетик") || lower.includes("репликац")) {
    questions.push(
      { id: "d1", text: "ДНҚ құрамында қандай азотты негіздер бар?", options: ["Аденин, Гуанин, Цитозин, Тимин", "Аденин, Урацил", "Тимин, Урацил", "Ксантин"], correctAnswer: 0, explanation: "A-T, G-C. Урацил тек РНҚ-да" },
      { id: "d2", text: "ДНҚ репликациясы қай фазада жүреді?", options: ["G1", "S", "G2", "M"], correctAnswer: 1, explanation: "S-фазасы — синтез фазасы" },
    );
  }

  if (questions.length === 0) {
    questions.push(
      { id: "g1", text: "Берілген мәтін бойынша негізгі ұғым не?", options: [content.slice(0, 30) + "...", "Жасуша биологиясы", "Генетика", "Экология"], correctAnswer: 0, explanation: "Мәтіннің негізгі идеясы" },
      { id: "g2", text: "ОЗП биология пәнінде осы тақырып қандай үлесті алады?", options: ["30%", "25%", "15%", "10%"], correctAnswer: 2, explanation: "Тақырыпқа байланысты" },
    );
  }

  return questions;
}

export default function AITestGenerator() {
  const navigate = useNavigate();
  const [source, setSource] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Негізгі");
  const [timeLimit, setTimeLimit] = useState(30);
  const [questionCount, setQuestionCount] = useState(10);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const { ref: cardRef, style: cardStyle } = useTilt(10);

  const handleGenerate = async () => {
    setError("");
    setGenerated(null);

    let content = "";
    if (source === "text") {
      if (!text.trim() || text.trim().length < 20) {
        setError("Мәтін 20 таңбадан кем болмауы керек");
        return;
      }
      content = text.trim();
    } else {
      if (!file) {
        setError("Файл таңдаңыз");
        return;
      }
      try {
        content = await file.text();
      } catch {
        setError("Файлды оқу қатесі");
        return;
      }
    }

    setLoading(true);
    try {
      const questions = await generateTestsWithGroq(content, questionCount);

      if (!questions || questions.length === 0) {
        throw new Error("Сұрақтар бос");
      }

      const test = {
        id: "ai_" + Date.now(),
        title: title || "AI Тест",
        description: content.slice(0, 80) + "...",
        category,
        timeLimit,
        questions: questions.map((q: any, i: number) => ({
          id: "ai_" + i,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setGenerated(test);
      setOnline(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Белгісіз қате";
      console.error("Groq error:", errorMsg);

      // Fallback
      const fallbackQuestions = getFallbackQuestions(content);
      const test = {
        id: "ai_" + Date.now(),
        title: title || "AI Тест (Fallback)",
        description: content.slice(0, 80) + "...",
        category,
        timeLimit,
        questions: fallbackQuestions.slice(0, questionCount),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setGenerated(test);
      setOnline(false);
      setError("⚠️ " + errorMsg + "\nЛокалды сұрақтар берілді.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!generated) return;
    saveCustomTest(generated);
    navigate("/my-tests");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      <nav className="sticky top-0 z-50 bg-[#0f172a]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-medium text-[#94a3b8] hover:text-[#6ee7b7] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Артқа
          </button>
          <h1 className="font-bold text-lg bg-gradient-to-r from-[#a855f7] to-[#3b82f6] bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#a855f7]" /> AI Тест Генераторы
          </h1>
          <div className="flex items-center gap-2">
            {online ? <Wifi className="w-4 h-4 text-[#10b981]" /> : <WifiOff className="w-4 h-4 text-red-400" />}
          </div>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-4 py-8">
        {!generated ? (
          <div className="space-y-6">
            <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl w-fit mx-auto">
              <button onClick={() => setSource("text")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${source === "text" ? "bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/25" : "text-[#64748b] hover:text-[#cbd5e1]"}`}>
                <FileText className="w-4 h-4 inline mr-1" /> Мәтін
              </button>
              <button onClick={() => setSource("file")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${source === "file" ? "bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/25" : "text-[#64748b] hover:text-[#cbd5e1]"}`}>
                <Upload className="w-4 h-4 inline mr-1" /> Файл (TXT)
              </button>
            </div>

            <div ref={cardRef} style={cardStyle} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              {source === "text" ? (
                <div>
                  <label className="block text-xs text-[#64748b] mb-2">Биология мәтінін қойыңыз</label>
                  <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Мысалы: Фотосинтез — жарық энергиясын химиялық энергияға айналдыру процесі..." rows={10}
                    className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#a855f7] resize-none" />
                  <p className="text-xs text-[#475569] mt-1">{text.length} таңба • кемінде 20</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-white/[0.14] rounded-2xl p-8 text-center hover:border-[#a855f7]/40 hover:bg-white/[0.02] transition-all cursor-pointer">
                    <Upload className="w-10 h-10 text-[#475569] mx-auto mb-3" />
                    <p className="text-sm text-[#cbd5e1] font-medium">{file ? file.name : "TXT файлын жүктеңіз"}</p>
                    <p className="text-xs text-[#475569] mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Макс. 5MB • тек TXT"}</p>
                  </div>
                  <input ref={fileRef} type="file" accept=".txt,text/plain" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div><label className="block text-xs text-[#64748b] mb-1">Атауы</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="AI Тест" className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#a855f7]" /></div>
                <div><label className="block text-xs text-[#64748b] mb-1">Санат</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#a855f7]">{["Негізгі", "Тереңдетілген", "Толық", "Жаңа"].map((c) => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}</select></div>
                <div><label className="block text-xs text-[#64748b] mb-1">Уақыт (мин)</label><input type="number" min={1} max={120} value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#a855f7]" /></div>
                <div><label className="block text-xs text-[#64748b] mb-1">Сұрақ саны</label><input type="number" min={1} max={20} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#a855f7]" /></div>
              </div>

              {error && <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}

              <button onClick={handleGenerate} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#3b82f6] text-white font-semibold text-sm shadow-lg shadow-[#a855f7]/20 hover:shadow-[#a855f7]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                {loading ? "Генерациялауда..." : "Тест генерациялау"}
              </button>
              <p className="text-[10px] text-[#475569] text-center">Groq AI · Llama 3.3 70B · Тест генерациясы</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#e2e8f0]">{generated.title} — {generated.questions.length} сұрақ {!online && <span className="text-xs text-amber-400">(Fallback)</span>}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setGenerated(null)} className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-sm font-medium hover:bg-white/[0.10] transition-all">Қайта</button>
                <button onClick={handleSave} className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-semibold shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 flex items-center gap-2 transition-all"><Save className="w-4 h-4" /> Сақтау</button>
              </div>
            </div>
            <div className="space-y-3">
              {generated.questions.map((q: any, i: number) => (
                <div key={q.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#a855f7]/15 text-[#a78bfa] text-xs font-bold flex items-center justify-center border border-[#a855f7]/20">{i + 1}</span>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-[#e2e8f0]">{q.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {q.options.map((opt: string, j: number) => (
                          <div key={j} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${j === q.correctAnswer ? "bg-[#10b981]/10 border border-[#10b981]/30 text-[#6ee7b7]" : "bg-white/[0.03] border border-white/[0.06] text-[#94a3b8]"}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${j === q.correctAnswer ? "bg-[#10b981] text-white" : "bg-white/[0.08] text-[#64748b]"}`}>{String.fromCharCode(65 + j)}</span>
                            {opt}
                            {j === q.correctAnswer && <Check className="w-3.5 h-3.5 ml-auto text-[#10b981]" />}
                          </div>
                        ))}
                      </div>
                      {q.explanation && <p className="text-xs text-[#64748b] mt-2 bg-white/[0.03] rounded-lg p-2"><span className="text-[#a855f7] font-medium">Түсініктеме:</span> {q.explanation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
