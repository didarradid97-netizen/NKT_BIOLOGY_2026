// ============================================
// 🧠 MEMORY AI — Пайдаланушының әлсіз жерлерін есте сақтау
// ============================================

export interface WeakTopic {
  topic: string;
  wrongCount: number;
  lastWrongAt: string;
  totalAttempts: number;
}

const MEMORY_KEY = "bio_memory_ai";

export function getMemoryAI(): WeakTopic[] {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
  } catch { return []; }
}

export function recordWrongAnswer(topic: string): void {
  const memory = getMemoryAI();
  const existing = memory.find((m) => m.topic === topic);
  if (existing) {
    existing.wrongCount++;
    existing.totalAttempts++;
    existing.lastWrongAt = new Date().toISOString();
  } else {
    memory.push({
      topic,
      wrongCount: 1,
      totalAttempts: 1,
      lastWrongAt: new Date().toISOString(),
    });
  }
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

export function getWeakTopics(limit = 5): WeakTopic[] {
  return getMemoryAI()
    .sort((a, b) => b.wrongCount / b.totalAttempts - a.wrongCount / a.totalAttempts)
    .slice(0, limit);
}

export function getStrengthAnalysis(): { weak: string[]; strong: string[]; all: WeakTopic[] } {
  const all = getMemoryAI();
  const weak = all.filter((t) => t.wrongCount / t.totalAttempts > 0.4).map((t) => t.topic);
  const strong = all.filter((t) => t.wrongCount / t.totalAttempts < 0.2).map((t) => t.topic);
  return { weak, strong, all };
}
