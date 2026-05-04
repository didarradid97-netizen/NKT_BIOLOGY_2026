// ============================================
// 🤖 AI ЖАТТЫҚТЫРУШЫ (КАЗАХСКИЙ)
// ============================================
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { isAuthenticated } from "@/lib/auth";
import { getChatHistory, saveChatMessage, clearChatHistory } from "@/lib/aiStorage";
import { use3DCard } from "@/hooks/use3DEffects";
import {
  Bot,
  Send,
  User,
  Trash2,
  Sparkles,
  ArrowLeft,
  Loader2,
  BrainCircuit,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ✅ Groq API тікелей фронтендтен шақыру
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function askGroq(messages: { role: string; content: string }[]): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("VITE_GROQ_API_KEY табылмады");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Сен NKT мектебінің биология мұғалімісің. Оқушыларға қазақ тілінде түсінікті, қысқа және нақты жауап бер. Тақырыптар: жасуша, генетика, фотосинтез, эволюция, экология, физиология.",
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || "Groq қате қайтарды");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export default function AITrainer() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { cardRef, transform } = use3DCard();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const history = getChatHistory();
    if (history.length > 0) {
      setMessages(history);
      setShowWelcome(false);
    }
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveChatMessage(userMsg);
    setInput("");
    setShowWelcome(false);
    setLoading(true);

    try {
      const content = await askGroq(
        newMessages.map((m) => ({ role: m.role, content: m.content }))
      );

      const assistantMsg: Message = {
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      saveChatMessage(assistantMsg);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Белгісіз қате";
      const fallbackMsg: Message = {
        role: "assistant",
        content: `⚠️ Қате: ${errorMsg}\n\n${getLocalResponse(userMsg.content)}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      saveChatMessage(fallbackMsg);
    } finally {
      setLoading(false);
    }
  };

  const getLocalResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes("клетка") || q.includes("жасуша"))
      return "Жасуша — тірі ағзалардың құрылымдық және функционалдық негізгі бірлігі. Прокариоттық және эукариоттық жасушаларға бөлінеді.";
    if (q.includes("фотосинтез"))
      return "Фотосинтез — жарық энергиясын химиялық энергияға айналдыру процесі. 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.";
    if (q.includes("днк") || q.includes("ген"))
      return "ДНК — генетикалық ақпарат тасымалдаушы. Двойты спираль құрылымы, нуклеотидтерден тұрады.";
    if (q.includes("эволюция"))
      return "Эволюция — тірі ағзалардың өзгеруі. Механизмдері: табиғи сұрыпталу, мутациялар, генетикалық айырбас.";
    return "Интернет байланысын тексеріңіз немесе басқа сұрақ қойыңыз.";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (confirm("Барлық әңгімені жою керек пе?")) {
      clearChatHistory();
      setMessages([]);
      setShowWelcome(true);
    }
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
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#10b981]" />
            <span className="font-bold bg-gradient-to-r from-[#34d399] to-[#3b82f6] bg-clip-text text-transparent">
              AI Жаттықтырушы
            </span>
          </div>
          <button
            onClick={handleClear}
            className="p-2 rounded-lg bg-white/[0.06] hover:bg-red-500/15 text-[#94a3b8] hover:text-red-400 transition-all"
            title="Тазалау"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
        {showWelcome && messages.length === 0 && (
          <div
            ref={cardRef}
            className="flex-1 flex flex-col items-center justify-center text-center"
            style={{ transform }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center mb-6 shadow-lg shadow-[#10b981]/20">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">AI Биология Жаттықтырушысы</h1>
            <p className="text-[#94a3b8] max-w-md mb-8">
              Маған қазақша сұрақ қойыңыз — жасуша, генетика, эволюция, экология,
              физиология тақырыптарында көмектесемін.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {[
                "Жасуша құрылысы қандай?",
                "Фотосинтез процесі қалай жүреді?",
                "ДНҚ репликациясы дегеніміз не?",
                "ОЗП-ға қалай дайындалу керек?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left text-sm text-[#cbd5e1] hover:bg-white/[0.08] hover:border-[#10b981]/30 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#10b981] mb-1 inline mr-1" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#3b82f6] to-[#10b981]"
                      : "bg-gradient-to-br from-[#10b981] to-[#059669]"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#3b82f6]/20 border border-[#3b82f6]/30 text-[#e2e8f0]"
                      : "bg-white/[0.05] border border-white/[0.08] text-[#e2e8f0]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 text-[#10b981] animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="border-t border-white/[0.08] pt-4">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Қазақша сұрақ жазыңыз..."
              rows={1}
              className="flex-1 bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#64748b] outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] resize-none min-h-[44px] max-h-[120px]"
              style={{ scrollbarWidth: "thin" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="h-11 px-4 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Жіберу</span>
            </button>
          </div>
          <p className="text-[10px] text-[#475569] mt-2 text-center">
            Groq AI · Llama 3.3 70B · Қазақша биология жаттықтырушысы
          </p>
        </div>
      </div>
    </div>
  );
}
