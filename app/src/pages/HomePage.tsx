import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { isAuthenticated } from "@/lib/storage";
import { BookOpen, Award, Clock, Users, Zap, ChevronRight, Star, Phone } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10" />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/70">2026 жылғы ОЗП-ға дайындық</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              NKT BIOLOGY
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-8">
              Биология пәні бойынша кешенді дайындық платформасы.
              49 пробный тест, 2887+ сұрақ, толық талдау.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => navigate("/tests")}
                className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Тест тапсыру
              </button>
              <button
                onClick={() => navigate("/resources")}
                className="px-8 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition"
              >
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
            {[
              { icon: BookOpen, label: "Пробный тест", value: "49" },
              { icon: Users, label: "Сұрақтар", value: "2887+" },
              { icon: Award, label: "ОЗП бағдарламасы", value: "100%" },
              { icon: Clock, label: "Қолжетімділік", value: "24/7" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-1">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Мүмкіндіктер</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "49 тест толық", desc: "Негізгі, тереңдетілген, толық нұсқалар. 38-165 сұрақтан тұрады." },
              { icon: Clock, title: "Таймер бар", desc: "Әр тесттің өз уақыты. ОЗП форматына үйренесіз." },
              { icon: Award, title: "Нәтиже талдау", desc: "Қателерді талдау, түсініктемелер, статистика." },
              { icon: Users, title: "Жеке профиль", desc: "Нәтиже тарихы, орташа ұпай, ең жақсы нәтиже." },
              { icon: Phone, title: "Телефонға ыңғайлы", desc: "Мобильді құрылғыға бейімделген. Саусақпен басу оңай." },
              { icon: Zap, title: "Kaspi төлемі", desc: "Ғылыми жобаларды Kaspi QR арқылы сатып алыңыз." },
            ].map((feature) => (
              <div key={feature.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
                <feature.icon className="w-10 h-10 text-emerald-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Дайындықты бастаңыз</h2>
          <p className="text-white/60 mb-8">Барлық тесттерді тегін тапсырыңыз!</p>
          <button
            onClick={() => navigate(isAuthenticated() ? "/tests" : "/login")}
            className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition inline-flex items-center gap-2"
          >
            Тесттерге өту
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-white/40 text-sm">
        NKT BIOLOGY 2026. Көмек: @Bio_OZP
      </footer>
    </div>
  );
}

