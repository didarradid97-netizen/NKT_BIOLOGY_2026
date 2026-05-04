import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { isAuthenticated } from "@/lib/storage";
import { FileText, Clock, ArrowRight } from "lucide-react";

const tests = [
  { id: "probny_1", title: "Пробный тест 1", questions: 38, time: 45, category: "Негізгі" },
  { id: "probny_2", title: "Пробный тест 2", questions: 40, time: 45, category: "Негізгі" },
  { id: "probny_3", title: "Пробный тест 3", questions: 45, time: 50, category: "Тереңдетілген" },
  { id: "probny_4", title: "Пробный тест 4", questions: 50, time: 50, category: "Тереңдетілген" },
  { id: "probny_5", title: "Пробный тест 5", questions: 60, time: 60, category: "Толық" },
  { id: "probny_6", title: "Пробный тест 6", questions: 65, time: 60, category: "Толық" },
  { id: "probny_7", title: "Пробный тест 7", questions: 70, time: 70, category: "Толық" },
  { id: "probny_8", title: "Пробный тест 8", questions: 75, time: 70, category: "Толық" },
  { id: "probny_9", title: "Пробный тест 9", questions: 80, time: 80, category: "Толық" },
  { id: "probny_10", title: "Пробный тест 10", questions: 85, time: 80, category: "Толық" },
];

export default function TestsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Тесттер</h1>
          <p className="text-white/60">Биология бойынша 49 пробный тест</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => (
            <button
              key={test.id}
              onClick={() => {
                if (!isAuthenticated()) {
                  navigate("/login");
                  return;
                }
                navigate(`/test/${test.id}`);
              }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/50">
                  {test.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{test.title}</h3>
              <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {test.questions} сұрақ
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {test.time} мин
                </span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                Тапсыру
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

