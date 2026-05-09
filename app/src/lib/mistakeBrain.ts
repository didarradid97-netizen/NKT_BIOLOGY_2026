// ============================================
// 🧠 MISTAKE BRAIN — Мұқият талдау жүйесі
// әр қате = нейронға жол
// ============================================

export interface MistakeEntry {
  id: string;
  question: string;
  topic: string;
  mistakeType: MistakeType;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  source: string; // test ID
  createdAt: string;
  reviewCount: number;
  lastReviewed: string;
  confidence: number; // 0-100, how well learned
}

export type MistakeType =
  | "careless" // назар аудару (100-90 балл)
  | "partial" // жартылай білу (89-60)
  | "fundamental" // түсініксіз (<60)
  | "time_pressure" // уақыт аянысында
  | "trick_question"; // тұзақ сұрақ

const STORAGE_KEY = "nkt_mistake_brain";

// ---- ANALYZE ----

export function classifyMistake(
  scorePct: number,
  timeSec: number,
  totalTimeSec: number
): MistakeType {
  const timeRatio = timeSec / Math.max(totalTimeSec, 1);

  if (scorePct >= 90) return "careless";
  if (timeRatio < 0.2) return "time_pressure";
  if (scorePct >= 60) return "partial";
  return "fundamental";
}

export function getMistakeLabel(type: MistakeType): string {
  const labels: Record<MistakeType, string> = {
    careless: "🟢 Назар аудару қатесі",
    partial: "🟡 Жартылай білу",
    fundamental: "🔴 Терең түсінбеу",
    time_pressure: "⏱️ Уақыт қысымы",
    trick_question: "🎣 Тұзақ сұрақ",
  };
  return labels[type];
}

export function getMistakeAdvice(type: MistakeType): string {
  const advice: Record<MistakeType, string> = {
    careless:
      "Сіз тақырыпты білесіз, бірақ шешім қабылдауда асығыссыз. Сұрақты соңына дейін оқып, нұсқаларды салыстырыңыз.",
    partial:
      "Базалық түсінік бар, бірақ тереңірек үйрену керек. Теорияны қайта оқыңыз және қосымша мысал шешіңіз.",
    fundamental:
      "Бұл тақырып түсініксіз. Бастапқы концепциялардан бастаңыз: анықтамалар, формулалар, негізгі принциптер.",
    time_pressure:
      "Уақыт жетпей қалды. Жаттығу жасау арқылы шешу жылдамдығын арттырыңыз. Stressed Mode-та жаттығу жасаңыз.",
    trick_question:
      "Бұл сұрақта тұзақ бар. Ерекше нюанстарды анықтап, мұндай сұрақтар жинағын шешіңіз.",
  };
  return advice[type];
}

// ---- CRUD ----

export function addMistake(entry: Omit<MistakeEntry, "id" | "createdAt" | "reviewCount" | "lastReviewed" | "confidence">): MistakeEntry {
  const mistakes = getMistakes();

  const newEntry: MistakeEntry = {
    ...entry,
    id: generateId(),
    createdAt: new Date().toISOString(),
    reviewCount: 0,
    lastReviewed: new Date().toISOString(),
    confidence: 0,
  };

  mistakes.unshift(newEntry); // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes.slice(0, 500))); // max 500

  return newEntry;
}

export function getMistakes(): MistakeEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getMistakesByTopic(topic: string): MistakeEntry[] {
  return getMistakes().filter((m) => m.topic === topic);
}

export function getMistakesByType(type: MistakeType): MistakeEntry[] {
  return getMistakes().filter((m) => m.mistakeType === type);
}

export function getReviewQueue(limit = 10): MistakeEntry[] {
  return getMistakes()
    .filter((m) => m.confidence < 80)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, limit);
}

export function reviewMistake(id: string, correct: boolean): void {
  const mistakes = getMistakes();
  const m = mistakes.find((x) => x.id === id);
  if (!m) return;

  m.reviewCount += 1;
  m.lastReviewed = new Date().toISOString();

  if (correct) {
    m.confidence = Math.min(100, m.confidence + 25);
  } else {
    m.confidence = Math.max(0, m.confidence - 10);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
}

export function deleteMistake(id: string): void {
  const mistakes = getMistakes().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
}

// ---- STATS ----

export function getMistakeStats(): {
  total: number;
  byType: Record<MistakeType, number>;
  avgConfidence: number;
  needsReview: number;
} {
  const mistakes = getMistakes();
  const byType: Record<string, number> = {
    careless: 0,
    partial: 0,
    fundamental: 0,
    time_pressure: 0,
    trick_question: 0,
  };

  mistakes.forEach((m) => {
    byType[m.mistakeType] = (byType[m.mistakeType] || 0) + 1;
  });

  const avgConfidence =
    mistakes.length > 0
      ? Math.round(
          mistakes.reduce((s, m) => s + m.confidence, 0) / mistakes.length
        )
      : 0;

  return {
    total: mistakes.length,
    byType: byType as Record<MistakeType, number>,
    avgConfidence,
    needsReview: mistakes.filter((m) => m.confidence < 80).length,
  };
}

// ---- SPACED REPETITION ----

export function getSpacedRepetitionMistakes(): MistakeEntry[] {
  const now = Date.now();
  return getMistakes()
    .filter((m) => {
      if (m.confidence >= 100) return false;

      const lastReview = new Date(m.lastReviewed).getTime();
      const hoursSinceReview = (now - lastReview) / (1000 * 60 * 60);

      // Review intervals based on confidence
      const intervalHours =
        m.confidence < 25
          ? 2 // 2 hours
          : m.confidence < 50
          ? 12 // 12 hours
          : m.confidence < 75
          ? 48 // 2 days
          : 168; // 1 week

      return hoursSinceReview >= intervalHours;
    })
    .sort((a, b) => a.confidence - b.confidence);
}

// ---- UTILS ----

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function exportMistakes(): string {
  return JSON.stringify(getMistakes(), null, 2);
}

export function importMistakes(json: string): void {
  try {
    const data = JSON.parse(json);
    if (Array.isArray(data)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    console.error("Invalid mistake data");
  }
}
