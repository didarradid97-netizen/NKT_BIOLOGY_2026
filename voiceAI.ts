// ============================================
// 🎙 VOICE AI — Speech-to-Text + Text-to-Speech + Voice Quiz
// Whisper (Groq) + Browser SpeechSynthesis
// ============================================

// ---- Text-to-Speech (Browser API) ----

export function speak(text: string, lang = "ru-RU", rate = 0.9): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("Browser TTS не поддерживается"));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.includes("ru") || v.lang.includes("kk")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking || false;
}

// ---- Speech-to-Text (Whisper via Groq API) ----

export interface STTResult {
  text: string;
  confidence?: number;
}

/**
 * Whisper STT via Groq API
 * @param audioBlob - Audio blob from microphone
 * @returns Transcribed text
 */
export async function speechToText(audioBlob: Blob): Promise<STTResult> {
  const formData = new FormData();
  formData.append("file", audioBlob, "voice.webm");
  formData.append("model", "whisper-large-v3");
  formData.append("response_format", "json");

  const res = await fetch("/api/voice", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    // Fallback: browser Web Speech API
    console.warn("Whisper API fail, trying browser STT");
    return browserSTT();
  }

  const data = await res.json();
  return { text: data.text || "" };
}

/**
 * Browser Web Speech API fallback
 */
function browserSTT(): Promise<STTResult> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error("STT not supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU"; // Russian for biology terms
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      resolve({ text, confidence: event.results[0][0].confidence });
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`STT error: ${event.error}`));
    };

    recognition.start();
  });
}

// ---- Voice Quiz Engine ----

export interface VoiceQuizState {
  phase: "listening" | "processing" | "answering" | "feedback";
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

/**
 * Process voice input for quiz
 * 1. Record audio
 * 2. STT to text
 * 3. Match answer (A/B/C/D or text)
 * 4. Return result
 */
export async function processVoiceAnswer(
  audioBlob: Blob,
  correctAnswer: string,
  options: string[]
): Promise<VoiceQuizState> {
  // Step 1: Transcribe
  const stt = await speechToText(audioBlob);
  const userText = stt.text.toLowerCase().trim();

  // Step 2: Parse answer
  let userAnswer = "";

  // Check for letter (A, B, C, D / А, Б, В, Г)
  const letterMatch = userText.match(/\b([a-dа-г])\b/i);
  if (letterMatch) {
    const letter = letterMatch[1].toUpperCase();
    const index = "АБВГ".indexOf(letter);
    if (index >= 0 && index < options.length) {
      userAnswer = options[index];
    }
  }

  // Check if answer text matches any option
  if (!userAnswer) {
    for (const opt of options) {
      if (userText.includes(opt.toLowerCase())) {
        userAnswer = opt;
        break;
      }
    }
  }

  // Step 3: Check correctness
  const isCorrect = userAnswer === correctAnswer;

  return {
    phase: "feedback",
    question: "",
    userAnswer,
    correctAnswer,
    explanation: isCorrect
      ? "Дұрыс! Жарайсың!"
      : `Дұрыс жауап: ${correctAnswer}`,
    isCorrect,
  };
}

// ---- Audio Recording Utilities ----

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.chunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.mediaRecorder.start(100); // Collect 100ms chunks
  }

  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(new Blob());
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: "audio/webm" });
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.mediaRecorder = null;
  }
}

// ---- Voice Commands ----

export interface VoiceCommand {
  command: string;
  action: () => void;
}

export function parseVoiceCommand(text: string): string {
  const t = text.toLowerCase().trim();

  // Navigation commands
  if (t.includes("тест") || t.includes("quiz")) return "NAV_TESTS";
  if (t.includes("жетіс") || t.includes("ачив")) return "NAV_ACHIEVEMENTS";
  if (t.includes("профил")) return "NAV_PROFILE";
  if (t.includes("рейтинг")) return "NAV_RATING";
  if (t.includes("жаттығу") || t.includes("тренировка"))
    return "NAV_PRACTICE";

  // Quiz commands
  if (t.includes("баста") || t.includes("старт")) return "QUIZ_START";
  if (t.includes("тоқтат") || t.includes("стоп")) return "QUIZ_STOP";
  if (t.includes("келесі") || t.includes("следующий"))
    return "QUIZ_NEXT";
  if (t.includes("алдыңғы") || t.includes("предыдущий"))
    return "QUIZ_PREV";

  // Help
  if (t.includes("көмек") || t.includes("помощь")) return "HELP";

  return "UNKNOWN";
}
