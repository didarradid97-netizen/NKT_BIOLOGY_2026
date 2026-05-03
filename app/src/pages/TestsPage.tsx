import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { isAuthenticated, clearAuth } from "@/lib/storage";
import { BookOpen, User, Clock, Award, Zap, Search, FileText, Menu, X } from "lucide-react";

interface TestInfo {
  id: string;
  title: string;
  description: string;
  questions: number;
  time: number;
  category: string;
}

const TESTS: TestInfo[] = [
  { id: "probny1", title: "Пробный 1", description: "Негізгі биология концепциялары", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny2", title: "Пробный 2", description: "Табиғи сұрыпталу, физиология", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny3", title: "Пробный 3", description: "Анатомия, эволюция", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny4", title: "Пробный 4", description: "Биохимия, физиология", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny5", title: "Пробный 5", description: "Экология, генетика", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny6", title: "Пробный 6", description: "Клетка биологиясы", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny7", title: "Пробный 7", description: "Жүйке жүйесі, сезім мүшелері", questions: 43, time: 45, category: "Негізгі" },
  { id: "probny8", title: "Пробный 8", description: "Толық биология курсы", questions: 140, time: 120, category: "Толық" },
  { id: "probny9", title: "Пробный 9", description: "Ас қорыту, тыныс алу", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny10", title: "Пробный 10", description: "Қан айналым, зат алмасу", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny11", title: "Пробный 11", description: "Эндокриндік жүйе", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny12", title: "Пробный 12", description: "Тұқымқуалаушылық", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny13", title: "Пробный 13", description: "Эволюциялық теория", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny14", title: "Пробный 14", description: "Экожүйелер", questions: 51, time: 45, category: "Негізгі" },
  { id: "probny15", title: "Пробный 15", description: "Биоәртүрлілік", questions: 13, time: 45, category: "Негізгі" },
  { id: "probny16", title: "Пробный 16", description: "Генетика тереңдетілген", questions: 60, time: 60, category: "Тереңдетілген" },
  { id: "probny17", title: "Пробный 17", description: "Молекулалық биология", questions: 50, time: 45, category: "Тереңдетілген" },
  { id: "probny18", title: "Пробный 18", description: "Биотехнология", questions: 54, time: 45, category: "Тереңдетілген" },
  { id: "probny19", title: "Пробный 19", description: "Микробиология", questions: 43, time: 45, category: "Тереңдетілген" },
  { id: "probny32", title: "Пробный 32", description: "2025 репетиция толық", questions: 141, time: 120, category: "Толық" },
  { id: "probny33", title: "Пробный 33", description: "Физиология тереңдетілген", questions: 43, time: 45, category: "Тереңдетілген" },
  { id: "probny34", title: "Пробный 34", description: "Цитология, анатомия", questions: 75, time: 60, category: "Тереңдетілген" },
  { id: "probny35", title: "Пробный 35", description: "Генетика практикум", questions: 60, time: 60, category: "Тереңдетілген" },
  { id: "probny36", title: "Пробный 36", description: "Экология практикум", questions: 76, time: 60, category: "Тереңдетілген" },
  { id: "probny37", title: "Пробный 37", description: "Эволюция тереңдетілген", questions: 76, time: 60, category: "Тереңдетілген" },
  { id: "probny38", title: "Пробный 38", description: "Биохимия тереңдетілген", questions: 76, time: 60, category: "Тереңдетілген" },
  { id: "probny39", title: "Пробный 39", description: "Анатомия тереңдетілген", questions: 114, time: 90, category: "Тереңдетілген" },
  { id: "probny40", title: "Пробный 40", description: "Физиология кешенді", questions: 63, time: 60, category: "Тереңдетілген" },
  { id: "probny41", title: "Пробный 41", description: "Биология кешенді", questions: 40, time: 45, category: "Негізгі" },
  { id: "probny56", title: "Пробный 56", description: "Клетка құрылымы", questions: 68, time: 60, category: "Тереңдетілген" },
  { id: "probny57", title: "Пробный 57", description: "Генетика негіздері", questions: 14, time: 20, category: "Негізгі" },
  { id: "probny58", title: "Пробный 58", description: "Тұқымқуалау", questions: 40, time: 45, category: "Негізгі" },
  { id: "probny59", title: "Пробный 59", description: "Экожүйе тереңдетілген", questions: 71, time: 60, category: "Тереңдетілген" },
  { id: "probny60", title: "Пробный 60", description: "Адам анатомиясы", questions: 37, time: 45, category: "Негізгі" },
  { id: "probny61", title: "Пробный 61", description: "Өсімдіктер физиологиясы", questions: 36, time: 45, category: "Негізгі" },
  { id: "probny62", title: "Пробный 62", description: "Жануарлар физиологиясы", questions: 165, time: 120, category: "Толық" },
  { id: "probny63", title: "Пробный 63", description: "Микроорганизмдер", questions: 82, time: 60, category: "Тереңдетілген" },
  { id: "probny64", title: "Пробный 64", description: "Биотехнология негіздері", questions: 50, time: 45, category: "Негізгі" },
  { id: "probny65", title: "Пробный 65", description: "Гендік инженерия", questions: 100, time: 90, category: "Тереңдетілген" },
  { id: "probny66", title: "Пробный 66", description: "Экология кешенді", questions: 79, time: 60, category: "Тереңдетілген" },
  { id: "probny67", title: "Пробный 67", description: "Эволюция кешенді", questions: 79, time: 60, category: "Тереңдетілген" },
  { id: "probny68", title: "Пробный 68", description: "Цитология кешенді", questions: 53, time: 45, category: "Негізгі" },
  { id: "probny69", title: "Пробный 69", description: "Анатомия қысқа", questions: 18, time: 20, category: "Негізгі" },
  { id: "probny70", title: "Пробный 70", description: "Биология қысқа", questions: 37, time: 45, category: "Негізгі" },
  { id: "probny71", title: "Пробный 71", description: "Жасушалық биология, Ұлпалар, Молекулалық биология, Жүйелеу", questions: 38, time: 90, category: "Жаңа" },
  { id: "probny72", title: "Пробный 72", description: "Экология, Заттар тасымалы, Қоректену", questions: 38, time: 90, category: "Жаңа" },
  { id: "probny73", title: "Пробный 73", description: "Тыныс алу, Бөліп шығару, Координация", questions: 38, time: 90, category: "Жаңа" },
  { id: "probny74", title: "Пробный 74", description: "Тұқымқуалау, Микробиология, Эволюция", questions: 38, time: 90, category: "Жаңа" },
  { id: "probny75", title: "Пробный 75", description: "Жасушалық цикл, Қозғалыс, Мәнмәтіндік тапсырмалар", questions: 38, time: 90, category: "Жаңа" },
];

const CATEGORIES = ["Барлығы", "Негізгі", "Тереңдетілген", "Толық", "Жаңа"];

export default function TestsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Барлығы");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) navigate("/login");
  }, [navigate]);

  const filtered = TESTS.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "Барлығы" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

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
            <a href="#/tests" className="px-3 py-2 rounded-lg bg-white/10 text-emerald-400 text-sm">Тесттер</a>
            <a href="#/resources" className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm">Материалдар</a>
            <a href="#/profile" className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm">Профиль</a>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className="hidden md:block px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm">
              Шығу
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-2">
            <a href="#/" className="block px-3 py-2 rounded-lg hover:bg-white/10">Басты</a>
            <a href="#/tests" className="block px-3 py-2 rounded-lg bg-white/10 text-emerald-400">Тесттер</a>
            <a href="#/resources" className="block px-3 py-2 rounded-lg hover:bg-white/10">Материалдар</a>
            <a href="#/profile" className="block px-3 py-2 rounded-lg hover:bg-white/10">Профиль</a>
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg bg-red-500/20 text-red-300">Шығу</button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Тесттерді іздеу..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat
                  ? "bg-emerald-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-emerald-400">{TESTS.length}</div>
            <div className="text-sm text-white/50">Барлық тест</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-blue-400">{TESTS.reduce((s, t) => s + t.questions, 0)}+</div>
            <div className="text-sm text-white/50">Сұрақтар</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-purple-400">{TESTS.filter(t => t.time >= 90).length}</div>
            <div className="text-sm text-white/50">Толық нұсқа</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-amber-400">5</div>
            <div className="text-sm text-white/50">Жаңа нұсқа</div>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((test) => (
            <div
              key={test.id}
              onClick={() => navigate(`/test/${test.id}`)}
              className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-emerald-400/50 hover:bg-white/10 transition cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium mb-2 ${
                    test.category === "Жаңа" ? "bg-amber-500/20 text-amber-300" :
                    test.category === "Толық" ? "bg-purple-500/20 text-purple-300" :
                    test.category === "Тереңдетілген" ? "bg-blue-500/20 text-blue-300" :
                    "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {test.category}
                  </span>
                  <h3 className="font-bold text-lg group-hover:text-emerald-400 transition">{test.title}</h3>
                </div>
                <Award className="w-6 h-6 text-white/20 group-hover:text-emerald-400 transition" />
              </div>
              <p className="text-white/50 text-sm mb-4 line-clamp-2">{test.description}</p>
              <div className="flex items-center gap-4 text-sm text-white/40">
                <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {test.questions} сұрақ</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {test.time} мин</span>
              </div>
              <button className="w-full mt-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition text-sm font-medium">
                Тестті бастау
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/40">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Ештеңе табылмады</p>
            <p className="text-sm">Басқа сөздермен іздеп көріңіз</p>
          </div>
        )}
      </main>
    </div>
  );
}
