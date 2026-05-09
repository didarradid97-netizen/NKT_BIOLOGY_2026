// ============================================
// 🎮 ГЕЙМИФИКАЦИЯ ЖҮЙЕСІ (XP, Level, Streak, Жетістіктер)
// ============================================

const GAMIFY_KEY = "bio_gamify";

export interface GamifyState {
  xp: number;
  level: number;
  streak: number;
  lastVisit: string;
  maxStreak: number;
  achievements: string[];
  testsCompleted: number;
  questionsCorrect: number;
}

function getDefaultState(): GamifyState {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastVisit: "",
    maxStreak: 0,
    achievements: [],
    testsCompleted: 0,
    questionsCorrect: 0,
  };
}

export function getGamifyState(): GamifyState {
  try {
    const raw = localStorage.getItem(GAMIFY_KEY);
    return raw ? JSON.parse(raw) : getDefaultState();
  } catch {
    return getDefaultState();
  }
}

export function saveGamifyState(state: GamifyState) {
  localStorage.setItem(GAMIFY_KEY, JSON.stringify(state));
}

// XP қосу (әр тест +50, әр дұрыс жауап +5)
export function addXP(amount: number): { state: GamifyState; leveledUp: boolean } {
  const state = getGamifyState();
  const oldLevel = state.level;
  state.xp += amount;
  state.level = calculateLevel(state.xp);
  saveGamifyState(state);
  return { state, leveledUp: state.level > oldLevel };
}

function calculateLevel(xp: number): number {
  // Level = sqrt(xp / 100) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}

// Streak тексеру (күн сайын кіру)
export function checkStreak(): GamifyState {
  const state = getGamifyState();
  const today = new Date().toDateString();
  const last = state.lastVisit;

  if (last === today) return state; // Бүгін қазірден кірді

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (last === yesterday.toDateString()) {
    state.streak += 1;
  } else if (last) {
    state.streak = 1; // Streak үзілді
  } else {
    state.streak = 1; // Бірінші кіру
  }

  state.lastVisit = today;
  if (state.streak > state.maxStreak) state.maxStreak = state.streak;

  saveGamifyState(state);
  return state;
}

// Жетістіктер тексеру
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (s: GamifyState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_test", title: "Бірінші қадам", description: "Бірінші тест тапсыр", icon: "🎯", condition: (s) => s.testsCompleted >= 1 },
  { id: "ten_tests", title: "Тест құмары", description: "10 тест тапсыр", icon: "📚", condition: (s) => s.testsCompleted >= 10 },
  { id: "fifty_tests", title: "Мастер", description: "50 тест тапсыр", icon: "🏆", condition: (s) => s.testsCompleted >= 50 },
  { id: "streak_3", title: "Тұрақты", description: "3 күн streak", icon: "🔥", condition: (s) => s.streak >= 3 },
  { id: "streak_7", title: "Жігіт", description: "7 күн streak", icon: "🔥🔥", condition: (s) => s.streak >= 7 },
  { id: "streak_30", title: "Легенда", description: "30 күн streak", icon: "🔥🔥🔥", condition: (s) => s.streak >= 30 },
  { id: "perfect_score", title: "Кемел", description: "Бір тесттен 100% ал", icon: "💎", condition: (s) => false }, // test-specific
  { id: "level_10", title: "Профи", description: "10 деңгейге жет", icon: "⭐", condition: (s) => s.level >= 10 },
  { id: "level_25", title: "Эксперт", description: "25 деңгейге жет", icon: "🌟", condition: (s) => s.level >= 25 },
  { id: "questions_100", title: "Білгір", description: "100 дұрыс жауап", icon: "🧠", condition: (s) => s.questionsCorrect >= 100 },
];

export function checkAchievements(): { newAchievements: Achievement[]; state: GamifyState } {
  const state = getGamifyState();
  const newAchievements: Achievement[] = [];

  ACHIEVEMENTS.forEach((ach) => {
    if (!state.achievements.includes(ach.id) && ach.condition(state)) {
      state.achievements.push(ach.id);
      newAchievements.push(ach);
    }
  });

  saveGamifyState(state);
  return { newAchievements, state };
}

// Тест тапсырған кезде шақыру
export function onTestCompleted(score: number, correctCount: number, totalCount: number): { xpGained: number; leveledUp: boolean; newAchievements: Achievement[] } {
  const state = getGamifyState();
  state.testsCompleted += 1;
  state.questionsCorrect += correctCount;

  let xp = 50; // Базовый XP за тест
  xp += correctCount * 5; // +5 за правильный ответ
  if (score >= 90) xp += 25; // Бонус за отличный балл
  if (score === 100) xp += 50; // Бонус за идеал

  saveGamifyState(state);
  const { leveledUp } = addXP(xp);
  const { newAchievements } = checkAchievements();

  return { xpGained: xp, leveledUp, newAchievements };
}
