import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
                  id="access-code"
                  name="access-code"
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Кодты енгізіңіз"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition text-center tracking-widest font-mono"
                  autoFocus
                  autoComplete="off"
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
          <a 
            href="https://t.me/Bio_OZP" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#229ED9]/10 border border-[#229ED9]/20 rounded-xl text-[#229ED9] text-sm font-medium hover:bg-[#229ED9]/20 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Код алу: Telegram @Bio_OZP
          </a>
          <p className="text-white/20 text-xs mt-3">
            Код 7 күн бойы сақталады
          </p>
        </div>
      </div>
    </div>
  );
}
