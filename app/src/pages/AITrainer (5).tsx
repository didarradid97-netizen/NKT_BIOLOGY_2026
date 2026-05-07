// ============================================
// 🤖 AI ЖАТТЫҚТЫРУШЫ — Backend API арқылы (қауіпсіз)
// ============================================
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { use3DCard } from "@/hooks/use3DEffects";
import {
  Bot, Send, User, Trash2, Sparkles, ArrowLeft, Loader2,
  BrainCircuit, BookOpen, Wifi, WifiOff, AlertTriangle
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ✅ Backend API — API Key серверде қалады
const API_URL = "/api/chat";

// Fallback — егер сервер offline
const FALLBACK_RESPONSES: Record<string, string> = {
  жасуша: "Жасуша — тірі ағзалардың құрылымдық негізгі бірлігі. Эукариоттарда: ядро, митохондрия, хлоропласт, рибосома, Гольджи, ЭПТ, лизосома, вакуоль. Прокариоттарда: нуклеоид, рибосома 70S, плазмида.",
  фотосинтез: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Хлоропластта жүреді. Жарық фазасы: АТП + NADPH. Кальвин циклі: CO₂ → глюкоза.",
  днк: "ДНҚ — екі тізбекті спираль. A-T, G-C. Репликация: S-фаза. Транскрипция: ДНҚ→иРНҚ. Трансляция: иРНҚ→ақуыз.",
  митоз: "Профаза → метафаза → анафаза → телофаза. 2n→2n. Соматикалық жасушалар.",
  мейоз: "2 бөліну. I: гомологиялық ажырау + кроссинговер. II: сестриндік ажырау. 2n→n. Гаметалар.",
  эволюция: "Дарвин: өзгергіштік + табиғи сұрыпталу. Мутациялар → арекеттесу → изоляция.",
  экология: "Экожүйе: өндірушілер → тұтынушылар → ыдыратқыштар. 10% энергия заңы.",
  қан: "Эритроцит (гемоглобин), лейкоцит (қорғаныс), тромбоцит (қанықтыру). 4 топ + Rh.",
  озп: "ОЗП: 40 сұрақ, 2 сағат. Клетка 30%, генетика 25%, эволюция 15%, экология 15%, анатомия 15%.",
};

function getLocalAnswer(q: string): string {
  const lower = q.toLowerCase();
  for (const [key, val] of Object.entries(FALLBACK_RESPONSES)) {
    if (lower.includes(key)) return val + "\n\n⚠️ (Сервер offline — локалды жауап)";
  }
  return "Сервер offline. Негізгі тақырыптар: жасуша, фотосинтез, ДНҚ, митоз/мейоз, эволюция, экология, қан.\n\n💡 GROQ_API_KEY тексеріңіз.";
}

const getChatHistory = (): Message[] => {
  try { return JSON.parse(localStorage.getItem("nkt_chat_history") || "[]"); } catch { return []; }
};
const saveChatMessage = (msg: Message) => {
  const h = getChatHistory(); h.push(msg); localStorage.setItem("nkt_chat_history", JSON.stringify(h.slice(-100)));
};
const clearChatHistory = () => localStorage.removeItem("nkt_chat_history");

export default function AITrainer() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [online, setOnline] = useState(true);
  const [errorInfo, setErrorInfo] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { cardRef, transform } = use3DCard();

  useEffect(() => {
    const history = getChatHistory();
    if (history.length > 0) { setMessages(history); setShowWelcome(false); }
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim(), timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); saveChatMessage(userMsg); setInput(""); setShowWelcome(false); setLoading(true); setErrorInfo("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const fallback = getLocalAnswer(userMsg.content);
        const assistantMsg: Message = { role: "assistant", content: fallback, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, assistantMsg]); saveChatMessage(assistantMsg); setOnline(false);
        setErrorInfo(`API қате: ${res.status}. GROQ_API_KEY тексеріңіз.`);
        setLoading(false); return;
      }

      const data = await res.json();
      const assistantMsg: Message = { role: "assistant", content: data.response || "Жауап алу мүмкін болмады.", timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMsg]); saveChatMessage(assistantMsg); setOnline(true);
    } catch (err: any) {
      const fallback = getLocalAnswer(userMsg.content);
      const assistantMsg: Message = { role: "assistant", content: fallback, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMsg]); saveChatMessage(assistantMsg); setOnline(false);
      setErrorInfo(err.message || "Серверге қосылу мүмкін болмады");
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };
  const handleClear = () => {
    if (confirm("Барлық әңгімені жою керек пе?")) { clearChatHistory(); setMessages([]); setShowWelcome(true); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      <nav className="sticky top-0 z-50 bg-[#0f172a]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-medium text-[#94a3b8] hover:text-[#6ee7b7] transition-colors"><ArrowLeft className="w-4 h-4" /> Артқа</button>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#10b981]" />
            <span className="font-bold bg-gradient-to-r from-[#34d399] to-[#3b82f6] bg-clip-text text-transparent">AI Жаттықтырушы</span>
            {online ? <Wifi className="w-3.5 h-3.5 text-[#10b981]" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
          </div>
          <button onClick={handleClear} className="p-2 rounded-lg bg-white/[0.06] hover:bg-red-500/15 text-[#94a3b8] hover:text-red-400 transition-all" title="Тазалау"><Trash2 className="w-4 h-4" /></button>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-4 py-6 flex flex-col h-[calc(100vh-64px)]">
        {showWelcome && messages.length === 0 && (
          <div ref={cardRef} className="flex-1 flex flex-col items-center justify-center text-center" style={{ transform }}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center mb-6 shadow-lg shadow-[#10b981]/20"><Bot className="w-10 h-10 text-white" /></div>
            <h1 className="text-2xl font-bold mb-2">AI Биология Жаттықтырушысы</h1>
            <p className="text-[#94a3b8] max-w-md mb-8">Groq AI (llama-3.3-70b) арқылы нақты жауап. Сервер offline болса — локалды жауап беремін.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {["Жасуша құрылысы қандай?", "Фотосинтез процесі қалай жүреді?", "ДНҚ репликациясы дегеніміз не?", "Мейоз бен митоздың айырмашылығы?"].map(q => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left text-sm text-[#cbd5e1] hover:bg-white/[0.08] hover:border-[#10b981]/30 transition-all"><Sparkles className="w-3.5 h-3.5 text-[#10b981] mb-1 inline mr-1" />{q}</button>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-[#475569]"><BookOpen className="w-3.5 h-3.5" />Groq AI • Fallback • 9 тақырып</div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-gradient-to-br from-[#3b82f6] to-[#10b981]" : "bg-gradient-to-br from-[#10b981] to-[#059669]"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${msg.role === "user" ? "bg-[#3b82f6]/20 border border-[#3b82f6]/30 text-[#e2e8f0]" : "bg-white/[0.05] border border-white/[0.08] text-[#e2e8f0]"}`}>{msg.content}</div>
              </div>
            ))}
            {loading && <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div><div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3"><Loader2 className="w-4 h-4 text-[#10b981] animate-spin" /></div></div>}
            <div ref={messagesEndRef} />
          </div>
        )}

        {errorInfo && (
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            {errorInfo}
          </div>
        )}

        <div className="border-t border-white/[0.08] pt-4">
          <div className="flex gap-2 items-end">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Қазақша сұрақ жазыңыз..." rows={1}
              className="flex-1 bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#64748b] outline-none focus:border-[#10b981] resize-none min-h-[44px] max-h-[120px]" />
            <button onClick={handleSend} disabled={!input.trim() || loading} className="h-11 px-4 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold text-sm shadow-lg disabled:opacity-40 transition-all flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}<span className="hidden sm:inline">Жіберу</span>
            </button>
          </div>
          <p className="text-[10px] text-[#475569] mt-2 text-center">🤖 Backend API • Groq AI • llama-3.3-70b</p>
        </div>
      </div>
    </div>
  );
}
