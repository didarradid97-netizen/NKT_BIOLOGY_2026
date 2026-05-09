// ============================================
// 📷 PHOTO QUIZ — Camera + OCR + AI Test Generator
// Tesseract.js + AI (Grok/Gemini)
// ============================================

import Tesseract from "tesseract.js";
import { ai } from "./aiRouter";

// ---- Camera Utilities ----

export async function startCamera(
  videoElement: HTMLVideoElement,
  facingMode: "user" | "environment" = "environment"
): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode },
    audio: false,
  });
  videoElement.srcObject = stream;
  await videoElement.play();
  return stream;
}

export function stopCamera(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export function capturePhoto(
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement
): string {
  const ctx = canvasElement.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;
  ctx.drawImage(videoElement, 0, 0);

  return canvasElement.toDataURL("image/jpeg", 0.9);
}

export function captureFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---- OCR (Tesseract.js) ----

export interface OCRResult {
  text: string;
  confidence: number;
  words: { text: string; confidence: number; bbox: any }[];
}

/**
 * Extract text from image using Tesseract.js
 * Runs entirely in browser (WebAssembly)
 */
export async function extractText(imageData: string): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(
      imageData,
      "rus+kaz", // Russian + Kazakh
      {
        logger: (m) => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`),
        errorHandler: (err) => console.warn("[OCR] warning:", err),
      }
    );

    const words = result.data.words.map((w) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox,
    }));

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words,
    };
  } catch (err) {
    console.error("OCR failed:", err);
    // Fallback: return empty with error
    return {
      text: "",
      confidence: 0,
      words: [],
    };
  }
}

/**
 * Quick OCR — less accurate but faster
 * Uses LSTM only, no legacy mode
 */
export async function extractTextFast(imageData: string): Promise<string> {
  const result = await Tesseract.recognize(imageData, "rus", {
    logger: () => {}, // silent
    tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
  });
  return result.data.text;
}

// ---- Smart Question Parser ----

export interface ParsedQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * Parse raw OCR text into structured question
 * Handles common formats from textbooks/exams
 */
export function parseQuestionText(rawText: string): ParsedQuestion | null {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 3) return null;

  // Try to find question (first substantial line)
  let question = "";
  let options: string[] = [];
  let correctIndex = 0;

  // Pattern 1: "1. Question text? A) opt1 B) opt2 C) opt3 D) opt4"
  const fullText = rawText;

  // Extract question (before first option)
  const optionMatch = fullText.match(/([A-D][\.\)])/i);
  if (optionMatch) {
    const idx = fullText.indexOf(optionMatch[0]);
    question = fullText.substring(0, idx).trim();

    // Extract options
    const optionRegex = /([A-D])[\.\)]\s*([^A-D\n]+)/gi;
    let match;
    while ((match = optionRegex.exec(fullText)) !== null) {
      options.push(match[2].trim());
    }
  }

  // Pattern 2: "Question? 1. option 2. option 3. option"
  if (options.length === 0) {
    const numOptions = lines.filter(
      (l) => /^\d+[\.\)]/.test(l) && l.length > 3
    );
    if (numOptions.length >= 2) {
      const firstOptionIdx = lines.findIndex((l) => /^\d+[\.\)]/.test(l));
      if (firstOptionIdx > 0) {
        question = lines.slice(0, firstOptionIdx).join(" ");
        options = numOptions.map((l) => l.replace(/^\d+[\.\)]\s*/, ""));
      }
    }
  }

  if (question && options.length >= 2) {
    return {
      question,
      options,
      correctIndex: 0, // User must specify
      explanation: "",
    };
  }

  return null;
}

// ---- AI Question Generator from Photo ----

/**
 * Send OCR text to AI to generate a proper question
 */
export async function generateQuestionFromPhoto(
  ocrText: string
): Promise<ParsedQuestion | null> {
  if (!ocrText || ocrText.length < 10) return null;

  const prompt = `Мәтінден биология сұрағын жаса:
"""
${ocrText}
"""

Формат:
- Сұрақ: (5 нұсқамен)
- А) ...
- Б) ...
- В) ...
- Г) ...
- Д) ...
- Дұрыс: (A/B/C/D/E)
- Түсіндірме: (неге дұрыс)`;

  try {
    const response = await ai.deep(prompt);
    return parseAIQuestionResponse(response);
  } catch {
    return null;
  }
}

function parseAIQuestionResponse(response: string): ParsedQuestion | null {
  const lines = response.split("\n").filter((l) => l.trim());

  let question = "";
  const options: string[] = [];
  let correctIndex = 0;
  let explanation = "";

  const optionMap: Record<string, number> = {
    А: 0, A: 0, Б: 1, B: 1, В: 2, C: 2, Г: 3, D: 3, Д: 4, E: 4,
  };

  let foundQuestion = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Question line
    if (!foundQuestion && (trimmed.includes("?") || trimmed.startsWith("Сұрақ"))) {
      question = trimmed.replace(/^Сұрақ[:\s]*/, "").trim();
      foundQuestion = true;
      continue;
    }

    // Options A-E
    const optMatch = trimmed.match(/^([A-EАБВГД])[\.\)\s]+(.+)/i);
    if (optMatch) {
      options.push(optMatch[2].trim());
      continue;
    }

    // Correct answer
    const correctMatch = trimmed.match(/Дұрыс[:\s]+([A-EАБВГД])/i);
    if (correctMatch) {
      const letter = correctMatch[1].toUpperCase();
      correctIndex = optionMap[letter] || 0;
      continue;
    }

    // Explanation
    if (trimmed.startsWith("Түсіндірме") || trimmed.startsWith("Неге")) {
      explanation = trimmed.replace(/^[^:]*[:\s]*/, "").trim();
    }
  }

  if (question && options.length >= 2) {
    return { question, options, correctIndex, explanation };
  }

  return null;
}

// ---- Photo Quiz State Management ----

export interface PhotoQuizState {
  phase: "camera" | "capturing" | "ocr" | "generating" | "review" | "quiz";
  photoData: string | null;
  ocrText: string;
  ocrConfidence: number;
  parsedQuestion: ParsedQuestion | null;
  aiQuestion: ParsedQuestion | null;
  error: string;
}

export function createInitialState(): PhotoQuizState {
  return {
    phase: "camera",
    photoData: null,
    ocrText: "",
    ocrConfidence: 0,
    parsedQuestion: null,
    aiQuestion: null,
    error: "",
  };
}
