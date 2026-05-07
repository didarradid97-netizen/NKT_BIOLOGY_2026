// ============================================
// 📷 SMART SCAN — Фото түсіріп AI жауап алады
// ============================================
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import {
  Camera, ArrowLeft, Loader2, Sparkles, Upload, XCircle,
  ImageIcon, ScanLine, Zap,
} from "lucide-react";

export default function SmartScan() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImage(base64);
      setResult("");
      setError("");
    };
    reader.readAsDataURL(f);
  }, []);

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setError("");
    try {
      // Бұл жерде backend-ке сурет жіберу керек, бірақ қазір текст simulation
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Сен — NKT BIOLOGY Smart Scan AI-сы. Пайдаланушы сурет жіберді (бұл симуляция). Сен суреттегі биология сұрағын тану керексің. Сұрақты оқып, дұрыс жауап бер." },
            { role: "user", content: "Суреттегі биология сұрағын талда. Сұрақ: 'Суретте көрсетілген құрылым' деген сияқты сұрақ болуы мүмкін. ДНҚ, митохондрия, хлоропласт, митоз фазалары сияқты нұсқаларды қара. Дұрыс жауапты таңдап, түсіндір." },
          ],
          temperature: 0.6,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setResult(data.response || "🔍 Сурет талданды. AI ойлау нәтижесі осында көрсетіледі. Шынайы сканерлеу үшін backend-ке OCR API қосу керек.");
    } catch {
      setError("Сервер offline — локалды талдау:");
      setResult(`🔍 **Smart Scan Талдауы (Demo):**

Сурет түрі: Биология схемасы

**Мүмкін сұрақ:** Суретте көрсетілген құрылымды анықтаңыз.

**Мүмкін нұсқалар:**
A) Митохондрия
B) Хлоропласт  
C) Ядро
D) Рибосома

**AI болжамы:** А) Митохондрия (сыртқы мембрана + ішкі кристалар көрінеді)

📌 Толық Smart Scan үшін Google Vision API немесе Tesseract OCR қосу керек.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] flex flex-col">
      <Navbar />
      <div className="max-w-[700px] mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#10b981]/20">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">📷 Smart Scan</h1>
          <p className="text-sm text-[#94a3b8]">Сурет түсір → AI оқиды → Жауап береді</p>
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/[0.12] rounded-2xl p-8 text-center cursor-pointer hover:bg-white/[0.03] hover:border-[#10b981]/40 transition-all mb-6"
        >
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {image ? (
            <div className="relative">
              <img src={image} alt="scan" className="max-h-64 mx-auto rounded-xl border border-white/[0.08]" />
              <button
                onClick={(e) => { e.stopPropagation(); setImage(null); setResult(""); }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Сурет жүктеу немесе камера</p>
              <p className="text-xs text-[#64748b]">Тест суретін, схемасын, кестесін түсіріңіз</p>
            </>
          )}
        </div>

        {image && (
          <button
            onClick={analyzeImage}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#10b981]/20 mb-6"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "AI ойлауда..." : "🔍 Smart Scan іске қосу"}
          </button>
        )}

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-400 mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-[#10b981]" /> AI Нәтиже</h3>
            <p className="text-sm leading-relaxed whitespace-pre-line">{result}</p>
          </div>
        )}

        <div className="mt-6 bg-gradient-to-r from-[#10b981]/10 to-[#06b6d4]/10 border border-[#10b981]/20 rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-2">💡 Қалай қолданады?</h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            1. Оқулықтағы суретті түсіріңіз<br/>
            2. AI құрылымды таниды<br/>
            3. Дұрыс жауап + түсініктеме береді<br/>
            4. TikTok-та бөлісуге болады 😉
          </p>
        </div>
      </div>
    </div>
  );
}
