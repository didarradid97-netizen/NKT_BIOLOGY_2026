// ============================================
// 🧠 AI MEMORY SYSTEM — Unified AI Brain
// Сайттағы барлық AI компоненттерге бір Memory
// ============================================

export interface StudentProfile {
  id: string;
  name: string;
  avatar?: string;
  createdAt: string;
  totalTests: number;
  totalCorrect: number;
  averageScore: number;
  studyTimeMinutes: number;
  streak: number;
  lastActive: string;
}

export interface TopicSkill {
  topic: string;
  correct: number;
  total: number;
  lastTested: string;
}

export interface DailyPlan {
  date: string;
  targetScore: number;
  tasks: PlanTask[];
  completed: string[];
}

export interface PlanTask {
  id: string;
  title: string;
  type: "test" | "theory" | "practice" | "review";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedMinutes: number;
}

const STORAGE_KEY = "nkt_ai_memory";

// ---- GETTERS ----

export function getStudentProfile(): StudentProfile {
  const stored = localStorage.getItem(STORAGE_KEY + "_profile");
  if (stored) return JSON.parse(stored);

  return {
    id: generateId(),
    name: "Оқушы",
    createdAt: new Date().toISOString(),
    totalTests: 0,
    totalCorrect: 0,
    averageScore: 0,
    studyTimeMinutes: 0,
    streak: 0,
    lastActive: new Date().toISOString(),
  };
}

export function getTopicSkills(): TopicSkill[] {
  const stored = localStorage.getItem(STORAGE_KEY + "_topics");
  return stored ? JSON.parse(stored) : [];
}

export function getWeakTopics(limit = 5): string[] {
  const topics = getTopicSkills();
  return topics
    .filter((t) => t.total > 0)
    .map((t) => ({ ...t, pct: t.correct / t.total }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, limit)
    .map((t) => t.topic);
}

export function getStrongTopics(limit = 5): string[] {
  const topics = getTopicSkills();
  return topics
    .filter((t) => t.total >= 3)
    .map((t) => ({ ...t, pct: t.correct / t.total }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, limit)
    .map((t) => t.topic);
}

export function getDailyPlan(): DailyPlan | null {
  const stored = localStorage.getItem(STORAGE_KEY + "_plan");
  if (!stored) return null;

  const plan: DailyPlan = JSON.parse(stored);
  const today = new Date().toISOString().split("T")[0];

  // Check if plan is for today
  if (plan.date === today) return plan;
  return null;
}

// ---- SETTERS ----

export function recordTestResult(
  topic: string,
  score: number,
  total: number,
  timeMinutes: number
): void {
  // Update profile
  const profile = getStudentProfile();
  profile.totalTests += 1;
  profile.totalCorrect += score;
  profile.averageScore = Math.round(
    (profile.totalCorrect / Math.max(profile.totalTests * total, 1)) * 100
  );
  profile.studyTimeMinutes += timeMinutes;
  profile.lastActive = new Date().toISOString();

  // Update streak
  const today = new Date().toISOString().split("T")[0];
  const lastDate = profile.lastActive.split("T")[0];
  const diff =
    (new Date(today).getTime() - new Date(lastDate).getTime()) /
    (1000 * 60 * 60 * 24);

  if (diff === 1) profile.streak += 1;
  else if (diff > 1) profile.streak = 1;

  localStorage.setItem(STORAGE_KEY + "_profile", JSON.stringify(profile));

  // Update topic skills
  const topics = getTopicSkills();
  const existing = topics.find((t) => t.topic === topic);

  if (existing) {
    existing.correct += score;
    existing.total += total;
    existing.lastTested = today;
  } else {
    topics.push({
      topic,
      correct: score,
      total,
      lastTested: today,
    });
  }

  localStorage.setItem(STORAGE_KEY + "_topics", JSON.stringify(topics));
}

export function generateDailyPlan(targetScore: number): DailyPlan {
  const weakTopics = getWeakTopics(3);
  const strongTopics = getStrongTopics(2);
  const today = new Date().toISOString().split("T")[0];

  const tasks: PlanTask[] = [];

  // Weak topics → practice
  weakTopics.forEach((topic, i) => {
    tasks.push({
      id: `w${i}`,
      title: `"${topic}" тақырыбынан тест тапсыру`,
      type: "test",
      topic,
      difficulty: "medium",
      estimatedMinutes: 20,
    });
    tasks.push({
      id: `wt${i}`,
      title: `"${topic}" — теория қайталау`,
      type: "theory",
      topic,
      difficulty: "easy",
      estimatedMinutes: 15,
    });
  });

  // Strong topics → review
  strongTopics.forEach((topic, i) => {
    tasks.push({
      id: `s${i}`,
      title: `"${topic}" — нығайту жаттығуы`,
      type: "practice",
      topic,
      difficulty: "hard",
      estimatedMinutes: 10,
    });
  });

  const plan: DailyPlan = {
    date: today,
    targetScore,
    tasks,
    completed: [],
  };

  localStorage.setItem(STORAGE_KEY + "_plan", JSON.stringify(plan));
  return plan;
}

export function completeTask(taskId: string): void {
  const plan = getDailyPlan();
  if (plan && !plan.completed.includes(taskId)) {
    plan.completed.push(taskId);
    localStorage.setItem(STORAGE_KEY + "_plan", JSON.stringify(plan));
  }
}

// ---- AI COACH PROMPT ----

export function getCoachContext(): string {
  const profile = getStudentProfile();
  const weak = getWeakTopics(5);
  const strong = getStrongTopics(5);

  return `ОҚУШЫ ПРОФИЛІ:
- Орташа балл: ${profile.averageScore}%
- Тест саны: ${profile.totalTests}
- Оқу уақыты: ${Math.floor(profile.studyTimeMinutes / 60)} сағат
- Streak: ${profile.streak} күн

ӘЛСІЗ ТАҚЫРЫПТАР: ${weak.join(", ") || "анаң белгісіз"}
МЫҚТЫ ТАҚЫРЫПТАР: ${strong.join(", ") || "анаң белгісіз"}

Бұл деректер негізінде жауап бер. Оқушының деңгейіне сай сөйле.`;
}

// ---- UTILS ----

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function exportMemory(): object {
  return {
    profile: getStudentProfile(),
    topics: getTopicSkills(),
    plan: getDailyPlan(),
  };
}

export function importMemory(data: object): void {
  const d = data as any;
  if (d.profile)
    localStorage.setItem(STORAGE_KEY + "_profile", JSON.stringify(d.profile));
  if (d.topics)
    localStorage.setItem(STORAGE_KEY + "_topics", JSON.stringify(d.topics));
  if (d.plan)
    localStorage.setItem(STORAGE_KEY + "_plan", JSON.stringify(d.plan));
}
