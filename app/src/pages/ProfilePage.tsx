import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { isAuthenticated, getResults, clearAuth } from "@/lib/storage";
import { User, Trophy, Clock, ArrowLeft, LogOut, BarChart3 } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const results = getResults();

  if (!isAuthenticated()) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Артқа
        </button>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Профиль</h1>
              <p className="text-white/50">Нәтижелер тарихы</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{results.length}</div>
              <div className="text-sm text-white/50">Тапсырылған тест</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {results.length > 0
                  ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length)
                  : 0}%
              </div>
              <div className="text-sm text-white/50">Орташа нәтиже</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0}%
              </div>
              <div className="text-sm text-white/50">Ең жақсы нәтиже</div>
            </div>
          </div>

          <button
            onClick={() => {
              clearAuth();
              navigate("/login");
            }}
            className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-semibold hover:bg-red-500/30 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Шығу
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Нәтиже тарихы
            </h2>
            <div className="space-y-3">
              {results.map((result, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{result.title || `Тест ${result.testId}`}</div>
                    <div className="text-sm text-white/50 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {result.score}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.floor(result.timeSpent / 60)} мин
                      </span>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    result.score >= 70 ? "text-emerald-400" : "text-amber-400"
                  }`}>
                    {result.correctAnswers}/{result.totalQuestions}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
