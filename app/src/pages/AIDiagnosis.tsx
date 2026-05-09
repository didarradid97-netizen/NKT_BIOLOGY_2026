// ============================================
// 🧠 AI ДИАГНОЗ — 20 сұрақ шешкеннен кейін талдау
// ============================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getTestResults, getCustomTestById } from "@/lib/customTestStorage";
import { getMemoryAI, getStrengthAnalysis, recordWrongAnswer } from "@/lib/memoryStorage";
import { getMentorSettings, getMotivationMessage } from "@/lib/mentorStorage";
import {
  Brain, ArrowLeft, Loader2, Sparkles, AlertTriangle, CheckCircle,
  TrendingUp, TrendingDown, Lightbulb, RotateCcw, Zap,
} from "lucide-react";

interface DiagnosisResult {
  overallScore: number;
  weakTopics: string[];
  strongTopics: string[];
  attentionScore: number; // 0-100
  theoryScore: number;
  stressScore: number;
  diagnosisText: string;
  recommendations: string[];
}

export default function AIDiagnosis() {
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [mentorType, setMentorType] = useState(getMentorSettings().type);

  useEffect(() => {
    const r = getTestResults().slice(0, 20);
    setResults(r);
    setLoading(false);

    // Талдау
    const { weak, strong } = getStrengthAnalysis();
    const totalQ = r.reduce((sum, t) => sum + t.total, 0);
    const correct = r.reduce((sum, t) => sum + t.score, 0);
    const overall = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;

    // 'Суретте' сөзін саны — назар аудару
    const visualQ = r.filter((t: any) => {
      const test = getCustomTestById(t.testId);
      return test?.questions?.some((q: any) => q.text?.toLowerCase().includes("суретте"));
    }).length;
    const attention = Math.max(20, 100 - (visualQ * 5));

    // Термин қателер
    const memory = getMemoryAI();
    const termErrors = memory.filter((m) => m.topic.match(/термин|генетик|днк|рнк/i)).length;
    const theory = Math.max(20, 100 - (termErrors * 8));

    // Стресс (ақырғы тесттерде қалайлық)
    const recent = r.slice(0, 5);
    const recentPct = recent.length > 0 ? recent.reduce((s, t) => s + (t.score / t.total), 0) / recent.length * 100 : 50;
    const stress = recentPct < overall ? Math.max(20, 100 - (overall - recentPct) * 2) : 85;

    // Диагноз мәтіні
    let diagnosisText = "";
    if (attention < 60 && theory < 60) diagnosisText = `🎯 Сенің проблемаң — назар аудару ғана емес, теория да әлсіз. "Суретте" сұрақтарын шатастырасың. Генетика терминдерін шатастырасың. Екеуін де үйрену керек.`;
    else if (attention < 60) diagnosisText = `👀 Сенің проблемаң — назар аудару! Сен теорияны білесің, бірақ "суретте" сұрақтарын шатастырасың. Суретпен жұмыс істеу керек.`;
    else if (theory < 60) diagnosisText = `📚 Сенің проблемаң — теория! Терминдерді, анықтамаларды шатастырасың. Флешкарта жаса, терминдерді қайтала.`;
    else if (stress < 60) diagnosisText = `😰 Сенің проблемаң — стресс! Ақырғы тесттерде көрсеткіштің төмендеуі байқалады. Спокойно тапсыру керек.`;
    else diagnosisText = `💪 Жалпы жағдайың жақсы! Бірақ ${weak.slice(0, 2).join(", ") || "кейбір тақырыптарда"} әлі қиындық бар.`;

    const recommendations = [
      weak.includes("генетика") || weak.some((w) => w.includes("ген")) ? "🧬 Генетика тақырыбынан кем дегенде 3 тест тапсыр" : "📖 Әлсіз тақырыптарды қайтала",
      attention < 70 ? "🖼️ Суретті сұрақтарға назар аудару керек (Smart Scan қолдан)" : "",
      theory < 70 ? "📝 Терминдерді флешкартаға жазып, күнде 10 минут оқы" : "",
      stress < 70 ? "🧘 Stress Mode-та жаттығу жаса — уақыт қысымына үйрен" : "",
      "🎯 Daily Missions арқылы күнде 10 сұрақ шеш",
    ].filter(Boolean);

    setDiagnosis({
      overallScore: overall,
      weakTopics: weak,
      strongTopics: strong,
      attentionScore: attention,
      theoryScore: theory,
      stressScore: stress,
      diagnosisText,
      recommendations,
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#10b981]" /></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="w-12 h-12 text-[#f59e0b]" />
          <h1 className="text-xl font-bold">Әлі тест тапсырмағансыз</h1>
          <p className="text-sm text-[#94a3b8] mb-4">Кем дегенде 1 тест тапсырыңыз, содан кейін AI диагноз жасайды</p>
          <button onClick={() => navigate("/tests")} className="px-5 py-2.5 rounded-xl bg-[#10b981] text-white font-medium">Тесттерге өту</button>
        </div>
      </div>
    );
  }

  const d = diagnosis!;

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] flex flex-col">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-4 py-8 w-full">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#a855f7]/20">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">🧠 AI Диагноз</h1>
          <p className="text-sm text-[#94a3b8]">Сенің биология дайындығыңды талдаймын</p>
        </div>

        {/* Жалпы балл */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Жалпы нәтиже</h2>
            <span className={`text-2xl font-extrabold ${d.overallScore >= 70 ? "text-[#10b981]" : d.overallScore >= 50 ? "text-[#f59e0b]" : "text-red-400"}`}>{d.overallScore}%</span>
          </div>
          <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden mb-2">
            <div className={`h-full rounded-full transition-all ${d.overallScore >= 70 ? "bg-[#10b981]" : d.overallScore >= 50 ? "bg-[#f59e0b]" : "bg-red-400"}`} style={{ width: `${d.overallScore}%` }} />
          </div>
          <p className="text-xs text-[#64748b]">{results.length} тест негізінде талдау</p>
        </div>

        {/* Үш метрика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard icon={Zap} label="Назар аудару" value={d.attentionScore} color="#f59e0b" />
          <MetricCard icon={Lightbulb} label="Теория білімі" value={d.theoryScore} color="#3b82f6" />
          <MetricCard icon={TrendingUp} label="Стресс төзімділік" value={d.stressScore} color="#10b981" />
        </div>

        {/* Диагноз мәтіні */}
        <div className="bg-gradient-to-r from-[#a855f7]/10 to-[#3b82f6]/10 border border-[#a855f7]/20 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#a855f7]" /> AI Диагноз</h3>
          <p className="text-sm leading-relaxed whitespace-pre-line">{d.diagnosisText}</p>
        </div>

        {/* Кеңестер */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[#10b981]" /> Кеңестер</h3>
          <div className="space-y-3">
            {d.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.03] rounded-xl p-3">
                <span className="w-6 h-6 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Тақырыптар */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Әлсіз тақырыптар</h4>
            {d.weakTopics.length > 0 ? d.weakTopics.map((t, i) => (
              <div key={i} className="text-sm text-[#94a3b8] py-1">• {t}</div>
            )) : <p className="text-xs text-[#64748b]">Әлі дерек жоқ — тест тапсырыңыз</p>}
          </div>
          <div className="bg-[#10b981]/5 border border-[#10b981]/15 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-[#10b981] mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Мықты тақырыптар</h4>
            {d.strongTopics.length > 0 ? d.strongTopics.map((t, i) => (
              <div key={i} className="text-sm text-[#94a3b8] py-1">• {t}</div>
            )) : <p className="text-xs text-[#64748b]">Әлі дерек жоқ</p>}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate("/tests")} className="px-5 py-2.5 rounded-xl bg-[#10b981] text-white font-medium flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Тест тапсыру</button>
          <button onClick={() => navigate("/daily")} className="px-5 py-2.5 rounded-xl bg-white/[0.06] text-[#e2e8f0] font-medium flex items-center gap-2 hover:bg-white/[0.10]"><Zap className="w-4 h-4" /> Daily Hub</button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 text-center">
      <Icon className="w-6 h-6 mx-auto mb-2" style={{ color }} />
      <div className="text-2xl font-extrabold mb-1" style={{ color }}>{value}%</div>
      <p className="text-xs text-[#64748b]">{label}</p>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-3">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
