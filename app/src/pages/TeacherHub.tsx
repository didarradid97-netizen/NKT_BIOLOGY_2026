// ============================================
// 👨‍🏫 TEACHER HUB — Marketplace + Telegram Bot
// ============================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import {
  Briefcase, ArrowLeft, Star, Download, BookOpen, MessageCircle,
  ExternalLink, Plus, Trash2, Eye, Lock, Zap,
} from "lucide-react";

interface TeacherCourse {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  rating: number;
  downloads: number;
  category: string;
}

const MOCK_COURSES: TeacherCourse[] = [
  { id: "c1", title: "ОЗП Генетика — 100 сұрақ", author: "Айгуль М.", description: "Генетика тақырыбы бойынша 100 тест сұрағы. Мендель заңдары, ДНҚ репликациясы, мутациялар.", price: 0, rating: 4.8, downloads: 1240, category: "Генетика" },
  { id: "c2", title: "Митоз-Мейоз карточкалары", author: "Серик К.", description: "Визуалды карточкалар. Митоз vs Мейоз айырмашылығы, фазалар, суреттер.", price: 500, rating: 4.9, downloads: 890, category: "Жасуша" },
  { id: "c3", title: "Фотосинтез видео курсы", author: "Динара А.", description: "15 минуттық видео сабақтар. Жарық және қараңғы фазалар, хлоропласт құрылымы.", price: 1000, rating: 4.7, downloads: 650, category: "Өсімдік" },
  { id: "c4", title: "Экология формулалары", author: "Нұрлан Б.", description: "10% заңы, экожүйе түрлері, популяция өсімі формулалары. Шпаргалка.", price: 0, rating: 4.6, downloads: 2100, category: "Экология" },
  { id: "c5", title: "Адам анатомиясы схемалары", author: "Мадина О.", description: "Жүрек, ми, бүйрек, өкпе схемалары. Атаулар мен функциялары.", price: 800, rating: 4.9, downloads: 1500, category: "Адам" },
];

export default function TeacherHub() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [myCourses, setMyCourses] = useState<TeacherCourse[]>([]);
  const [tab, setTab] = useState<"market" | "my" | "telegram">("market");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setCourses(MOCK_COURSES);
    const saved = localStorage.getItem("bio_my_courses");
    if (saved) setMyCourses(JSON.parse(saved));
  }, []);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(filter.toLowerCase()) ||
    c.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] flex flex-col">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#10b981] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#f59e0b]/20">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">👨‍🏫 Teacher Hub</h1>
          <p className="text-sm text-[#94a3b8]">Мұғалімдер базары + Telegram бот</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["market", "my", "telegram"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t ? "bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/20" : "bg-white/[0.04] text-[#94a3b8] border border-white/[0.08] hover:bg-white/[0.06]"}`}>
              {t === "market" ? "📚 Базар" : t === "my" ? "📝 Менің курстарым" : "📲 Telegram"}
            </button>
          ))}
        </div>

        {/* MARKET */}
        {tab === "market" && (
          <>
            <div className="mb-4">
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Курс немесе тақырып бойынша іздеу..."
                className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#f59e0b]/50"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((c) => (
                <div key={c.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.06] transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 rounded-lg bg-[#f59e0b]/10 text-[#fbbf24] text-[10px] font-bold">{c.category}</span>
                    <div className="flex items-center gap-1 text-[10px] text-[#64748b]">
                      <Star className="w-3 h-3 text-[#fbbf24]" />{c.rating}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold mb-1">{c.title}</h3>
                  <p className="text-[10px] text-[#64748b] mb-2">{c.author}</p>
                  <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">{c.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${c.price === 0 ? "text-[#10b981]" : "text-[#fbbf24]"}`}>
                      {c.price === 0 ? "Тегін" : `${c.price} ₸`}
                    </span>
                    <button className="px-3 py-1.5 rounded-lg bg-[#10b981]/15 text-[#10b981] text-xs font-bold flex items-center gap-1 hover:bg-[#10b981]/25 transition-all">
                      <Download className="w-3 h-3" /> {c.downloads}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* MY COURSES */}
        {tab === "my" && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Сіздің курстарыңыз</h3>
            <p className="text-sm text-[#94a3b8] mb-4">Өз тестіңізді немесе курсыңызды жүктеңіз</p>
            <button onClick={() => navigate("/test-creator")} className="px-5 py-2.5 rounded-xl bg-[#10b981] text-white font-medium flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" /> Курс құру
            </button>
          </div>
        )}

        {/* TELEGRAM */}
        {tab === "telegram" && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">📲 NKT BIOLOGY Bot</h3>
                <p className="text-xs text-[#94a3b8]">Telegram ішінде тест тапсыру</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Zap className="w-4 h-4 text-[#f59e0b]" /> Күндік 1 сұрақ
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="w-4 h-4 text-[#10b981]" /> 10 сұрақты mini test
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Star className="w-4 h-4 text-[#fbbf24]" /> Streak сақтау
              </div>
            </div>
            <div className="bg-[#0f172a]/80 border border-white/[0.08] rounded-xl p-4 mb-4">
              <p className="text-xs text-[#94a3b8] mb-2">Bot сілтемесі (кейін қосылады):</p>
              <code className="text-xs text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded">@nktbiology_bot</code>
            </div>
            <button disabled className="w-full py-3 rounded-xl bg-[#3b82f6]/15 text-[#60a5fa] text-xs font-bold flex items-center justify-center gap-2 border border-[#3b82f6]/20 cursor-not-allowed">
              <ExternalLink className="w-4 h-4" /> Жақында ашылады
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
