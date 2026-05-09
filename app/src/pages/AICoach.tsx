import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudentProfile,
  getWeakTopics,
  getStrongTopics,
  getDailyPlan,
  generateDailyPlan,
  completeTask,
  getCoachContext,
} from "@/lib/memorySystem";
import {
  getMistakeStats,
  getReviewQueue,
  getMistakeLabel,
} from "@/lib/mistakeBrain";
import { ai } from "@/lib/aiRouter";
import {
  Brain, Target, TrendingUp, Flame, Clock, AlertTriangle,
  CheckCircle, Zap, BookOpen, Trophy, ChevronRight,
  Lightbulb, RotateCcw, Play,
} from "lucide-react";

export default function AICoach() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getStudentProfile());
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [strongTopics, setStrongTopics] = useState<string[]>([]);
  const [plan, setPlan] = useState(getDailyPlan());
  const [mistakeStats, setMistakeStats] = useState(getMistakeStats());
  const [reviewQueue, setReviewQueue] = useState(getReviewQueue(5));
  const [aiAdvice, setAiAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetScore, setTargetScore] = useState(85);

  useEffect(() => {
    setWeakTopics(getWeakTopics());
    setStrongTopics(getStrongTopics());
    setMistakeStats(getMistakeStats());
    setReviewQueue(getReviewQueue(5));
  }, []);

  const generatePlan = () => {
    const newPlan = generateDailyPlan(targetScore);
    setPlan(newPlan);
  };

  const getAIAdvice = async () => {
    setLoading(true);
    const context = getCoachContext();
    const res = await ai.deep(
      `${context}\n\nОқушыға кеңес бер: қазір не істеу керек? Әлсіз тақырыптар: ${weakTopics.join(", ")}. Мақсат: ${targetScore} балл.`
    );
    setAiAdvice(res);
    setLoading(false);
  };

  const planTasks = plan?.tasks || [];
  const completedCount = plan?.completed?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10" />
        <div className="max-w-7xl mx-auto px-4 py-12 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#a855f7]/20">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-[#a855f7] to-[#3b82f6] bg-clip-text text-transparent">
              🤖 AI NKT Coach
            </h1>
            <p className="text-lg text-white/60">
              Жеке оқытушы — сіздің деңгейіңізге сай
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Target}
            label="Орташа балл"
            value={`${profile.averageScore}%`}
            color="from-[#a855f7] to-[#3b82f6]"
          />
          <StatCard
            icon={BookOpen}
            label="Тест саны"
            value={`${profile.totalTests}`}
            color="from-[#10b981] to-[#06b6d4]"
          />
          <StatCard
            icon={Clock}
            label="Оқу уақыты"
            value={`${Math.floor(profile.studyTimeMinutes / 60)}с`}
            color="from-[#f59e0b] to-[#ef4444]"
          />
          <StatCard
            icon={Flame}
            label="Streak"
            value={`${profile.streak} 🔥`}
            color="from-[#ef4444] to-[#f59e0b]"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Topics */}
          <div className="space-y-6">
            {/* Weak Topics */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Әлсіз тақырыптар
              </h3>
              {weakTopics.length > 0 ? (
                <div className="space-y-2">
                  {weakTopics.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/tests?topic=${t}`)}
                      className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
                    >
                      <span className="text-sm">{t}</span>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/50">
                  Әлі дерек жоқ — тест тапсырыңыз
                </p>
              )}
            </div>

            {/* Strong Topics */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Мықты тақырыптар
              </h3>
              {strongTopics.length > 0 ? (
                <div className="space-y-2">
                  {strongTopics.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-xl"
                    >
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm">{t}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/50">
                  Әлі дерек жоқ — тест тапсырыңыз
                </p>
              )}
            </div>
          </div>

          {/* Center: Daily Plan */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#f59e0b]" />
                Күнделікті жоспар
              </h3>
              <span className="text-xs text-white/50">
                {completedCount}/{planTasks.length}
              </span>
            </div>

            {/* Target Score */}
            <div className="mb-4 p-3 bg-white/5 rounded-xl">
              <label className="text-xs text-white/50 mb-1 block">
                Мақсат балл
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={generatePlan}
                  className="px-4 py-2 bg-[#f59e0b] text-black rounded-lg text-sm font-bold hover:bg-[#fbbf24] transition"
                >
                  Жоспарла
                </button>
              </div>
            </div>

            {/* Tasks */}
            {planTasks.length > 0 ? (
              <div className="space-y-2">
                {planTasks.map((task) => {
                  const done = plan?.completed?.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition ${
                        done
                          ? "bg-emerald-500/10 opacity-50"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <button
                        onClick={() => {
                          completeTask(task.id);
                          setPlan(getDailyPlan());
                        }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          done
                            ? "bg-emerald-500 text-white"
                            : "border-2 border-white/30"
                        }`}
                      >
                        {done && <CheckCircle className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            done ? "line-through text-white/40" : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full">
                            {task.difficulty}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full">
                            ~{task.estimatedMinutes}мин
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/50 mb-3">
                  Бүгінгі жоспар жасалмаған
                </p>
                <button
                  onClick={generatePlan}
                  className="px-4 py-2 bg-[#f59e0b] text-black rounded-lg text-sm font-bold"
                >
                  Жоспар жасау
                </button>
              </div>
            )}
          </div>

          {/* Right: Mistake Brain + AI */}
          <div className="space-y-6">
            {/* Mistake Stats */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Қате талдау
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold">{mistakeStats.total}</p>
                  <p className="text-[10px] text-white/50">Барлық қате</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#f59e0b]">
                    {mistakeStats.needsReview}
                  </p>
                  <p className="text-[10px] text-white/50">Қайталау керек</p>
                </div>
              </div>
              {mistakeStats.total > 0 && (
                <button
                  onClick={() => navigate("/mistake-brain")}
                  className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition"
                >
                  Толық талдау
                </button>
              )}
            </div>

            {/* Review Queue */}
            {reviewQueue.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#f59e0b]" />
                  Қайталау керек ({reviewQueue.length})
                </h3>
                <div className="space-y-2">
                  {reviewQueue.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition"
                      onClick={() => navigate(`/mistake-brain?id=${m.id}`)}
                    >
                      <p className="text-xs text-white/70 line-clamp-2">
                        {m.question}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/40">
                          {getMistakeLabel(m.mistakeType)}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {m.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Advice */}
            <div className="bg-gradient-to-br from-[#a855f7]/10 to-[#3b82f6]/10 border border-[#a855f7]/20 rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#a855f7]" />
                AI Кеңес
              </h3>
              {aiAdvice ? (
                <div className="text-sm text-white/80 whitespace-pre-line mb-3">
                  {aiAdvice}
                </div>
              ) : (
                <p className="text-sm text-white/50 mb-3">
                  AI сізге жеке кеңес береді
                </p>
              )}
              <button
                onClick={getAIAdvice}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-[#a855f7] to-[#3b82f6] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ойлауда...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    Кеңес алу
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  );
}
