import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { isAuthenticated } from "@/lib/storage";
import { FileText, Clock, ArrowRight, Loader2, Search } from "lucide-react";

interface TestItem {
  id: string;
  title: string;
  description: string;
  questions: number;
  time: number;
}

export default function TestsPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [filtered, setFiltered] = useState<TestItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/tests/all-tests.json")
      .then((r) => {
        if (!r.ok) throw new Error("all-tests.json табылмады");
        return r.json();
      })
      .then((data) => {
        const list: TestItem[] = Object.keys(data).map((key) => ({
          id: key,
          title: data[key].title || key,
          description: data[key].description || "",
          questions: data[key].questions || 0,
          time: data[key].time || 45,
        }));
        setTests(list);
        setFiltered(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Тесттерді жүктеу қатесі:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(tests);
      return;
    }
    setFiltered(
      tests.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      )
    );
  }, [search, tests]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Тесттер</h1>
          <p className="text-white/60">Биология бойынша барлық пробный тесттер</p>
        </div>

        {/* 🔍 ІЗДЕУ ЖОЛЫ */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Тест атауы бойынша іздеу... (мысалы: митоз, ДНҚ, фотосинтез)"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition"
            />
          </div>
          <p className="text-xs text-white/30 mt-2 text-center">
            {filtered.length} / {tests.length} тест табылды
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="ml-3 text-white/60">Жүктелуде...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            Іздеу бойынша ештеңе табылмады. Басқа сөз қолданып көріңіз.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((test) => (
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
                    Пробный
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{test.title}</h3>
                <p className="text-sm text-white/40 mb-3 line-clamp-2">{test.description}</p>
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
        )}
      </div>
    </div>
  );
}

