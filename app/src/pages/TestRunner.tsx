import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { isAuthenticated } from "@/lib/storage";
import { saveResult } from "@/lib/storage";
import { ArrowLeft, ArrowRight, Clock, CheckCircle, XCircle, BookOpen } from "lucide-react";

interface Question {
  q: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface TestData {
  title: string;
  description: string;
  questions: number;
  time: number;
  data: Question[];
}

export default function TestRunner() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    fetch(`/tests/all-tests.json`)
      .then((r) => r.json())
      .then((data) => {
        const test = data[testId || ""];
        if (!test) {
          navigate("/tests");
          return;
        }
        setTestData(test);
        setAnswers(new Array(test.data.length).fill(-1));
        setTimeLeft(test.time * 60);
        setLoading(false);
      });
  }, [testId, navigate]);

  useEffect(() => {
    if (timeLeft <= 0 || finished) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finishTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finished]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const selectAnswer = useCallback((idx: number) => {
    if (finished) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = idx;
      return next;
    });
  }, [currentQ, finished]);

  const finishTest = useCallback(() => {
    if (finished) return;
    setFinished(true);
    setShowResults(true);

    if (!testData) return;
    const correct = answers.reduce((acc, ans, idx) => {
      return acc + (ans === testData.data[idx].correct ? 1 : 0);
    }, 0);

    const timeSpent = testData.time * 60 - timeLeft;
    const result = {
      testId: testId || "",
      title: testData.title,
      score: Math.round((correct / testData.data.length) * 100),
      totalQuestions: testData.data.length,
      correctAnswers: correct,
      timeSpent,
      completedAt: new Date().toISOString(),
      answers: answers.map((ans, idx) => ({
        questionIndex: idx,
        selected: ans,
        correct: testData.data[idx].correct,
      })),
    };
    saveResult(result);
  }, [finished, answers, testData, testId, timeLeft]);

  const nextQuestion = useCallback(() => {
    if (currentQ < (testData?.data.length || 0) - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      finishTest();
    }
  }, [currentQ, testData, finishTest]);

  const prevQuestion = useCallback(() => {
    if (currentQ > 0) setCurrentQ((q) => q - 1);
  }, [currentQ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!testData) return null;

  const question = testData.data[currentQ];
  const progress = ((currentQ + 1) / testData.data.length) * 100;
  const answeredCount = answers.filter((a) => a !== -1).length;

  // Results view
  if (showResults) {
    const correct = answers.reduce((acc, ans, idx) => acc + (ans === testData.data[idx].correct ? 1 : 0), 0);
    const score = Math.round((correct / testData.data.length) * 100);
    const timeSpent = testData.time * 60 - timeLeft;

    return (
      <div className="min-h-screen bg-slate-900 text-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 mb-6">
            <h2 className="text-2xl font-bold text-center mb-6">Тест нәтижесі</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-500/10 rounded-xl p-4 text-center border border-emerald-500/20">
                <div className="text-3xl font-bold text-emerald-400">{score}%</div>
                <div className="text-sm text-white/50">Ұпай</div>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-4 text-center border border-blue-500/20">
                <div className="text-3xl font-bold text-blue-400">{correct}/{testData.data.length}</div>
                <div className="text-sm text-white/50">Дұрыс</div>
              </div>
              <div className="bg-purple-500/10 rounded-xl p-4 text-center border border-purple-500/20">
                <div className="text-3xl font-bold text-purple-400">{formatTime(timeSpent)}</div>
                <div className="text-sm text-white/50">Уақыт</div>
              </div>
              <div className={`rounded-xl p-4 text-center border ${score >= 70 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 50 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <div className={`text-3xl font-bold ${score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {score >= 70 ? 'Жақсы' : score >= 50 ? 'Қанағаттанарлық' : 'Қайта тапсыр'}
                </div>
                <div className="text-sm text-white/50">Баға</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => navigate("/tests")} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition">
                Тесттерге оралу
              </button>
              <button onClick={() => navigate("/profile")} className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition">
                Профиль
              </button>
            </div>
          </div>

          {/* Review */}
          <h3 className="text-xl font-bold mb-4">Қателерді талдау</h3>
          <div className="space-y-3">
            {testData.data.map((q, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns === q.correct;
              if (isCorrect) return null;
              return (
                <div key={idx} className="bg-white/5 rounded-xl p-4 border border-red-500/20">
                  <div className="flex items-start gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{idx + 1}. {q.q}</p>
                      <p className="text-sm text-white/50 mt-1">Сіздің жауабыңыз: {userAns >= 0 ? q.options[userAns] : "Жауап берілмеді"}</p>
                      <p className="text-sm text-emerald-400 mt-1">Дұрыс жауап: {q.options[q.correct]}</p>
                      {q.explanation && <p className="text-sm text-white/40 mt-2 bg-white/5 p-2 rounded">{q.explanation}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
            {answers.every((a, idx) => a === testData.data[idx].correct) && (
              <div className="text-center py-8 text-emerald-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Барлық сұрақтар дұрыс!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-800/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/tests")} className="flex items-center gap-1 text-white/60 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Шығу
          </button>
          <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-amber-400'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="text-sm text-white/50">{currentQ + 1}/{testData.data.length}</div>
        </div>
        <div className="h-1 bg-white/5">
          <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white/5 rounded-2xl p-5 md:p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4 text-sm text-white/40">
            <BookOpen className="w-4 h-4" />
            <span>Сұрақ {currentQ + 1} / {testData.data.length}</span>
            <span className="ml-auto">{answeredCount} жауап берілді</span>
          </div>

          <h2 className="text-lg md:text-xl font-bold mb-6 leading-relaxed">{question.q}</h2>

          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              const isSelected = answers[currentQ] === idx;
              const isAnswered = answers[currentQ] !== -1;
              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all text-sm md:text-base ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? "border-emerald-400 bg-emerald-400 text-slate-900" : "border-white/30"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevQuestion}
            disabled={currentQ === 0}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm disabled:opacity-30 hover:bg-white/10 transition"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" /> Алдыңғы
          </button>

          <button
            onClick={finishTest}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-300 hover:bg-red-500/30 transition"
          >
            Аяқтау
          </button>

          <button
            onClick={nextQuestion}
            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600 transition"
          >
            {currentQ === testData.data.length - 1 ? "Аяқтау" : "Келесі"} <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>

        {/* Question dots */}
        <div className="flex flex-wrap gap-1.5 mt-6 justify-center">
          {testData.data.map((_, idx) => {
            const status = answers[idx] === -1 ? "unanswered" : answers[idx] === testData.data[idx].correct ? "correct" : "answered";
            return (
              <button
                key={idx}
                onClick={() => setCurrentQ(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                  idx === currentQ
                    ? "bg-emerald-500 text-white"
                    : answers[idx] !== -1
                    ? "bg-emerald-500/30 text-emerald-400"
                    : "bg-white/5 text-white/30 hover:bg-white/10"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
