import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { isAuthenticated, saveResult, TestResult } from "@/lib/storage";
import { getCustomTestById, CustomTest, CustomQuestion } from "@/lib/customTestStorage";
import { TestAnalysis } from "@/components/TestAnalysis";
import {
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Home,
  AlertCircle,
} from "lucide-react";

export default function CustomTestRunner() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<CustomTest | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (!testId) {
      navigate("/my-tests");
      return;
    }
    const found = getCustomTestById(testId);
    if (!found) {
      navigate("/my-tests");
      return;
    }
    setTest(found);
    setTimeLeft(found.timeLimit * 60);
  }, [testId, navigate]);

  useEffect(() => {
    if (finished || !test) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleFinish(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [finished, test]);

  const handleAnswer = (qIndex: number, optIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleFinish = (auto = false) => {
    if (!test) return;
    if (!auto && Object.keys(answers).length < test.questions.length) {
      setShowConfirm(true);
      return;
    }
    clearInterval(timerRef.current);
    setFinished(true);

    const correct = test.questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    const total = test.questions.length;
    const result: TestResult = {
      testId: test.id,
      title: test.title,
      score: Math.round((correct / total) * 100),
      totalQuestions: total,
      correctAnswers: correct,
      timeSpent: test.timeLimit * 60 - timeLeft,
      completedAt: new Date().toISOString(),
      answers: test.questions.map((q, i) => ({
        questionIndex: i,
        selected: answers[i] ?? -1,
        correct: q.correctAnswer,
      })),
    };
    saveResult(result);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (!test) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-[#94a3b8]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
          Жүктелуде...
        </div>
      </div>
    );
  }

  if (finished) {
    const correct = test.questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    const total = test.questions.length;
    return (
      <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
        <div className="max-w-[800px] mx-auto px-4 py-8">
          <TestAnalysis
            test={test}
            answers={answers}
            timeSpent={test.timeLimit * 60 - timeLeft}
            onRetry={() => {
              setFinished(false);
              setAnswers({});
              setCurrent(0);
              setTimeLeft(test.timeLimit * 60);
            }}
            onHome={() => navigate("/")}
          />
        </div>
      </div>
    );
  }

  const q = test.questions[current];
  const isDanger = timeLeft < 60;

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[900px] mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/my-tests")}
            className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#6ee7b7] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Шығу</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#64748b]">
              {current + 1} / {test.questions.length}
            </span>
            <div className="w-24 sm:w-32 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] rounded-full transition-all"
                style={{ width: `${((current + 1) / test.questions.length) * 100}%` }}
              />
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 font-mono text-sm font-bold ${
              isDanger ? "text-red-400 animate-pulse" : "text-[#e2e8f0]"
            }`}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-[800px] mx-auto px-4 py-6">
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 sm:p-6 space-y-5">
          <h2 className="text-base sm:text-lg font-semibold leading-relaxed">
            {current + 1}. {q.text}
          </h2>
          {q.image && (
            <img
              src={q.image}
              alt="Сұрақ"
              className="max-h-64 rounded-xl border border-white/[0.08] mx-auto"
            />
          )}
          <div className="space-y-2.5">
            {q.options.map((opt, j) => {
              const selected = answers[current] === j;
              return (
                <button
                  key={j}
                  onClick={() => handleAnswer(current, j)}
                  className={`w-full flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${
                    selected
                      ? "bg-[#10b981]/10 border-[#10b981]/40 text-[#e2e8f0]"
                      : "bg-white/[0.03] border-white/[0.06] text-[#cbd5e1] hover:bg-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 transition-all ${
                      selected
                        ? "bg-[#10b981] border-[#10b981] text-white"
                        : "border-white/[0.18] text-[#64748b]"
                    }`}
                  >
                    {String.fromCharCode(65 + j)}
                  </span>
                  <span className="text-sm">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-sm font-medium disabled:opacity-30 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            Алдыңғы
          </button>

          {/* Dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {test.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current
                    ? "bg-[#10b981] w-4"
                    : answers[i] !== undefined
                    ? "bg-[#3b82f6]"
                    : "bg-white/[0.12]"
                }`}
              />
            ))}
          </div>

          {current < test.questions.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-sm font-medium hover:bg-white/[0.10] transition-all active:scale-95"
            >
              Келесі
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleFinish()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-semibold shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/30 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              Аяқтау
            </button>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold">Назар аударыңыз</h3>
            </div>
            <p className="text-sm text-[#94a3b8]">
              {test.questions.length - Object.keys(answers).length} сұраққа жауап бермедіңіз. Тестті аяқтағыңыз
              келе ме?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-[#cbd5e1] text-sm font-medium hover:bg-white/[0.10] transition-all"
              >
                Жоқ, жалғастыру
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleFinish(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-sm font-semibold transition-all"
              >
                Иә, аяқтау
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
