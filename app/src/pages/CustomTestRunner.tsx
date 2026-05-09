```tsx
// ============================================
// ▶️ TEST RUNNER + AI КӨМЕКШІ — Public & Custom тесттер
// ============================================

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCustomTest, saveTestResult } from "@/lib/customTestStorage";

import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  CheckCircle,
  RotateCcw,
  Home,
  Loader2,
  Sparkles,
  Wifi,
  WifiOff,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Zap,
  Volume2,
  Skull,
  Timer,
  Flame,
} from "lucide-react";

const HINT_API = "/api/hints";
const EXPLAIN_API = "/api/explain-question";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  image?: string;
}

interface TestData {
  id: string;
  title: string;
  description?: string;
  category?: string;
  timeLimit: number;
  questions: Question[];
}

const LOCAL_HINTS: Record<string, string> = {
  жасуша:
    "Жасушаның негізгі бөліктері: ядро, митохондрия, рибосома.",
  фотосинтез:
    "Фотосинтез: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.",
  днк:
    "ДНҚ: A-T, G-C жұптары.",
  митоз:
    "Митоз: Профаза → Метафаза → Анафаза → Телофаза.",
};

function getLocalHint(q: string): string {
  const lower = q.toLowerCase();

  for (const [key, val] of Object.entries(LOCAL_HINTS)) {
    if (lower.includes(key)) {
      return `💡 ${val}`;
    }
  }

  return "💡 Сұрақты мұқият оқыңыз.";
}

function getLocalExplanation(
  q: string,
  options: string[],
  correctIdx: number
): string {
  return `
📚 Түсіндірме:

Сұрақ бойынша негізгі ұғымды есте сақтаңыз.

✅ Дұрыс жауап:
${options[correctIdx] || "Белгісіз"}
`;
}

async function loadPublicTest(
  testId: string
): Promise<TestData | null> {
  try {
    const res = await fetch("/tests/all-tests.json");

    if (!res.ok) return null;

    const data = await res.json();
    const raw = data[testId];

    if (!raw) return null;

    return {
      id: testId,
      title: raw.title || testId,
      description: raw.description || "",
      timeLimit: raw.time || 45,
      questions: (raw.data || []).map(
        (q: any, idx: number) => ({
          id: `${testId}-${idx}`,
          text: q.q || "",
          options: q.options || [],
          correctAnswer:
            typeof q.correct === "number"
              ? q.correct
              : 0,
          explanation: q.explanation || "",
        })
      ),
    };
  } catch {
    return null;
  }
}

function CustomTestRunner() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] =
    useState<TestData | null>(null);

  const [loadingTest, setLoadingTest] =
    useState(true);

  const [current, setCurrent] = useState(0);

  const [answers, setAnswers] = useState<
    Record<number, number>
  >({});

  const [timeLeft, setTimeLeft] = useState(0);

  const [finished, setFinished] = useState(false);

  const [hint, setHint] = useState("");

  const [hintLoading, setHintLoading] =
    useState(false);

  const [showHint, setShowHint] =
    useState(false);

  const [hintType, setHintType] = useState<
    "mini" | "full" | "explain"
  >("mini");

  const [online, setOnline] =
    useState(true);

  const [gameOver, setGameOver] =
    useState(false);

  const [speaking, setSpeaking] =
    useState(false);

  const [cheatLoading, setCheatLoading] =
    useState(false);

  useEffect(() => {
    const loadTest = async () => {
      try {
        if (!testId) {
          navigate("/tests");
          return;
        }

        let testData = getCustomTest(testId);

        if (!testData) {
          testData =
            await loadPublicTest(testId);
        }

        if (!testData) {
          navigate("/tests");
          return;
        }

        setTest(testData);
        setTimeLeft(
          testData.timeLimit * 60
        );
      } finally {
        setLoadingTest(false);
      }
    };

    loadTest();
  }, [testId, navigate]);

  useEffect(() => {
    const onlineHandler = () =>
      setOnline(true);

    const offlineHandler = () =>
      setOnline(false);

    window.addEventListener(
      "online",
      onlineHandler
    );

    window.addEventListener(
      "offline",
      offlineHandler
    );

    return () => {
      window.removeEventListener(
        "online",
        onlineHandler
      );

      window.removeEventListener(
        "offline",
        offlineHandler
      );
    };
  }, []);

  useEffect(() => {
    if (!test || finished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, finished]);

  const handleAnswer = (idx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [current]: idx,
    }));
  };

  const getHint = async (
    type: "mini" | "full" | "explain"
  ) => {
    if (!test) return;

    setHintLoading(true);
    setShowHint(true);

    try {
      if (!online) {
        const fallback =
          type === "explain"
            ? getLocalExplanation(
                test.questions[current].text,
                test.questions[current]
                  .options,
                test.questions[current]
                  .correctAnswer
              )
            : getLocalHint(
                test.questions[current].text
              );

        setHint(fallback);
        return;
      }

      const api =
        type === "explain"
          ? EXPLAIN_API
          : HINT_API;

      const res = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          question:
            test.questions[current].text,
          options:
            test.questions[current]
              .options,
          correctIdx:
            test.questions[current]
              .correctAnswer,
        }),
      });

      const data = await res.json();

      setHint(
        data.hint ||
          data.explanation ||
          "Жауап жоқ"
      );
    } catch {
      setHint(
        getLocalHint(
          test.questions[current].text
        )
      );
    } finally {
      setHintLoading(false);
    }
  };

  const speakQuestion = () => {
    if (!test) return;

    if (!("speechSynthesis" in window)) {
      return;
    }

    setSpeaking(true);

    const utterance =
      new SpeechSynthesisUtterance(
        test.questions[current].text
      );

    utterance.lang = "kk-KZ";

    speechSynthesis.speak(utterance);

    utterance.onend = () =>
      setSpeaking(false);
  };

  const getCheatSheet = async () => {
    setCheatLoading(true);

    setHint(`
⚡ Cheat Sheet:

1. Сұрақты мұқият оқыңыз
2. Артық жауаптарды алып тастаңыз
3. Ең логикалық жауапты таңдаңыз
`);

    setShowHint(true);

    setCheatLoading(false);
  };

  const handleFinish = useCallback(() => {
    if (!test) return;

    setFinished(true);

    const correct =
      test.questions.filter(
        (q, idx) =>
          answers[idx] ===
          q.correctAnswer
      ).length;

    saveTestResult({
      testId: test.id,
      totalQuestions:
        test.questions.length,
      correctAnswers: correct,
      timeSpent:
        test.timeLimit * 60 -
        timeLeft,
      mode: "normal",
    });
  }, [test, answers, timeLeft]);

  if (loadingTest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="w-10 h-10 animate-spin text-green-400" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        Тест табылмады
      </div>
    );
  }

  const q = test.questions[current];

  const minutes = Math.floor(
    timeLeft / 60
  );

  const seconds = timeLeft % 60;

  if (finished) {
    const correct =
      Object.entries(answers).filter(
        ([idx, ans]) =>
          ans ===
          test.questions[
            parseInt(idx)
          ].correctAnswer
      ).length;

    const percentage = Math.round(
      (correct /
        test.questions.length) *
        100
    );

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center max-w-xl w-full">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />

          <h2 className="text-3xl font-bold text-white mb-3">
            Тест аяқталды
          </h2>

          <p className="text-5xl font-bold text-green-400 mb-4">
            {percentage}%
          </p>

          <p className="text-slate-400 mb-6">
            {correct} /{" "}
            {test.questions.length}
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() =>
                navigate("/tests")
              }
              className="px-5 py-3 bg-green-500 rounded-xl text-white"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Тесттер
            </button>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="px-5 py-3 bg-blue-500 rounded-xl text-white"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Қайта
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() =>
              navigate("/tests")
            }
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Артқа
          </button>

          <div className="flex items-center gap-3">
            {online ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}

            <div className="bg-green-500/10 px-4 py-2 rounded-xl">
              <Timer className="w-4 h-4 inline mr-2" />

              {minutes}:
              {seconds
                .toString()
                .padStart(2, "0")}
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">

          <h2 className="text-2xl font-bold mb-6">
            {q.text}
          </h2>

          <div className="space-y-3">
            {q.options.map(
              (opt, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleAnswer(idx)
                  }
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    answers[current] === idx
                      ? "bg-green-500/10 border-green-500"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  {String.fromCharCode(
                    65 + idx
                  )}
                  . {opt}
                </button>
              )
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-6">

            <button
              onClick={() =>
                getHint("mini")
              }
              className="px-4 py-2 bg-green-500/10 rounded-xl"
            >
              <Lightbulb className="w-4 h-4 inline mr-2" />
              Hint
            </button>

            <button
              onClick={() =>
                getHint("explain")
              }
              className="px-4 py-2 bg-yellow-500/10 rounded-xl"
            >
              <GraduationCap className="w-4 h-4 inline mr-2" />
              Explain
            </button>

            <button
              onClick={speakQuestion}
              disabled={speaking}
              className="px-4 py-2 bg-pink-500/10 rounded-xl"
            >
              <Volume2 className="w-4 h-4 inline mr-2" />
              Voice
            </button>

            <button
              onClick={getCheatSheet}
              disabled={cheatLoading}
              className="px-4 py-2 bg-cyan-500/10 rounded-xl"
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Cheat Sheet
            </button>
          </div>

          {showHint && (
            <div className="mt-6 bg-black/20 border border-white/10 rounded-2xl p-4 whitespace-pre-line">
              {hintLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                hint
              )}
            </div>
          )}

          <div className="flex justify-between mt-8">

            <button
              onClick={() =>
                setCurrent(
                  Math.max(
                    0,
                    current - 1
                  )
                )
              }
              disabled={current === 0}
              className="px-5 py-3 bg-white/5 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 inline mr-2" />
              Артқа
            </button>

            {current <
            test.questions.length - 1 ? (
              <button
                onClick={() =>
                  setCurrent(
                    current + 1
                  )
                }
                className="px-5 py-3 bg-green-500 rounded-xl"
              >
                Келесі
                <ChevronRight className="w-4 h-4 inline ml-2" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-5 py-3 bg-blue-500 rounded-xl"
              >
                Аяқтау
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomTestRunner;
```
