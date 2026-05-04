import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Microscope, Lock, ArrowRight, ShieldCheck } from "lucide-react";

const ACCESS_CODE = "NKT2026"; // 🔐 Сіздің кіріс кодыңыз
const COOKIE_NAME = "nkt_access";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict`;
}

export function isAuthenticated(): boolean {
  return getCookie(COOKIE_NAME) === ACCESS_CODE || localStorage.getItem("nkt_auth") === "true";
}

export function clearAuth() {
  document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  localStorage.removeItem("nkt_auth");
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Егер уже кірген болса — басты бетке жіберу
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Кодты жазыңыз");
      return;
    }

    if (code.trim() === ACCESS_CODE) {
      // ✅ Дұрыс код — 7 күн сақтау
      setCookie(COOKIE_NAME, ACCESS_CODE, 7);
      localStorage.setItem("nkt_auth", "true");
      setShowSuccess(true);
      setTimeout(() => navigate("/"), 1000);
    } else {
      // ❌ Қате код
      setError("Қате код! Кодты тексеріп, қайта жазыңыз.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Бренд */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <Microscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">NKT BIOLOGY</h1>
          <p className="text-white/50 text-sm mt-1">2026 ОЗП дайындық</p>
        </div>

        {/* Кіру карточкасы */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Кіру коды</h2>
              <p className="text-xs text-white/40">Сайтқа өту үшін кодты енгізіңіз</p>
            </div>
          </div>

          {showSuccess ? (
            <div className="text-center py-6">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-400 font-medium">Код дұрыс!</p>
              <p className="text-white/40 text-sm">Басты бетке өтудеміз...</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-2">Кодты енгізіңіз</label>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Мысалы: NKT2026"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition text-center tracking-widest font-mono"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Кіру
              </button>
            </form>
          )}
        </div>

        {/* Көмек */}
        <div className="text-center mt-6">
          <p className="text-white/30 text-xs">
            Код алу үшін: Telegram @Bio_OZP
          </p>
          <p className="text-white/20 text-xs mt-1">
            Код 7 күн бойы сақталады
          </p>
        </div>
      </div>
    </div>
  );
}

