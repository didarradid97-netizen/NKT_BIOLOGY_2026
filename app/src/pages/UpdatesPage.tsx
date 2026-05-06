// ============================================
// 📢 ЖАҢАРТУЛАР / ЖАҢАЛЫҚТАР — ПОСТ БЕТІ
// ============================================
import { useNavigate } from "react-router";
import { use3DCard } from "@/hooks/use3DEffects";
import Navbar from "@/components/Navbar";
import {
  Sparkles,
  Bot,
  PenLine,
  Search,
  Trophy,
  Users,
  Share2,
  BarChart3,
  Zap,
  Video,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Globe,
  Shield,
  Clock,
  BookOpen,
  FolderOpen,
  FlaskConical,
  Star,
} from "lucide-react";

const updates = [
  {
    icon: Bot,
    color: "from-[#10b981] to-[#059669]",
    title: "🤖 AI Жаттықтырушы",
    desc: "Серверсіз жұмыс істейтін AI көмекші! 200+ биология тақырыбы бойынша қазақша сұраққа дереу жауап береді. Backend/API қажет емес — толық браузерде.",
    badges: ["Серверсіз", "Қазақша", "200+ тақырып"],
  },
  {
    icon: PenLine,
    color: "from-[#3b82f6] to-[#6366f1]",
    title: "📝 Өз тестіңді құру",
    desc: "Жеке тесттер құрып, сақтау, өңдеу және тапсыру. Сурет қосу, уақыт шектеуі, түсініктеме жазу — бәрі бар.",
    badges: ["Сурет қосу", "Уақыт", "Түсініктеме"],
  },
  {
    icon: Sparkles,
    color: "from-[#a855f7] to-[#7c3aed]",
    title: "🤖📄 AI Тест Генераторы",
    desc: "Биология мәтінін жүктесеңіз, автоматты түрде тест сұрақтары жасайды. Тақырыптық шаблондар + мәтінді талдау.",
    badges: ["TXT", "Автоматты", "Тақырыптық"],
  },
  {
    icon: Search,
    color: "from-[#0ea5e9] to-[#0284c7]",
    title: "🔍 Іздеу жүйесі",
    desc: "Барлық тесттер мен сұрақтар арасынан бірден іздеу. 'Митоз', 'ДНҚ', 'фотосинтез' деп жазсаңыз — барлық сәйкес сұрақтар шығады.",
    badges: ["Барлық тесттер", "Тақырып бойынша", "Жылдам"],
  },
  {
    icon: Trophy,
    color: "from-[#f59e0b] to-[#d97706]",
    title: "🎮 Геймификация",
    desc: "XP, деңгей (Level), серия (Streak), жетістіктер (Achievements). Тест тапсырасыз — XP жинайсыз, жаңа деңгей ашасыз, ачивкалар жинайсыз!",
    badges: ["XP", "Деңгей", "Ачивкалар"],
  },
  {
    icon: BarChart3,
    color: "from-[#ec4899] to-[#db2777]",
    title: "📊 Прогресс талдауы",
    desc: "Тақырып бойынша нәтижелерді қараңыз. Қай тақырыпта мықты, қай жерде әлі жаттығу керек — графикпен көрсетеді.",
    badges: ["Тақырыптық", "График", "Жеке талдау"],
  },
  {
    icon: Users,
    color: "from-[#06b6d4] to-[#0891b2]",
    title: "👥 Топтық тест",
    desc: "Оқушыларды промокод арқылы топқа жинап, бір тестті бір уақытта тапсыру. Нәтижелерді рейтингте көру.",
    badges: ["Промокод", "Рейтинг", "Бір уақытта"],
  },
  {
    icon: Share2,
    color: "from-[#8b5cf6] to-[#7c3aed]",
    title: "📤 Тест бөлісу",
    desc: "Жасаған тестіңізді достарыңызбен бөліңіз. Сілтеме + қатынас коды арқылы қорғау. Кім тапсырғанын көру.",
    badges: ["Сілтеме", "Код", "Қорғау"],
  },
  {
    icon: Video,
    color: "from-[#ef4444] to-[#dc2626]",
    title: "🎓 Тірі сабақ (Demo)",
    desc: "Zoom-сияқты виртуалды класс. Экран бөлісу, чат, мұғалім/оқушы режимі. ОЗП дайындығына тікелей эфир сабақтар өткізуге болады.",
    badges: ["Экран бөлісу", "Чат", "LIVE"],
  },
  {
    icon: Shield,
    color: "from-[#14b8a6] to-[#0d9488]",
    title: "🔐 Жаңа авторизация",
    desc: "Cookie + localStorage жүйесі. Құрылғы ауыстырсаңыз да cookie арқылы кіре аласыз. 7 күн автоматты кіру.",
    badges: ["Cookie", "7 күн", "Қауіпсіз"],
  },
  {
    icon: Zap,
    color: "from-[#22c55e] to-[#16a34a]",
    title: "⚡ Серверсіз архитектура",
    desc: "Барлығы браузерде жұмыс істейді! Backend/Vercel Functions қажет емес. Тесттер, AI чат, нәтижелер — бәрі localStorage-да.",
    badges: ["Backend жоқ", "Тегін", "Жылдам"],
  },
  {
    icon: Globe,
    color: "from-[#f97316] to-[#ea580c]",
    title: "🌐 3D эффектілер",
    desc: "Карточкаларға үйірілу эффектісі, анимациялар, интерактивті дизайн. Сайт заманауи және әдемі көрінеді.",
    badges: ["3D Tilt", "Анимация", "Интерактив"],
  },
];

const highlights = [
  { icon: FlaskConical, label: "200+ AI тақырыбы", desc: "Жасуша, генетика, эволюция, экология..." },
  { icon: Star, label: "12 жаңа жүйе", desc: "Тест, AI, іздеу, топ, бөлісу..." },
  { icon: Clock, label: "0 секунд күту", desc: "Серверсіз — дереу жауап" },
  { icon: BookOpen, label: "5 ОЗП тақырыбы", desc: "Толық дайындық қамтылады" },
];

export default function UpdatesPage() {
  const navigate = useNavigate();
  const { cardRef, transform } = use3DCard();

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/5 via-transparent to-transparent" />
        <div className="max-w-[1100px] mx-auto px-4 py-16 sm:py-24 relative">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#6ee7b7] text-sm font-medium">
              <Rocket className="w-4 h-4" />
              NKT BIOLOGY 2026 — Жаңарту
            </div>
            <h1
              ref={cardRef}
              style={{ transform }}
              className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#34d399] via-[#3b82f6] to-[#a855f7] bg-clip-text text-transparent"
            >
              🚀 Сайтқа 12 жаңа жүйе қосылды!
            </h1>
            <p className="text-[#94a3b8] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Биология бойынша ОЗП/ҰБТ дайындығын жаңа деңгейге шығаратын үлкен жаңарту.
              <span className="text-[#e2e8f0] font-semibold"> AI, геймификация, тірі сабақ, топтық тест</span> — бәрі
              <span className="text-[#10b981]"> серверсіз</span> және
              <span className="text-[#10b981]"> тегін</span>!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => navigate("/ai-trainer")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold text-sm shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 flex items-center gap-2 transition-all active:scale-95"
              >
                <Bot className="w-4 h-4" />
                AI-мен сөйлесу
              </button>
              <button
                onClick={() => navigate("/test-creator")}
                className="px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#e2e8f0] font-semibold text-sm hover:bg-white/[0.10] flex items-center gap-2 transition-all"
              >
                <PenLine className="w-4 h-4" />
                Тест құру
              </button>
              <button
                onClick={() => navigate("/achievements")}
                className="px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#e2e8f0] font-semibold text-sm hover:bg-white/[0.10] flex items-center gap-2 transition-all"
              >
                <Trophy className="w-4 h-4" />
                Жетістіктер
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-[1100px] mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 text-center hover:bg-white/[0.06] transition-all"
            >
              <h.icon className="w-8 h-8 text-[#10b981] mx-auto mb-3" />
              <div className="text-lg font-bold text-white">{h.label}</div>
              <div className="text-xs text-[#64748b] mt-1">{h.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Updates Grid */}
      <div className="max-w-[1100px] mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-10">
          <span className="bg-gradient-to-r from-[#34d399] to-[#3b82f6] bg-clip-text text-transparent">
            📦 Жаңа функциялар тізімі
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {updates.map((u, i) => (
            <div
              key={i}
              className="group bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.06] hover:border-white/[0.14] transition-all cursor-default"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${u.color} flex items-center justify-center mb-4 shadow-lg`}>
                <u.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-[#e2e8f0] mb-2">{u.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">{u.desc}</p>
              <div className="flex flex-wrap gap-2">
                {u.badges.map((b) => (
                  <span
                    key={b}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[11px] text-[#94a3b8] font-medium"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="max-w-[900px] mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-[#10b981]/10 via-[#0f172a] to-[#3b82f6]/10 border border-white/[0.08] rounded-3xl p-6 sm:p-10">
          <h2 className="text-xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-[#34d399] to-[#3b82f6] bg-clip-text text-transparent">
              ✅ Бұрын vs Енді
            </span>
          </h2>

          <div className="space-y-3">
            {[
              { old: "Тек 5-6 нұсқалы тесттер", new: "Өз тестіңді құру + AI генерация" },
              { old: "Кітаптан оқу ғана", new: "AI Жаттықтырушы — сұрақ қой, жауап ал" },
              { old: "Қателерді қағазға жазу", new: "Автоматты талдау + қайта тапсыру" },
              { old: "Достарыңмен тест бөлісе алмайсың", new: "Сілтеме + код арқылы бөлісу" },
              { old: "Мотивация жоқ", new: "XP, деңгей, ачивкалар, серия" },
              { old: "Тесттерді табу қиын", new: "Іздеу жүйесі — секунд ішінде табу" },
              { old: "Backend/API қажет", new: "Серверсіз — тек браузер" },
              { old: "Тек өзің тапсырасың", new: "Топтық тест — оқушылармен бәсекелес" },
            ].map((row, i) => (
              <div
                key={i}
                className="flex items-center gap-3 sm:gap-6 p-3 rounded-xl bg-white/[0.03]"
              >
                <div className="flex-1 text-sm text-[#94a3b8] line-through opacity-60">
                  {row.old}
                </div>
                <ArrowRight className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                <div className="flex-1 text-sm text-[#e2e8f0] font-medium">
                  {row.new}
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How to use */}
      <div className="max-w-[900px] mx-auto px-4 pb-20">
        <h2 className="text-xl font-bold text-center mb-8">
          🎯 Қалай бастау керек?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              step: "1",
              title: "Кіріңіз",
              desc: "Cookie арқылы 7 күн автоматты кіру. Немесе NKT2026 кодын енгізіңіз.",
              icon: Shield,
            },
            {
              step: "2",
              title: "Тапсырыңыз",
              desc: "Дайын тесттерді тапсырыңыз не өз тестіңізді құрыңыз. AI генератор көмектеседі.",
              icon: FlaskConical,
            },
            {
              step: "3",
              title: "Жетістікке жетіңіз",
              desc: "XP жинап, деңгей көтеріңіз, ачивкалар алыңыз. Прогрессіңізді бақылаңыз.",
              icon: Trophy,
            },
          ].map((s) => (
            <div
              key={s.step}
              className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#10b981]/15 text-[#10b981] font-bold flex items-center justify-center mx-auto mb-4 border border-[#10b981]/20">
                {s.step}
              </div>
              <s.icon className="w-6 h-6 text-[#10b981] mx-auto mb-3" />
              <h3 className="font-bold text-[#e2e8f0] mb-2">{s.title}</h3>
              <p className="text-sm text-[#94a3b8]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-[600px] mx-auto px-4 pb-24 text-center">
        <div className="bg-gradient-to-r from-[#10b981]/20 to-[#3b82f6]/20 border border-[#10b981]/20 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-3">
            Дайынсыз ба? 🚀
          </h2>
          <p className="text-[#94a3b8] mb-6">
            Барлығы тегін, серверсіз және қазақша. ОЗП-ға дайындық енді оңайырақ!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/tests")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold text-sm shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <FolderOpen className="w-4 h-4" />
              Тест тапсыру
            </button>
            <button
              onClick={() => navigate("/ai-trainer")}
              className="px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#e2e8f0] font-semibold text-sm hover:bg-white/[0.10] flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4" />
              AI көмекші
            </button>
          </div>
        </div>

        <p className="text-xs text-[#475569] mt-8">
          NKT BIOLOGY 2026 • Серверсіз • localStorage • Cookie Auth • 200+ AI тақырыбы
        </p>
      </div>
    </div>
  );
}
