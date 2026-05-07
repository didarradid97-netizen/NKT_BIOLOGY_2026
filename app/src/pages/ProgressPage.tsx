import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import { getResults } from "@/lib/storage";
import { isAuthenticated } from "@/lib/auth";
import { getCustomTests } from "@/lib/customTestStorage";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  Award,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Zap,
  Users,
} from "lucide-react";

interface TopicAnalysis {
  topic: string;
  total: number;
  correct: number;
  percentage: number;
}

interface PeriodProgress {
  period: string;
  score: number;
  testsCount: number;
}

export default function ProgressPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"personal" | "compare" | "trends" | "predict">("personal");
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  if (!isAuthenticated()) {
    navigate("/login");
    return null;
  }

  const results = getResults();
  const customTests = getCustomTests();

  // Жалпы статистика
  const totalTests = results.length;
  const avgScore = totalTests > 0
    ? Math.round(results.reduce((a, b) => a + b.score, 0) / totalTests)
    : 0;
  const bestScore = totalTests > 0 ? Math.max(...results.map((r) => r.score)) : 0;

  // Тақырыптық талдау (demo деректер)
  const topicAnalysis: TopicAnalysis[] = [
    { topic: "Жасуша биологиясы", total: 45, correct: 38, percentage: 84 },
    { topic: "Генетика", total: 32, correct: 28, percentage: 88 },
    { topic: "Эволюция", total: 28, correct: 22, percentage: 79 },
    { topic: "Экология", total: 35, correct: 30, percentage: 86 },
    { topic: "Анатомия", total: 40, correct: 33, percentage: 83 },
    { topic: "Физиология", total: 38, correct: 29, percentage: 76 },
  ];

  // Уақыт бойынша прогресс
  const periodProgress: PeriodProgress[] = [
    { period: "1 апта", score: 65, testsCount: 3 },
    { period: "2 апта", score: 72, testsCount: 5 },
    { period: "3 апта", score: 78, testsCount: 4 },
    { period: "4 апта", score: 85, testsCount: 6 },
    { period: "5 апта", score: 82, testsCount: 4 },
    { period: "6 апта", score: 91, testsCount: 7 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-blue-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "bg-blue-500/10 border-blue-500/20";
    if (score >= 50) return "bg-amber-500/10 border-amber-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Профильге оралу
          </button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-[#10b981]" />
            Прогресс талдау
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Award, label: "Орташа ұпай", value: `${avgScore}%`, color: "text-[#10b981]" },
            { icon: Target, label: "Ең жақсы", value: `${bestScore}%`, color: "text-[#3b82f6]" },
            { icon: BookOpen, label: "Тапсырған тест", value: `${totalTests}`, color: "text-[#a855f7]" },
            { icon: Calendar, label: "Жасалған тест", value: `${customTests.length}`, color: "text-[#f59e0b]" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: "personal", label: "Жеке прогресс", icon: TrendingUp },
            { id: "compare", label: "Салыстыру", icon: Users },
            { id: "trends", label: "Тенденциялар", icon: BrainCircuit },
            { id: "predict", label: "Predict Score", icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/25"
                  : "bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] hover:bg-white/[0.08]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "personal" && (
          <div className="space-y-6">
            {/* Topic Analysis */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#10b981]" />
                Тақырыптық талдау
              </h2>
              <div className="space-y-3">
                {topicAnalysis.map((topic) => (
                  <div key={topic.topic}>
                    <button
                      onClick={() => setExpandedTopic(expandedTopic === topic.topic ? null : topic.topic)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${getScoreBg(topic.percentage)}`}>
                          <span className={getScoreColor(topic.percentage)}>{topic.percentage}%</span>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">{topic.topic}</div>
                          <div className="text-xs text-white/40">{topic.correct}/{topic.total} дұрыс</div>
                        </div>
                      </div>
                      {expandedTopic === topic.topic ? (
                        <ChevronUp className="w-4 h-4 text-white/30" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/30" />
                      )}
                    </button>
                    {expandedTopic === topic.topic && (
                      <div className="px-3 pb-3 mt-1">
                        <div className="bg-white/[0.03] rounded-xl p-3 text-sm text-white/60">
                          <div className="flex justify-between mb-1">
                            <span>Дұрыс жауаптар:</span>
                            <span className="text-[#10b981]">{topic.correct}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Қате жауаптар:</span>
                            <span className="text-red-400">{topic.total - topic.correct}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Деңгей:</span>
                            <span className={getScoreColor(topic.percentage)}>
                              {topic.percentage >= 90 ? "Өте жақсы" : topic.percentage >= 70 ? "Жақсы" : "Қайта қарау керек"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#f59e0b]" />
                Апталық прогресс
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {periodProgress.map((p) => (
                  <div key={p.period} className="text-center">
                    <div className="text-xs text-white/40 mb-1">{p.period}</div>
                    <div className={`text-lg font-bold ${getScoreColor(p.score)}`}>{p.score}%</div>
                    <div className="text-[10px] text-white/30">{p.testsCount} тест</div>
                    <div className="mt-2 h-16 bg-white/5 rounded-lg overflow-hidden relative">
                      <div
                        className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all ${
                          p.score >= 90
                            ? "bg-[#10b981]"
                            : p.score >= 70
                            ? "bg-[#3b82f6]"
                            : p.score >= 50
                            ? "bg-[#f59e0b]"
                            : "bg-red-500"
                        }`}
                        style={{ height: `${p.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "compare" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center py-12">
            <Users className="w-12 h-12 text-[#475569] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Салыстырмалы талдау</h3>
            <p className="text-white/40 max-w-md mx-auto mb-4">
              Сынып, аудан немесе республика бойынша салыстыру backend деректер базасы қосылғанда қосылады.
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="px-3 py-2 bg-white/[0.05] rounded-lg text-white/50">
                <div className="font-bold text-white">Сіз</div>
                <div>{avgScore}%</div>
              </div>
              <div className="px-3 py-2 bg-white/[0.05] rounded-lg text-white/50">
                <div className="font-bold text-white">Сынып</div>
                <div>---</div>
              </div>
              <div className="px-3 py-2 bg-white/[0.05] rounded-lg text-white/50">
                <div className="font-bold text-white">Мектеп</div>
                <div>---</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "trends" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center py-12">
            <BrainCircuit className="w-12 h-12 text-[#475569] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Тенденциялар</h3>
            <p className="text-white/40 max-w-md mx-auto">
              Терең талдау және тенденцияларды анықтау үшін деректер жинау жалғасуда. Тесттерді тапсыруды жалғастырыңыз!
            </p>
          </div>
        )}

        {activeTab === "predict" && (
          <div className="space-y-6">
            {/* Predict My Score */}
            <div className="bg-gradient-to-r from-[#a855f7]/10 to-[#3b82f6]/10 border border-[#a855f7]/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#a855f7]" />
                🎯 Predict My Score
              </h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-white/60">AI болжамы:</p>
                  <p className="text-3xl font-bold text-[#a855f7]">{Math.min(100, avgScore + 5)} балл</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-[#a855f7]/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#d8b4fe]">{avgScore}%</span>
                </div>
              </div>
              <p className="text-xs text-white/50">
                💡 Болжам негізі: {totalTests} тест, орташа {avgScore}%. 
                {avgScore >= 80 ? " НКТ-ны жақсы тапсырасың!" : avgScore >= 60 ? " Жақсы, бірақ тағы үйрену керек." : " Көбірек үйрену керек."}
              </p>
            </div>

            {/* AI Progress Graph */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#10b981]" />
                📈 AI Progress Graph
              </h2>
              <div className="space-y-4">
                {periodProgress.map((p, i) => {
                  const prev = i > 0 ? periodProgress[i - 1].score : p.score;
                  const trend = p.score - prev;
                  return (
                    <div key={p.period} className="flex items-center gap-4">
                      <span className="text-xs text-white/40 w-12">{p.period}</span>
                      <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-lg transition-all ${p.score >= 80 ? "bg-[#10b981]" : p.score >= 60 ? "bg-[#3b82f6]" : "bg-[#f59e0b]"}`}
                          style={{ width: `${p.score}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1 w-20">
                        <span className={`text-sm font-bold ${getScoreColor(p.score)}`}>{p.score}%</span>
                        {trend > 0 && <TrendingUp className="w-3 h-3 text-[#10b981]" />}
                        {trend < 0 && <TrendingDown className="w-3 h-3 text-red-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                <span>📅 Күнделікті прогресс</span>
                <span>🧠 AI талдайды</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
