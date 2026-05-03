import { useNavigate } from "react-router";
import { BookOpen, Award, Clock, Users, Zap, ChevronRight, Star, Phone } from "lucide-react";

export default function HomePage() {
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
            <a href="#/" className="px-3 py-2 rounded-lg bg-white/10 text-emerald-400 text-sm">Басты</a>
            <a href="#/tests" className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm">Тесттер</a>
            <a href="#/resources" className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm">Материалдар</a>
            <a href="#/profile" className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm">Профиль</a>
          </nav>
          <button onClick={() => navigate("/tests")} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition">
            Тесттер
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10" />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/70">2026 жылғы ҰБТ-ға дайындық</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              NKT BIOLOGY
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-8">
              Биология пәні бойынша кешенді дайындық платформасы. 
              49 пробный тест, 2887+ сұрақ, толық талдау.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => navigate("/tests")} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition flex items-center gap-2">
                <Zap className="w-5 h-5" /> Тест тапсыру
              </button>
              <button onClick={() => navigate("/resources")} className="px-8 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition">
                Материалдар
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-400">49</div>
              <div className="text-sm text-white/50 mt-1">Пробный тест</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-400">2887+</div>
              <div className="text-sm text-white/50 mt-1">Сұрақтар</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400">100%</div>
              <div className="text-sm text-white/50 mt-1">ҰБТ бағдарламасы</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-400">24/7</div>
              <div className="text-sm text-white/50 mt-1">Қолжетімділік</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Мүмкіндіктер</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-emerald-400/30 transition">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Кешенді тесттер</h3>
              <p className="text-white/50 text-sm">49 пробный нұсқа, әрқайсысында 38-165 сұрақ. Барлық тақырыптарды қамтиды.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-blue-400/30 transition">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Уақытты бақылау</h3>
              <p className="text-white/50 text-sm">Әр тесттің өз уақыты бар. Таймер көмегімен нақты ҰБТ форматына үйренесіз.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-400/30 transition">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Нәтиже талдауы</h3>
              <p className="text-white/50 text-sm">Тест аяқталғаннан кейін қателерді талдау, түсініктемелер мен ұпайлар.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-amber-400/30 transition">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Жеке профиль</h3>
              <p className="text-white/50 text-sm">Нәтиже тарихы, орташа ұпай, ең жақсы нәтиже — барлығы сақталады.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-pink-400/30 transition">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Телефонға ыңғайлы</h3>
              <p className="text-white/50 text-sm">Мобильді құрылғыларға толық бейімделген. Қай жерде болсаңыз да тапсыра беріңіз.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-cyan-400/30 transition">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Kaspi төлемі</h3>
              <p className="text-white/50 text-sm">Қосымша материалдар мен ғылыми жобаларды Kaspi QR арқылы сатып алыңыз.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Дайындықты бастаңыз</h2>
          <p className="text-white/50 mb-8">Барлық тесттерді тегін тапсыруға болады. Профиль жасап, нәтижелеріңізді бақылаңыз.</p>
          <button onClick={() => navigate("/tests")} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition inline-flex items-center gap-2">
            Тесттерге өту <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/30 text-sm">
          <p>NKT BIOLOGY 2026. Барлық құқықтар қорғалған.</p>
          <p className="mt-1">Көмек: <a href="https://t.me/Bio_OZP" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">@Bio_OZP</a></p>
        </div>
      </footer>
    </div>
  );
}
