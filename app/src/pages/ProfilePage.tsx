import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { isAuthenticated, clearAuth, getResults, getProfile, updateProfile } from "@/lib/storage";
import { User, BookOpen, Award, Clock, TrendingUp, Calendar, LogOut, ChevronRight, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const [results, setResults] = useState<ReturnType<typeof getResults>>([]);
  const [profile, setProfile] = useState(getProfile());
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setResults(getResults());
  }, [navigate]);

  const handleClear = () => {
    if (confirm("Барлық нәтижелерді өшіруге сенімдісіз бе?")) {
      localStorage.removeItem("bio_test_results");
      setResults([]);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
  const bestScore = results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0;

  const displayed = showAll ? results : results.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">NKT BIOLOGY</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#/" className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm">Басты</a>
            <a href="#/tests" className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm">Тесттер</a>
            <a href="#/resources" className="px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm">Материалдар</a>
            <a href="#/profile" className="px-3 py-2 rounded-lg bg-white/10 text-emerald-400 text-sm">Профиль</a>
          </nav>
          <button onClick={handleLogout} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm">
            <LogOut className="w-4 h-4 inline mr-1" /> Шығу
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile.name}</h1>
              <p className="text-white/50 text-sm">{profile.email || "Электрондық пошта көрсетілмеген"}</p>
              <p className="text-white/30 text-xs mt-1">Қосылған: {new Date(profile.joinedAt).toLocaleDateString("kk-KZ")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
              <div className="text-xl font-bold text-emerald-400">{results.length}</div>
              <div className="text-xs text-white/50">Тапсырған тест</div>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-3 text-center border border-blue-500/20">
              <div className="text-xl font-bold text-blue-400">{avgScore}%</div>
              <div className="text-xs text-white/50">Орташа ұпай</div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-3 text-center border border-purple-500/20">
              <div className="text-xl font-bold text-purple-400">{bestScore}%</div>
              <div className="text-xs text-white/50">Ең жақсы</div>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
              <div className="text-xl font-bold text-amber-400">{profile.streakDays}</div>
              <div className="text-xs text-white/50">Күн streak</div>
            </div>
          </div>
        </div>

        {/* Results History */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" /> Нәтиже тарихы
            </h2>
            {results.length > 0 && (
              <button onClick={handleClear} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> Тазалау
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Әлі ешқандай тест тапсырмадыңыз</p>
              <button onClick={() => navigate("/tests")} className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm">
                Тесттерге өту
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayed.map((r, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                    r.score >= 70 ? 'bg-emerald-500/20 text-emerald-400' : r.score >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {r.score}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{r.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                      <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {r.correctAnswers}/{r.totalQuestions}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.floor(r.timeSpent / 60)}:{(r.timeSpent % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="text-xs text-white/30">
                    {new Date(r.completedAt).toLocaleDateString("kk-KZ")}
                  </div>
                </div>
              ))}

              {results.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full py-2 text-emerald-400 text-sm hover:text-emerald-300 transition"
                >
                  {showAll ? "Жасыру" : `Барлық ${results.length} нәтижені көрсету`} <ChevronRight className="w-4 h-4 inline" />
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
