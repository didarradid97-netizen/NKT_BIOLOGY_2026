import { useNavigate } from "react-router";
import { BookOpen, FileText, Download, ExternalLink, Award, ChevronRight } from "lucide-react";

const RESOURCES = [
  { title: "КМЖ (Күнделікті мақсатты жоспар)", desc: "Биология пәні бойынша КМЖ үлгілері", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
  { title: "Эссе үлгілері", desc: "ҰБТ-ға арналған эссе жазу тәсілдері", icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
  { title: "БЖБ (Бақылау жұмысының бағдарламасы)", desc: "БЖБ дайындау нұсқаулығы", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { title: "Оқу жоспарлары", desc: "Мектептерге арналған оқу жоспарлары", icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10" },
  { title: "Тақырыптық карталар", desc: "Визуалды оқу материалдары", icon: FileText, color: "text-pink-400", bg: "bg-pink-500/10" },
  { title: "Тест қорлары", desc: "Қосымша тест сұрақтары жинағы", icon: FileText, color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

const PROJECTS = [
  { title: "Ғылыми жоба №1: ДНҚ моделі", desc: "ДНҚ құрылымын 3D басып шығару", price: "15 000 ₸" },
  { title: "Ғылыми жоба №2: Фотосинтез аппараты", desc: "Өсімдік жапырағының анатомиясы", price: "12 000 ₸" },
  { title: "Ғылыми жоба №3: Экожүйе макеті", desc: "Ауыл экожүйесін макеттеу", price: "20 000 ₸" },
];

export default function ResourcesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">NKT BIOLOGY</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#/" className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm">Басты</a>
            <a href="#/tests" className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm">Тесттер</a>
            <a href="#/resources" className="px-3 py-2 rounded-lg bg-white/10 text-emerald-400 text-sm">Материалдар</a>
            <a href="#/profile" className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm">Профиль</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Resources */}
        <h1 className="text-2xl font-bold mb-6">Әдістемелік материалдар</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {RESOURCES.map((res, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/20 transition group">
              <div className={`w-10 h-10 ${res.bg} rounded-lg flex items-center justify-center mb-3`}>
                <res.icon className={`w-5 h-5 ${res.color}`} />
              </div>
              <h3 className="font-bold mb-1">{res.title}</h3>
              <p className="text-sm text-white/50 mb-3">{res.desc}</p>
              <button className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <Download className="w-4 h-4" /> Жүктеу
              </button>
            </div>
          ))}
        </div>

        {/* Projects */}
        <h2 className="text-xl font-bold mb-4">Ғылыми жобалар</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {PROJECTS.map((proj, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h3 className="font-bold mb-1">{proj.title}</h3>
              <p className="text-sm text-white/50 mb-3">{proj.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">{proj.price}</span>
                <a 
                  href="https://kaspi.kz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition"
                >
                  Kaspi арқылы төлеу
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <div className="bg-amber-500/10 rounded-xl p-6 border border-amber-500/20">
          <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
            <Award className="w-5 h-5" /> Төлем туралы ақпарат
          </h3>
          <p className="text-sm text-white/60 mb-4">
            Жобаларды сатып алу үшін Kaspi QR немесе Kaspi Gold арқылы төлеуге болады. 
            Төлем жасаған соң чекті Telegram-ға жіберіңіз: @Bio_OZP
          </p>
          <div className="flex flex-wrap gap-3">
            <a 
              href="https://kaspi.kz/pay/QR" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition"
            >
              Kaspi QR ашу
            </a>
            <a 
              href="https://t.me/Bio_OZP" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" /> Telegram
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
