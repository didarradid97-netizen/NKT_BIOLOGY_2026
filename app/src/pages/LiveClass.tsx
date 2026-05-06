import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { isAuthenticated } from "@/lib/auth";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  MessageSquare,
  Users,
  Send,
  X,
  Play,
  Share2,
  Copy,
  Check,
  AlertCircle,
  Radio,
} from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isTeacher?: boolean;
}

export default function LiveClass() {
  const navigate = useNavigate();
  const [isTeacher, setIsTeacher] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Demo деректер
  const [viewers, setViewers] = useState(12);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", user: "Мұғалім", text: "Сәлеметсіздер ме! Бүгін ОЗП-ға дайындық. Тақырып: Генетика.", time: "10:01", isTeacher: true },
    { id: "2", user: "Айгерім", text: "Сәлеметсіз бе! Генетика қиын емес пе?", time: "10:02" },
    { id: "3", user: "Мұғалім", text: "Қорықпаңыз! Бірге үйренеміз. ДНҚ репликациясы...", time: "10:03", isTeacher: true },
  ]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, navigate]);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: "Сіз",
      text: message.trim(),
      time: new Date().toLocaleTimeString("kk-KZ", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage("");
  };

  const roomUrl = `${window.location.origin}/#/live/demo-room`;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${streamActive ? "bg-red-500 animate-pulse" : "bg-[#475569]"}`} />
              <h2 className="font-semibold">Тірі сабақ: ОЗП Генетика</h2>
              <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-lg border border-red-500/20 flex items-center gap-1">
                <Radio className="w-3 h-3" /> LIVE
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Users className="w-4 h-4" />
                {viewers} көрермен
              </div>
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="lg:hidden p-2 rounded-lg bg-white/[0.06] text-white/60"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video/Screen Placeholder */}
          <div className="flex-1 relative bg-[#0f172a] flex items-center justify-center">
            {streamActive ? (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <MonitorUp className="w-16 h-16 text-[#10b981] mx-auto mb-4" />
                  <p className="text-white/60">Экран бөлісуде...</p>
                  <p className="text-white/30 text-sm">(Бұл demo нұсқа — нақты WebRTC backend қосқанда жұмыс істейді)</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <VideoOff className="w-16 h-16 text-[#475569] mx-auto mb-4" />
                <p className="text-white/40">Эфир басталмаған</p>
                <button
                  onClick={() => setStreamActive(true)}
                  className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold flex items-center gap-2 mx-auto"
                >
                  <Play className="w-4 h-4" />
                  Demo эфирді бастау
                </button>
              </div>
            )}

            {/* Teacher Controls Overlay */}
            {isTeacher && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/10">
                <button className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition">
                  <Mic className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-xl bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/30 transition">
                  <MonitorUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/tests")}
                  className="px-4 py-2.5 rounded-xl bg-[#3b82f6] text-white text-sm font-semibold flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Тест бастау
                </button>
              </div>
            )}
          </div>

          {/* Share Link */}
          <div className="px-4 py-3 bg-white/5 border-t border-white/10">
            <div className="flex items-center gap-3 max-w-lg">
              <input
                readOnly
                value={roomUrl}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/50 outline-none"
              />
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-white/[0.06] text-[#94a3b8] hover:text-white transition"
              >
                {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "Тірі сабақ", url: roomUrl });
                  } else {
                    handleCopy();
                  }
                }}
                className="p-2 rounded-xl bg-[#10b981]/10 text-[#6ee7b7] hover:bg-[#10b981]/15 transition"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {chatOpen && (
          <div className="w-80 bg-white/5 border-l border-white/10 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#10b981]" />
                Чат ({messages.length})
              </h3>
              <button
                onClick={() => setChatOpen(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`${msg.isTeacher ? "bg-[#10b981]/10 border border-[#10b981]/20" : "bg-white/[0.03]"} rounded-xl p-3`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${msg.isTeacher ? "text-[#10b981]" : "text-white/60"}`}>
                      {msg.user}
                    </span>
                    <span className="text-[10px] text-white/30">{msg.time}</span>
                  </div>
                  <p className="text-sm text-white/80">{msg.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Сұрақ жазыңыз..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#10b981]"
                />
                <button
                  onClick={handleSend}
                  className="p-2 rounded-xl bg-[#10b981] text-white hover:bg-[#059669] transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Teacher Toggle (Demo) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsTeacher(!isTeacher)}
          className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm text-white/60 hover:text-white transition"
        >
          {isTeacher ? "👨‍🏫 Мұғалім режимі" : "👨‍🎓 Оқушы режимі"}
        </button>
      </div>
    </div>
  );
}
