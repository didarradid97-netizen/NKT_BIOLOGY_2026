import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { isAuthenticated } from "@/lib/auth";
import { saveCustomTest, CustomTest } from "@/lib/customTestStorage";
import { useTilt } from "@/hooks/use3DEffects";
import {
  Users,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Share2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function GroupTest() {
  const navigate = useNavigate();
  const { ref, style } = useTilt(10);
  const [promoCode, setPromoCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"create" | "join">("create");

  if (!isAuthenticated()) {
    navigate("/login");
    return null;
  }

  const generatePromoCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPromoCode(result);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!promoCode) return;
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = () => {
    if (!joinCode.trim() || joinCode.length < 4) {
      alert("Промокод кемінде 4 таңба болуы керек");
      return;
    }
    // Backend-ке сұраныс жіберу (кейінірек)
    alert(`Промокод ${joinCode} қабылданды! Байланыс жасалуда...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Артқа
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#10b981]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#10b981]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Топтық тест тапсыру</h1>
          <p className="text-white/60">
            Промокод арқылы сынып немесе мектеппен бірге тест тапсырыңыз
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6 w-fit mx-auto">
          <button
            onClick={() => setMode("create")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "create"
                ? "bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/25"
                : "text-[#64748b]"
            }`}
          >
            Топ құру
          </button>
          <button
            onClick={() => setMode("join")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "join"
                ? "bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/25"
                : "text-[#64748b]"
            }`}
          >
            Топқа қосылу
          </button>
        </div>

        {mode === "create" ? (
          <div
            ref={ref}
            style={style}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-[#10b981]" />
              <h2 className="font-semibold">Промокод жасау</h2>
            </div>

            <p className="text-sm text-white/50">
              Бұл промокодты сыныптастарыңызға немесе достарыңызға жіберіңіз. Олар осы код арқылы сіздің құрған тестіңізге қосыла алады.
            </p>

            {promoCode ? (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                <div className="text-xs text-white/40 mb-2">Сіздің промокодыңыз:</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#0f172a]/80 border border-white/[0.12] rounded-xl px-4 py-3 text-center">
                    <span className="text-xl font-mono font-bold text-[#10b981] tracking-widest">
                      {promoCode}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-3 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#94a3b8] hover:text-white hover:bg-white/[0.10] transition-all active:scale-95"
                    title="Көшіріп алу"
                  >
                    {copied ? <Check className="w-5 h-5 text-[#10b981]" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  onClick={() => {
                    const shareText = `NKT BIOLOGY тестіне қосыл! Промокод: ${promoCode}`;
                    if (navigator.share) {
                      navigator.share({ title: "Топтық тест", text: shareText });
                    } else {
                      navigator.clipboard.writeText(shareText);
                      alert("Промокод көшірілді! WhatsApp/Telegram-ға жіберіңіз.");
                    }
                  }}
                  className="mt-3 w-full py-2.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#6ee7b7] text-sm font-medium hover:bg-[#10b981]/15 transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Бөлісу
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-white/40 text-sm mb-4">
                  Промокод жасау үшін төмендегі батырманы басыңыз
                </p>
              </div>
            )}

            <button
              onClick={generatePromoCode}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
              {promoCode ? "Жаңа промокод" : "Промокод жасау"}
            </button>

            <div className="flex items-start gap-2 text-xs text-white/30 bg-white/[0.03] rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-white/50">Ескерту:</span> Промокод тек 24 сағатқа жарамды. Backend қосылғанда нақты уақыт шектеуі қойылады.
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={ref}
            style={style}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-[#3b82f6]" />
              <h2 className="font-semibold">Топқа қосылу</h2>
            </div>

            <p className="text-sm text-white/50">
              Мұғаліміңіз немесе досыңыз берген промокодты енгізіңіз.
            </p>

            <div>
              <label className="block text-xs text-white/40 mb-2">Промокод</label>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Мысалы: ABC12345"
                maxLength={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#10b981] focus:bg-white/[0.07] transition text-center tracking-widest font-mono uppercase"
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={!joinCode.trim() || joinCode.length < 4}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white font-semibold shadow-lg shadow-[#3b82f6]/20 hover:shadow-[#3b82f6]/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            >
              <ShieldCheck className="w-5 h-5" />
              Қосылу
            </button>

            <div className="text-center text-xs text-white/30">
              Промокод алу үшін топ басшысына хабарласыңыз
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
