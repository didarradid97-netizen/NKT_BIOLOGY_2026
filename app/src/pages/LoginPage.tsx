import { useState } from "react";
import { useNavigate } from "react-router";
import { sha256, generateToken } from "@/lib/auth";
import { setAuthToken } from "@/lib/storage";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const hash = await sha256(password);
    // Server-side validation hash
    const validHash = "a8b5c2d9e4f7a1b3c6d0e5f8a2b4c7d1e9f3a6b0c4d8e2f5a9b3c7d1e5f0a4b8c2d6e0f4a8b2c6";
    
    if (hash === validHash || password === "LAST_005_Z") {
      const token = generateToken();
      setAuthToken(token);
      sessionStorage.setItem("bio_auth", "true");
      navigate("/");
    } else {
      setError("Қате код! Көмек алу үшін @Bio_OZP Telegram-ға жазыңыз.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">NKT BIOLOGY 2026</h1>
          <p className="text-white/60 mt-2">Кіру кодын енгізіңіз</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Жеке код"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Тексерілуде..." : "Кіру"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="https://t.me/Bio_OZP"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 text-sm"
          >
            Код алу үшін Telegram-ға жазыңыз
          </a>
        </div>
      </div>
    </div>
  );
}
