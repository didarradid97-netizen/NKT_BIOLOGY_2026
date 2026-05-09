import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getCustomTestById } from "@/lib/customTestStorage";
import { isAuthenticated } from "@/lib/auth";
import { useTilt } from "@/hooks/use3DEffects";
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Play,
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  Lock,
  Unlock,
} from "lucide-react";

export default function ShareTest() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const test = testId ? getCustomTestById(testId) : undefined;
  const [copied, setCopied] = useState(false);
  const { ref, style } = useTilt(8);

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Тест табылмады</h2>
          <p className="text-white/50 mb-6">Бұл сілтеме қате немесе тест өшірілген</p>
          <Link
            to="/"
            className="px-6 py-3 bg-[#10b981] rounded-xl text-white font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Басты бетке
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/#/share/${test.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: test.title,
      text: `NKT BIOLOGY тесті: "${test.title}"\n${test.questions.length} сұрақ • ${test.timeLimit} мин\n\nТесті тапсырып көру:`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Артқа
        </button>

        <div
          ref={ref}
          style={style}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-[#10b981]" />
                <span className="text-xs text-[#64748b] uppercase tracking-wider">Бөлісу сілтемесі</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{test.title}</h1>
              {test.description && (
                <p className="text-white/50 mt-2 text-sm">{test.description}</p>
              )}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
              authenticated
                ? "bg-[#10b981]/10 text-[#6ee7b7] border-[#10b981]/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>
              {authenticated ? (
                <span className="flex items-center gap-1"><Unlock className="w-3 h-3" /> Доступ ашық</span>
              ) : (
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Код керек</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <FileText className="w-5 h-5 text-[#3b82f6] mx-auto mb-1" />
              <div className="text-lg font-bold">{test.questions.length}</div>
              <div className="text-[10px] text-white/40">Сұрақ</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-[#f59e0b] mx-auto mb-1" />
              <div className="text-lg font-bold">{test.timeLimit}</div>
              <div className="text-[10px] text-white/40">Минут</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <Calendar className="w-5 h-5 text-[#a855f7] mx-auto mb-1" />
              <div className="text-lg font-bold">
                {new Date(test.createdAt).toLocaleDateString("kk-KZ", { day: "numeric", month: "short" })}
              </div>
              <div className="text-[10px] text-white/40">Құрылды</div>
            </div>
          </div>

          {/* Share Link */}
          <div className="bg-[#0f172a]/80 border border-white/[0.12] rounded-xl p-4 mb-6">
            <div className="text-xs text-white/40 mb-2">Бөлісу сілтемесі:</div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 outline-none"
              />
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.12] text-[#94a3b8] hover:text-white transition active:scale-95"
                title="Көшіріп алу"
              >
                {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 text-[#6ee7b7] hover:bg-[#10b981]/15 transition active:scale-95"
                title="Бөлісу"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action */}
          <div className="flex flex-col gap-3">
            {authenticated ? (
              <button
                onClick={() => navigate(`/custom-test/${test.id}`)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-5 h-5" />
                Тестті тапсыру
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-200/80">
                    Бұл тестті тапсыру үшін сайтқа кіру керек. Кодты енгізіп, тестті бастаңыз.
                  </div>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Lock className="w-5 h-5" />
                  Кіру / Тіркелу
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Questions Preview */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3b82f6]" />
            Сұрақтар preview ({test.questions.length})
          </h3>
          <div className="space-y-3">
            {test.questions.slice(0, 5).map((q, i) => (
              <div key={q.id} className="bg-white/[0.03] rounded-xl p-3">
                <p className="text-sm text-white/70 mb-2">
                  {i + 1}. {q.text.substring(0, 80)}{q.text.length > 80 ? "..." : ""}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {q.options.map((opt, j) => (
                    <span
                      key={j}
                      className={`text-xs px-2 py-1 rounded-lg ${
                        j === q.correctAnswer
                          ? "bg-[#10b981]/10 text-[#6ee7b7] border border-[#10b981]/20"
                          : "bg-white/[0.04] text-white/40 border border-white/[0.06]"
                      }`}
                    >
                      {String.fromCharCode(65 + j)}. {opt.substring(0, 15)}{opt.length > 15 ? "..." : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {test.questions.length > 5 && (
              <p className="text-center text-xs text-white/30">
                +{test.questions.length - 5} сұрақ бар (толығын тапсырғанда көресіз)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
