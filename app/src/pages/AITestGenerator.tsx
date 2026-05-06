// ============================================
// 🤖📄 AI ТЕСТ ГЕНЕРАТОРЫ — СЕРВЕРСІЗ (ТЕК КЛИЕНТ)
// ============================================
import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { isAuthenticated } from "@/lib/storage";
import { saveCustomTest, CustomTest, CustomQuestion } from "@/lib/customTestStorage";
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
} from "lucide-react";

export default function AITestGenerator() {
  const navigate = useNavigate();
  const [source, setSource] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<CustomTest | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Негізгі");
  const [timeLimit, setTimeLimit] = useState(30);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { ref: cardRef, style: cardStyle } = useTilt(10);

  if (!isAuthenticated()) {
    navigate("/login");
    return null;
  }

  const handleGenerate = async () => {
    setError("");
    setGenerated(null);

    let content = "";
    if (source === "text") {
      if (!text.trim() || text.trim().length < 30) {
        setError("Мәтін 30 таңбадан кем болмауы керек");
        return;
      }
      content = text.trim();
    } else {
      if (!file) {
        setError("Файл таңдаңыз");
        return;
      }
      try {
        content = await parseFileClientOnly(file);
      } catch (e) {
        setError("Файлды оқу қатесі: " + (e as Error).message);
        return;
      }
    }

    setLoading(true);
    // Имитация AI өңдеу уақыты
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const questions = generateQuestionsFromText(content);

    if (questions.length === 0) {
      setError("Сұрақтар генерацияланбады. Мәтінді толығырақ жазыңыз немесе TXT файл жүктеңіз.");
      setLoading(false);
      return;
    }

    const test: CustomTest = {
      id: "ai_" + Date.now(),
      title: title || "Автоматты тест",
      description: `Мәтіннен генерацияланған: ${content.slice(0, 80)}...`,
      category,
      timeLimit,
      questions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGenerated(test);
    setLoading(false);
  };

  const handleSave = () => {
    if (!generated) return;
    const final = { ...generated, title: title || generated.title };
    saveCustomTest(final);
    navigate("/my-tests");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      <nav className="sticky top-0 z-50 bg-[#0f172a]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium text-[#94a3b8] hover:text-[#6ee7b7] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Артқа
          </button>
          <h1 className="font-bold text-lg bg-gradient-to-r from-[#a855f7] to-[#3b82f6] bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#a855f7]" />
            AI Тест Генераторы
          </h1>
          <div className="w-16" />
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-4 py-8">
        {!generated ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl w-fit mx-auto">
              <button
                onClick={() => setSource("text")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  source === "text"
                    ? "bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/25"
                    : "text-[#64748b] hover:text-[#cbd5e1]"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Мәтін
              </button>
              <button
                onClick={() => setSource("file")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  source === "file"
                    ? "bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/25"
                    : "text-[#64748b] hover:text-[#cbd5e1]"
                }`}
              >
                <Upload className="w-4 h-4 inline mr-1" />
                Файл (TXT)
              </button>
            </div>

            <div
              ref={cardRef}
              style={cardStyle}
              className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 space-y-4"
            >
              {source === "text" ? (
                <div>
                  <label className="block text-xs text-[#64748b] mb-2">
                    Биология мәтінін қойыңыз (теория, тақырып, оқулық үзіндісі)
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Мысалы: Фотосинтез — жарық энергиясын химиялық энергияға айналдыру процесі. Жасыл өсімдіктерде жүретін басты процесс..."
                    rows={10}
                    className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#a855f7] focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] resize-none"
                  />
                  <p className="text-xs text-[#475569] mt-1">
                    {text.length} таңба • кемінде 30 таңба
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-white/[0.14] rounded-2xl p-8 text-center hover:border-[#a855f7]/40 hover:bg-white/[0.02] transition-all cursor-pointer"
                  >
                    <Upload className="w-10 h-10 text-[#475569] mx-auto mb-3" />
                    <p className="text-sm text-[#cbd5e1] font-medium">
                      {file ? file.name : "TXT файлын жүктеңіз"}
                    </p>
                    <p className="text-xs text-[#475569] mt-1">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : "Макс. 5MB • тек TXT"}
                    </p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,text/plain"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                    ⚠️ PDF/DOCX файлдары браузерде оқылмайды. Алдын ала TXT-ке аударыңыз.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[#64748b] mb-1">Тест атауы</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Автоматты атау"
                    className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[#a855f7]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#64748b] mb-1">Санат</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#a855f7]"
                  >
                    {["Негізгі", "Тереңдетілген", "Толық", "Жаңа"].map((c) => (
                      <option key={c} value={c} className="bg-[#0f172a]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#64748b] mb-1">Уақыт (мин)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-[#f1f5f9] outline-none focus:border-[#a855f7]"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#3b82f6] text-white font-semibold text-sm shadow-lg shadow-[#a855f7]/20 hover:shadow-[#a855f7]/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                {loading ? "Генерациялауда..." : "Тест генерациялау"}
              </button>

              <p className="text-[10px] text-[#475569] text-center">
                🧠 Мәтіннен автоматты сұрақ жасау — серверсіз. Тек браузерде жұмыс істейді.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#e2e8f0]">
                {generated.title} — {generated.questions.length} сұрақ
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGenerated(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-sm font-medium hover:bg-white/[0.10] transition-all"
                >
                  Қайта
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-semibold shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Сақтау
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {generated.questions.map((q, i) => (
                <div
                  key={q.id}
                  className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#a855f7]/15 text-[#a78bfa] text-xs font-bold flex items-center justify-center border border-[#a855f7]/20">
                      {i + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-[#e2e8f0]">{q.text}</p>
                      {q.image && (
                        <img
                          src={q.image}
                          alt=""
                          className="max-h-40 rounded-xl border border-white/[0.08]"
                        />
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {q.options.map((opt, j) => (
                          <div
                            key={j}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                              j === q.correctAnswer
                                ? "bg-[#10b981]/10 border border-[#10b981]/30 text-[#6ee7b7]"
                                : "bg-white/[0.03] border border-white/[0.06] text-[#94a3b8]"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                j === q.correctAnswer
                                  ? "bg-[#10b981] text-white"
                                  : "bg-white/[0.08] text-[#64748b]"
                              }`}
                            >
                              {String.fromCharCode(65 + j)}
                            </span>
                            {opt}
                            {j === q.correctAnswer && (
                              <Check className="w-3.5 h-3.5 ml-auto text-[#10b981]" />
                            )}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-[#64748b] mt-2 bg-white/[0.03] rounded-lg p-2">
                          <span className="text-[#a855f7] font-medium">Түсініктеме:</span>{" "}
                          {q.explanation}
                        </p>
                      )}
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

// ========== КЛИЕНТ-САЙД ПАРСИНГ ==========

async function parseFileClientOnly(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "txt" || file.type === "text/plain") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("TXT файлды оқу қатесі"));
      reader.readAsText(file);
    });
  }
  throw new Error("Тек TXT файлдар қолдау көрсетіледі. PDF/DOCX алдын ала TXT-ке аударыңыз.");
}

// ========== МӘТІННЕН СҰРАҚ ГЕНЕРАЦИЯСЫ ==========

const TOPIC_TEMPLATES: Record<string, CustomQuestion[]> = {
  "фотосинтез": [
    { id: "t1", text: "Фотосинтез процесінде не түзіледі?", options: ["Глюкоза және оттегі", "Су және көмірқышқыл газы", "Азот және оттегі", "Аммиак және су"], correctAnswer: 0, explanation: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂" },
    { id: "t2", text: "Фотосинтез қай органеллада жүреді?", options: ["Митохондрия", "Хлоропласт", "Рибосома", "Лизосома"], correctAnswer: 1, explanation: "Хлоропластта хлорофилл пигменті бар" },
    { id: "t3", text: "Фотосинтездің жарық фазасында түзіледі:", options: ["АТФ және NADPH", "Глюкоза", "CO₂", "Су"], correctAnswer: 0, explanation: "Жарық реакцияларында АТФ және NADPH синтезделеді" },
  ],
  "жасуша": [
    { id: "t4", text: "Жасушаның энергетикалық станциясы қайсы?", options: ["Ядро", "Митохондрия", "Рибосома", "Гольджи"], correctAnswer: 1, explanation: "Митохондрияда АТФ түзіледі" },
    { id: "t5", text: "Прокариоттық жасушаларда жоқ нәрсе:", options: ["Рибосома", "Плазмида", "Ядро", "Цитоплазма"], correctAnswer: 2, explanation: "Прокариоттарда нақты ядро жоқ, тек нуклеоид бар" },
    { id: "t6", text: "Ақуыз синтезі қайсыда жүреді?", options: ["Рибосомада", "Митохондрияда", "Лизосомада", "Вакуольде"], correctAnswer: 0, explanation: "Рибосомалар — ақуыз синтезінің негізгі орны" },
  ],
  "днк": [
    { id: "t7", text: "ДНҚ құрамында қандай азотты негіздер бар?", options: ["Аденин, гуанин, цитозин, тимин", "Аденин, гуанин, цитозин, урацил", "Аденин, тимин, урацил, гуанин", "Тимин, цитозин, урацил, ксантин"], correctAnswer: 0, explanation: "ДНҚ-да A-T, G-C жұптары. Урацил тек РНҚ-да" },
    { id: "t8", text: "ДНҚ репликациясы қай фазада жүреді?", options: ["G1", "S", "G2", "M"], correctAnswer: 1, explanation: "S-фазасы — синтез, ДНҚ көбейтіледі" },
    { id: "t9", text: "Транскрипция нәтижесі:", options: ["иРНҚ", "Ақуыз", "ДНҚ", "тРНҚ"], correctAnswer: 0, explanation: "Транскрипция — ДНҚ → иРНҚ синтезі" },
  ],
  "эволюция": [
    { id: "t10", text: "Табиғи сұрыпталуды кім ұсынды?", options: ["Дарвин", "Ламарк", "Мендель", "Вейсман"], correctAnswer: 0, explanation: "Чарльз Дарвин 1859 жылы 'Түрлердің пайда болуы' кітабында" },
    { id: "t11", text: "Эволюция материалы не?", options: ["Мутациялар", "Миграция", "Изоляция", "Сұрыпталу"], correctAnswer: 0, explanation: "Мутациялар — генетикалық өзгерістердің көзі" },
  ],
  "экология": [
    { id: "t12", text: "Экожүйедегі энергия ағыны бойынша дұрыс тізбек:", options: ["Өндіруші → тұтынушы → ыдыратқыш", "Тұтынушы → өндіруші → ыдыратқыш", "Ыдыратқыш → өндіруші → тұтынушы", "Тұтынушы → ыдыратқыш → өндіруші"], correctAnswer: 0, explanation: "Өсімдіктер → жануарлар → бактериялар/саңырауқұлақтар" },
    { id: "t13", text: "Линдеман заңы бойынша энергия неше пайыз өтеді?", options: ["10%", "50%", "90%", "1%"], correctAnswer: 0, explanation: "Әр трофикалық деңгейге энергияның ~10%-ы өтеді" },
  ],
  "қан": [
    { id: "t14", text: "Қанның жасушалық элементтерінің үлесі:", options: ["45%", "55%", "30%", "70%"], correctAnswer: 0, explanation: "Плазма 55%, формал элементтер 45%" },
    { id: "t15", text: "Оттегін тасымалдайтын қан жасушасы:", options: ["Лейкоцит", "Тромбоцит", "Эритроцит", "Лимфоцит"], correctAnswer: 2, explanation: "Эритроциттердегі гемоглобин O₂ байлайды" },
  ],
};

function detectTopic(text: string): string | null {
  const t = text.toLowerCase();
  for (const topic of Object.keys(TOPIC_TEMPLATES)) {
    if (t.includes(topic)) return topic;
  }
  // Синонимдер
  if (t.includes("клетка") || t.includes("клеточ")) return "жасуша";
  if (t.includes("фотосинтез") || t.includes("хлорофилл")) return "фотосинтез";
  if (t.includes("ген") || t.includes("днк") || t.includes("днқ") || t.includes("репликац")) return "днк";
  if (t.includes("эволюц") || t.includes("сұрыпталу") || t.includes("видообразован")) return "эволюция";
  if (t.includes("эколог") || t.includes("экожүйе") || t.includes("биогеоценоз")) return "экология";
  if (t.includes("қан") || t.includes("кровь") || t.includes("жүрек") || t.includes("сердце")) return "қан";
  return null;
}

function generateQuestionsFromText(text: string): CustomQuestion[] {
  const topic = detectTopic(text);
  if (topic && TOPIC_TEMPLATES[topic]) {
    // Тақырыптық сұрақтарды клондау, мәтінге сәйкестендіру
    const base = TOPIC_TEMPLATES[topic];
    return base.map((q, i) => ({ ...q, id: "ai_" + Date.now() + "_" + i }));
  }

  // Мәтіннен сөйлемдерді сұраққа түрлендіру
  const sentences = text
    .replace(/[.!?]+/g, ".")
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 180);

  // Сұрақ жасайтын сөйлемдерді таңдау
  const knowledgePatterns = [
    { pattern: /(\S+\s+\S+\s+\S+)\s+—\s+(.+)/, make: (m: RegExpMatchArray) => `${m[1]} не дегеніміз не?` },
    { pattern: /(.+)\s+жүреді\s+(.+)/, make: (m: RegExpMatchArray) => `${m[1]} қайда жүреді?` },
    { pattern: /(.+)\s+түзіледі/, make: (m: RegExpMatchArray) => `${m[1]} нәтижесінде не түзіледі?` },
    { pattern: /(.+)\s+функция/, make: (m: RegExpMatchArray) => `${m[1]} функциясы қандай?` },
  ];

  const questions: CustomQuestion[] = [];

  for (const sentence of sentences.slice(0, 8)) {
    let qText = sentence.length > 60 ? sentence.slice(0, 60) + "..." : sentence;
    for (const kp of knowledgePatterns) {
      const match = sentence.match(kp.pattern);
      if (match) {
        qText = kp.make(match);
        break;
      }
    }

    // Дистракторлар жасау
    const words = sentence.split(/\s+/).filter((w) => w.length > 4);
    const correct = words[0] || "Дұрыс";
    const opts = [
      correct,
      words[1] || "Жоқ",
      words[2] || "Белгісіз",
      words[3] || "Қате",
    ];

    questions.push({
      id: "auto_" + questions.length,
      text: qText + " (Мәтіннен алынған)",
      options: opts,
      correctAnswer: 0,
      explanation: `Мәтін: "${sentence.slice(0, 90)}..."`,
    });

    if (questions.length >= 5) break;
  }

  // Егер тым аз болса, жалпы сұрақ қосу
  if (questions.length === 0) {
    questions.push({
      id: "auto_0",
      text: "Берілген мәтін бойынша негізгі тақырып не?",
      options: [text.slice(0, 30) + "...", "Басқа тақырып", "Анық емес", "Мәтінсіз"],
      correctAnswer: 0,
      explanation: "Мәтіннің негізгі идеясын таңдаңыз",
    });
  }

  return questions;
}
