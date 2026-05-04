import { useState } from "react";
import { CustomTest, CustomQuestion } from "@/lib/customTestStorage";
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Target,
  RotateCcw,
  Home,
  Sparkles,
} from "lucide-react";

export function TestAnalysis({
  test,
  answers,
  timeSpent,
  onRetry,
  onHome,
}: {
  test: CustomTest;
  answers: Record<number, number>;
  timeSpent: number;
  onRetry: () => void;
  onHome: () => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const correct = test.questions.filter((q, i) => answers[i] === q.correctAnswer).length;
  const total = test.questions.length;
  const score = Math.round((correct / total) * 100);
  const wrong = total - correct;
  const skipped = test.questions.filter((_, i) => answers[i] === undefined).length;

  const getGrade = () => {
    if (score >= 90) return "Өте жақсы";
    if (score >= 70) return "Жақсы";
    if (score >= 50) return "Қанағаттанарлық";
    return "Қайта дайындалу керек";
  };

  const getGradeColor = () => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-blue-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  };

  const fetchAIAdvice = async () => {
    setLoadingAdvice(true);
    try {
      // Backend арқылы AI кеңес алу
      const wrongTopics = test.questions
        .filter((q, i) => answers[i] !== q.correctAnswer)
        .map((q) => q.text.slice(0, 40))
        .join("; ");

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Мен биология тестінен ${score}% алдым. Дұрыс: ${correct}, қате: ${wrong}. Қате сұрақтар тақырыптары: ${wrongTopics}. Осы тақырыптар бойынша қайта дайындалуға кеңес бер. 3 нақты кеңес жаз.`,
            },
          ],
          model: "llama-3.3-70b-versatile",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAdvice(
          data?.choices?.[0]?.message?.content || data?.response || "Кеңес алу мүмкін болмады."
        );
      } else {
        // Offline fallback
        setAiAdvice(getOfflineAdvice(score, wrong));
      }
    } catch {
      setAiAdvice(getOfflineAdvice(score, wrong));
    } finally {
      setLoadingAdvice(false);
    }
  };

  const getOfflineAdvice = (s: number, w: number): string => {
    if (s >= 90)
      return "Керемет нәтиже! Сіз биологияны жақсы меңгергенсіз. Енді тереңдетілген тақырыптарға көшіңіз.";
    if (s >= 70)
      return "Жақсы нәтиже! Қателерді талдап, қиын тақырыптарды қайта қараңыз. Практика көп жасаңыз.";
    if (s >= 50)
      return "Орташа нәтиже. Негізгі ұғымдарды қайта оқыңыз. Оқулықпен жұмыс істеп, тест тапсырыңыз.";
    return `Нәтиже нашар. ${w} сұраққа қате жауап бердіңіз. Негізгі тақырыптарды қайта оқыңыз: жасуша, генетика, фотосинтез. Күн сайын тест тапсырыңыз.`;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m} мин ${sec} сек`;
  };

  return (
    <div className="space-y-6">
      {/* Score card */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#10b981] to-[#3b82f6] mb-4 shadow-lg shadow-[#10b981]/20">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h2 className={`text-4xl font-black ${getGradeColor()}`}>{score}%</h2>
        <p className="text-sm text-[#94a3b8] mt-1">{getGrade()}</p>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <CheckCircle2 className="w-5 h-5 text-[#10b981] mx-auto mb-1" />
            <div className="text-lg font-bold text-[#e2e8f0]">{correct}</div>
            <div className="text-xs text-[#64748b]">Дұрыс</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-[#e2e8f0]">{wrong}</div>
            <div className="text-xs text-[#64748b]">Қате</div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
            <Clock className="w-5 h-5 text-[#3b82f6] mx-auto mb-1" />
            <div className="text-lg font-bold text-[#e2e8f0]">{formatTime(timeSpent)}</div>
            <div className="text-xs text-[#64748b]">Уақыт</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-sm font-medium hover:bg-white/[0.10] active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Қайта тапсыру
          </button>
          <button
            onClick={onHome}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-semibold shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            Басты бет
          </button>
        </div>
      </div>

      {/* AI Advice */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#a855f7]" />
            <h3 className="font-semibold text-[#e2e8f0]">AI Кеңес</h3>
          </div>
          <button
            onClick={fetchAIAdvice}
            disabled={loadingAdvice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a78bfa] text-xs font-medium hover:bg-[#a855f7]/15 transition-all disabled:opacity-50"
          >
            {loadingAdvice ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {loadingAdvice ? "Жүктелуде..." : "Кеңес алу"}
          </button>
        </div>
        {aiAdvice ? (
          <p className="text-sm text-[#cbd5e1] leading-relaxed bg-white/[0.03] rounded-xl p-3">
            {aiAdvice}
          </p>
        ) : (
          <p className="text-sm text-[#475569]">
            AI кеңес алу үшін жоғарыдағы батырманы басыңыз. Backend қосылғанда нақты талдау аласыз.
          </p>
        )}
      </div>

      {/* Question breakdown */}
      <div className="space-y-2">
        <h3 className="font-semibold text-[#e2e8f0] flex items-center gap-2 px-1">
          <Target className="w-4 h-4 text-[#3b82f6]" />
          Сұрақтар талдауы
        </h3>
        {test.questions.map((q, i) => {
          const isCorrect = answers[i] === q.correctAnswer;
          const isOpen = expandedIdx === i;
          return (
            <div
              key={q.id}
              className={`bg-white/[0.04] border rounded-2xl overflow-hidden transition-all ${
                isCorrect ? "border-[#10b981]/20" : "border-red-500/15"
              }`}
            >
              <button
                onClick={() => setExpandedIdx(isOpen ? null : i)}
                className="w-full flex items-center gap-3 p-3.5 text-left"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCorrect
                      ? "bg-[#10b981]/15 text-[#10b981]"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>
                <span className="flex-1 text-sm text-[#e2e8f0] truncate">
                  {i + 1}. {q.text}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0 ${
                    isCorrect
                      ? "bg-[#10b981]/10 text-[#10b981]"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {isCorrect ? "Дұрыс" : "Қате"}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#64748b] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#64748b] flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-white/[0.06]">
                  <div className="space-y-2 mt-3">
                    {q.options.map((opt, j) => (
                      <div
                        key={j}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                          j === q.correctAnswer
                            ? "bg-[#10b981]/10 text-[#6ee7b7] border border-[#10b981]/20"
                            : answers[i] === j
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-white/[0.03] text-[#94a3b8]"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            j === q.correctAnswer
                              ? "bg-[#10b981] text-white"
                              : answers[i] === j
                              ? "bg-red-400 text-white"
                              : "bg-white/[0.08] text-[#64748b]"
                          }`}
                        >
                          {String.fromCharCode(65 + j)}
                        </span>
                        {opt}
                        {j === q.correctAnswer && (
                          <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-[#10b981]" />
                        )}
                        {answers[i] === j && j !== q.correctAnswer && (
                          <XCircle className="w-3.5 h-3.5 ml-auto text-red-400" />
                        )}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="mt-3 text-xs text-[#94a3b8] bg-white/[0.03] rounded-lg p-3">
                      <span className="text-[#a855f7] font-medium">Түсініктеме:</span>{" "}
                      {q.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
