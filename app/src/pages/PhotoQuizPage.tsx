import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Camera, Upload, Loader2, Zap, ArrowLeft, CheckCircle,
  RefreshCw, AlertTriangle, Brain, ScanLine, ImageIcon,
  Type, Sparkles, X,
} from "lucide-react";
import {
  startCamera, stopCamera, capturePhoto,
  extractText, generateQuestionFromPhoto,
  createInitialState,
} from "@/lib/photoQuiz";
import type { PhotoQuizState, ParsedQuestion } from "@/lib/photoQuiz";

export default function PhotoQuizPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<PhotoQuizState>(createInitialState);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Start camera
  const openCamera = useCallback(async () => {
    try {
      if (!videoRef.current) return;
      const s = await startCamera(videoRef.current, "environment");
      setStream(s);
      setShowCamera(true);
      setState((prev) => ({ ...prev, phase: "camera" }));
    } catch {
      setState((prev) => ({
        ...prev,
        error: "Камера рұқсаты берілмеді. Файл жүктеуді қолданыңыз.",
      }));
    }
  }, []);

  // Stop camera
  const closeCamera = useCallback(() => {
    stopCamera(stream);
    setStream(null);
    setShowCamera(false);
  }, [stream]);

  // Take photo
  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const photoData = capturePhoto(videoRef.current, canvasRef.current);
      closeCamera();
      setState((prev) => ({ ...prev, phase: "capturing", photoData }));
      processPhoto(photoData);
    } catch {
      setState((prev) => ({ ...prev, error: "Сурет түсіру қатесі" }));
    }
  }, [closeCamera]);

  // Handle file upload
  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const photoData = ev.target?.result as string;
          setState((prev) => ({ ...prev, phase: "capturing", photoData }));
          await processPhoto(photoData);
        };
        reader.readAsDataURL(file);
      } catch {
        setState((prev) => ({ ...prev, error: "Файл оқу қатесі" }));
      }
    },
    []
  );

  // Process photo: OCR + AI
  const processPhoto = async (photoData: string) => {
    // Step 1: OCR
    setState((prev) => ({ ...prev, phase: "ocr" }));

    try {
      const ocr = await extractText(photoData);

      setState((prev) => ({
        ...prev,
        ocrText: ocr.text,
        ocrConfidence: ocr.confidence,
        phase: "generating",
      }));

      // Step 2: AI Question Generation
      const aiQ = await generateQuestionFromPhoto(ocr.text);

      setState((prev) => ({
        ...prev,
        aiQuestion: aiQ,
        phase: "review",
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        phase: "review",
        error: "Өңдеу қатесі: " + (err.message || "Белгісіз"),
      }));
    }
  };

  // Start quiz with generated question
  const startQuiz = () => {
    if (state.aiQuestion) {
      setQuizMode(true);
      setUserAnswer(null);
      setShowResult(false);
    }
  };

  // Check answer
  const checkAnswer = (idx: number) => {
    setUserAnswer(idx);
    setShowResult(true);
  };

  // Reset everything
  const reset = () => {
    setState(createInitialState());
    setQuizMode(false);
    setUserAnswer(null);
    setShowResult(false);
    closeCamera();
  };

  const q = state.aiQuestion;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">📷 Smart Scan Quiz</h1>
          <p className="text-white/60">Сурет түсір → AI тест жаса → Тапсыр!</p>
        </div>

        {/* Error */}
        {state.error && (
          <div className="mb-4 p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {state.error}
          </div>
        )}

        {/* Phase: Camera */}
        {!quizMode && state.phase === "camera" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden">
            {showCamera ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-xl aspect-[4/3] object-cover"
                  playsInline
                  muted
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={takePhoto}
                    className="w-16 h-16 rounded-full bg-white border-4 border-[#10b981] flex items-center justify-center shadow-lg hover:scale-105 transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#10b981]" />
                  </button>
                  <button
                    onClick={closeCamera}
                    className="px-4 py-2 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="w-12 h-12 text-[#10b981] mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Сурет түсіру</h3>
                <p className="text-sm text-white/50 mb-6">
                  Оқулықтан, конспекттен не болмаса тест тапсырмасынан сурет түсіріңіз
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={openCamera}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition"
                  >
                    <Camera className="w-4 h-4" /> Камера ашу
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-white/10 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-white/20 transition"
                  >
                    <Upload className="w-4 h-4" /> Файл жүктеу
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase: Capturing / OCR / Generating */}
        {!quizMode &&
          (state.phase === "capturing" ||
            state.phase === "ocr" ||
            state.phase === "generating") && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              {state.photoData && (
                <img
                  src={state.photoData}
                  alt="Captured"
                  className="max-h-48 mx-auto rounded-xl mb-6 border border-white/10"
                />
              )}
              <div className="w-16 h-16 rounded-full bg-[#10b981]/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-[#10b981] animate-spin" />
              </div>
              <p className="text-lg font-medium">
                {state.phase === "capturing"
                  ? "Сурет өңделуде..."
                  : state.phase === "ocr"
                  ? "Мәтін танылуда (OCR)..."
                  : "AI сұрақ жасап жатыр..."}
              </p>
              <p className="text-sm text-white/50 mt-2">
                {state.ocrConfidence > 0 && `OCR Confidence: ${Math.round(state.ocrConfidence)}%`}
              </p>
            </div>
          )}

        {/* Phase: Review */}
        {!quizMode && state.phase === "review" && (
          <div className="space-y-4">
            {/* Photo preview */}
            {state.photoData && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <img
                  src={state.photoData}
                  alt="Captured"
                  className="max-h-48 mx-auto rounded-xl border border-white/10"
                />
              </div>
            )}

            {/* OCR Text */}
            {state.ocrText && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#10b981]" /> Танылған мәтін
                </h3>
                <p className="text-xs text-white/60 bg-white/5 rounded-lg p-3 whitespace-pre-line">
                  {state.ocrText}
                </p>
              </div>
            )}

            {/* AI Generated Question */}
            {q ? (
              <div className="bg-gradient-to-br from-[#10b981]/10 to-[#06b6d4]/10 border border-[#10b981]/20 rounded-2xl p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#10b981]" /> AI жасаған сұрақ
                </h3>
                <p className="text-sm font-medium mb-3">{q.question}</p>
                <div className="space-y-2 mb-4">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                    >
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={startQuiz}
                  className="w-full py-2.5 bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  <Zap className="w-4 h-4" /> Тестті бастау!
                </button>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <Brain className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/50">AI сұрақ жасай алмады. Танылған мәтін тым қысқа немесе түсініксіз болуы мүмкін.</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition"
              >
                <RefreshCw className="w-4 h-4" /> Қайта
              </button>
            </div>
          </div>
        )}

        {/* Quiz Mode */}
        {quizMode && q && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">{q.question}</h3>
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                let btnClass =
                  "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ";

                if (showResult) {
                  if (i === q.correctIndex) {
                    btnClass +=
                      "bg-emerald-500/15 border-emerald-500/40";
                  } else if (i === userAnswer && i !== q.correctIndex) {
                    btnClass += "bg-red-500/15 border-red-500/40";
                  } else {
                    btnClass +=
                      "bg-white/5 border-white/10 opacity-50";
                  }
                } else {
                  btnClass +=
                    "bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer";
                }

                return (
                  <button
                    key={i}
                    onClick={() => !showResult && checkAnswer(i)}
                    disabled={showResult}
                    className={btnClass}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        showResult && i === q.correctIndex
                          ? "bg-emerald-500 text-white"
                          : showResult &&
                            i === userAnswer &&
                            i !== q.correctIndex
                          ? "bg-red-500 text-white"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {showResult && i === q.correctIndex ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="mt-4 text-center">
                {userAnswer === q.correctIndex ? (
                  <p className="text-emerald-400 font-bold">Дұрыс! ✅</p>
                ) : (
                  <p className="text-red-400">
                    Дұрыс жауап:{" "}
                    <span className="font-bold">
                      {q.options[q.correctIndex]}
                    </span>
                  </p>
                )}
                {q.explanation && (
                  <p className="text-xs text-white/60 mt-2 bg-white/5 rounded-lg p-3">
                    {q.explanation}
                  </p>
                )}
                <button
                  onClick={reset}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#10b981] to-[#06b6d4] text-white rounded-xl font-bold flex items-center gap-2 mx-auto hover:opacity-90 transition"
                >
                  <ScanLine className="w-4 h-4" /> Жаңа сурет
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center gap-2 text-sm text-white/50 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Басты бетке
        </button>
      </div>
    </div>
  );
}
