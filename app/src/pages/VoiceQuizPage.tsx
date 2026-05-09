import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import {
  Mic, MicOff, Volume2, VolumeX, Play, RotateCcw, Home,
  Loader2, CheckCircle, XCircle, Brain, ArrowLeft,
  Zap, Award, AlertCircle,
} from "lucide-react";
import { speak, stopSpeaking, isSpeaking, AudioRecorder, processVoiceAnswer } from "@/lib/voiceAI";

const SAMPLE_QUESTIONS = [
  { q: "Жасушаның энергетикалық станциясы?", options: ["Митохондрия", "Ядро", "Рибосома", "Гольджи"], correct: 0 },
  { q: "Фотосинтезде оттегі бөлінетін фаза?", options: ["Жарық фаза", "Кальвин циклі", "Гликолиз", "Кребс циклі"], correct: 0 },
  { q: "ДНҚ қос спиральын кім ашты?", options: ["Уотсон мен Крик", "Мендель", "Дарвин", "Линней"], correct: 0 },
  { q: "Мейоз нәтижесінде не түзіледі?", options: ["4 гаплоидты жасуша", "2 диплоидты жасуша", "4 диплоидты жасуша", "2 гаплоидты жасуша"], correct: 0 },
  { q: "Табиғи сұрыпталу авторы?", options: ["Ч. Дарвин", "Ж. Ламарк", "Т. Мальтус", "А. Уоллес"], correct: 0 },
  { q: "Генетикалық ақпарат сақталатын құрылым?", options: ["Ядро", "Митохондрия", "Рибосома", "Лизосома"], correct: 0 },
];

type Phase = "intro" | "ask" | "listen" | "process" | "feedback" | "result";

export default function VoiceQuizPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [lastResult, setLastResult] = useState<{ isCorrect: boolean; userAnswer: string } | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const question = SAMPLE_QUESTIONS[current];

  // Speak current question
  const askQuestion = useCallback(async () => {
    setPhase("ask");
    setError("");

    const text = `Сұрақ ${current + 1}. ${question.q}. Нұсқалар: ${question.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(", ")}`;

    try {
      setSpeaking(true);
      await speak(text, "ru-RU", 0.85);
      setSpeaking(false);
      setPhase("listen");
    } catch {
      setSpeaking(false);
      setPhase("listen");
    }
  }, [current, question]);

  // Start recording
  const startListening = async () => {
    try {
      setIsListening(true);
      setPhase("listen");
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.start();
    } catch (err) {
      setError("Микрофон рұқсаты берілмеген. Браузер баптауларын тексеріңіз.");
      setIsListening(false);
    }
  };

  // Stop recording & process
  const stopListening = async () => {
    if (!recorderRef.current) return;

    setIsListening(false);
    setPhase("process");

    try {
      const blob = await recorderRef.current.stop();
      const result = await processVoiceAnswer(
        blob,
        question.options[question.correct],
        question.options
      );

      setLastResult({ isCorrect: result.isCorrect, userAnswer: result.userAnswer });

      if (result.isCorrect) {
        setScore((s) => s + 1);
      }
      setAnswers((prev) => [...prev, result.isCorrect]);
      setPhase("feedback");
    } catch (err: any) {
      setError("Дыбысты тану қатесі: " + (err.message || "Белгісіз қате"));
      setPhase("listen");
    }
  };

  // Next question
  const nextQuestion = () => {
    if (current >= SAMPLE_QUESTIONS.length - 1) {
      setPhase("result");
    } else {
      setCurrent((c) => c + 1);
      setLastResult(null);
      setPhase("ask");
    }
  };

  // Restart
  const restart = () => {
    setCurrent(0);
    setPhase("intro");
    setScore(0);
    setAnswers([]);
    setLastResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ec4899] to-[#f59e0b] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">🎙 Voice Quiz</h1>
          <p className="text-white/60">Дыбыспен жауап бер — қолданба!</p>

          {phase !== "intro" && phase !== "result" && (
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <span className="px-3 py-1 bg-white/10 rounded-full">
                {current + 1} / {SAMPLE_QUESTIONS.length}
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                {score} дұрыс
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Phase: Intro */}
        {phase === "intro" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <Volume2 className="w-16 h-16 text-[#ec4899] mx-auto mb-6" />
            <h2 className="text-xl font-bold mb-3">Қалай жұмыс істейді?</h2>
            <div className="space-y-3 text-left max-w-md mx-auto mb-6">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#ec4899]/20 text-[#ec4899] flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <p className="text-sm text-white/70">AI сұрақты дыбыспен оқиды</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#ec4899]/20 text-[#ec4899] flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <p className="text-sm text-white/70">Микрофон батырмасын басып, жауабыңызды айтыңыз</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#ec4899]/20 text-[#ec4899] flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <p className="text-sm text-white/70">"А", "Б", "В" не болмаса нұсқа мәтінін айтыңыз</p>
              </div>
            </div>
            <button
              onClick={askQuestion}
              className="px-8 py-3 bg-gradient-to-r from-[#ec4899] to-[#f59e0b] text-white rounded-xl font-bold flex items-center gap-2 mx-auto hover:opacity-90 transition"
            >
              <Play className="w-5 h-5" /> Бастау!
            </button>
          </div>
        )}

        {/* Phase: Ask / Listen */}
        {(phase === "ask" || phase === "listen") && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {/* Question display */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">{question.q}</h3>
              <div className="space-y-2">
                {question.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice controls */}
            <div className="flex justify-center gap-4">
              {speaking ? (
                <button onClick={() => { stopSpeaking(); setSpeaking(false); }} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition">
                  <VolumeX className="w-6 h-6" />
                </button>
              ) : (
                <button onClick={askQuestion} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition" title="Сұрақты қайталау">
                  <Volume2 className="w-6 h-6" />
                </button>
              )}

              {!isListening ? (
                <button
                  onClick={startListening}
                  disabled={phase === "ask"}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-[#ec4899] to-[#f59e0b] flex items-center justify-center shadow-lg hover:scale-105 transition disabled:opacity-50"
                >
                  <Mic className="w-7 h-7 text-white" />
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg animate-pulse hover:scale-105 transition"
                >
                  <MicOff className="w-7 h-7 text-white" />
                </button>
              )}
            </div>

            {isListening && (
              <p className="text-center text-sm text-[#ec4899] mt-4 animate-pulse">
                🎙 Тыңдауда... Жауабыңызды айтып, тоқтату үшін қайта басыңыз
              </p>
            )}
          </div>
        )}

        {/* Phase: Processing */}
        {phase === "process" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ec4899]/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-[#ec4899] animate-spin" />
            </div>
            <p className="text-lg font-medium">Дыбыс талдануда...</p>
            <p className="text-sm text-white/50 mt-2">Whisper AI жауабыңызды танып жатыр</p>
          </div>
        )}

        {/* Phase: Feedback */}
        {phase === "feedback" && lastResult && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            {lastResult.isCorrect ? (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-400 mb-2">Дұрыс! ✅</h2>
                <p className="text-white/60">Жақсы жауап! {lastResult.userAnswer}</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">Қате ❌</h2>
                <p className="text-white/60">Сіздің жауабыңыз: {lastResult.userAnswer || "(табылмады)"}</p>
                <p className="text-white/80 mt-2">
                  Дұрыс: <span className="font-bold text-emerald-400">{question.options[question.correct]}</span>
                </p>
              </>
            )}

            <button
              onClick={nextQuestion}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#ec4899] to-[#f59e0b] text-white rounded-xl font-bold flex items-center gap-2 mx-auto hover:opacity-90 transition"
            >
              <Zap className="w-5 h-5" />
              {current >= SAMPLE_QUESTIONS.length - 1 ? "Нәтиже" : "Келесі сұрақ"}
            </button>
          </div>
        )}

        {/* Phase: Result */}
        {phase === "result" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#a855f7] to-[#3b82f6] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Нәтиже 🎉</h2>
            <p className="text-4xl font-extrabold bg-gradient-to-r from-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent mb-4">
              {score} / {SAMPLE_QUESTIONS.length}
            </p>
            <p className="text-white/60 mb-6">
              {score >= 5 ? "Тамаша! 🔥" : score >= 3 ? "Жақсы! 💪" : "Тағы үйрену керек 📚"}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={restart} className="px-6 py-3 bg-gradient-to-r from-[#ec4899] to-[#f59e0b] text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition">
                <RotateCcw className="w-5 h-5" /> Қайта
              </button>
              <button onClick={() => navigate("/")} className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 transition">
                <Home className="w-5 h-5" /> Басты бет
              </button>
            </div>
          </div>
        )}

        {/* Back button */}
        {phase !== "result" && (
          <button onClick={() => navigate("/")} className="mt-6 flex items-center gap-2 text-sm text-white/50 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Басты бетке
          </button>
        )}
      </div>
    </div>
  );
}
