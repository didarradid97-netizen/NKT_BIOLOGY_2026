// ============================================
// 🏆 GLOBAL RATING — Қазақстан рейтингі (localStorage)
// ============================================

export interface RatingEntry {
  name: string;
  avatar: string;
  score: number;
  testsCompleted: number;
  streak: number;
  xp: number;
  lastActive: string;
}

const RATING_KEY = "bio_global_rating";
const MY_RATING_KEY = "bio_my_rating";

const MOCK_NAMES = [
  "Алдияр", "Бота", "Самат", "Динара", "Ерасыл", "Айым", "Нұржан",
  "Мадина", "Тимур", "Айгерим", "Дастан", "Сабина", "Амир", "Лязат",
];

function generateMockData(): RatingEntry[] {
  const entries: RatingEntry[] = MOCK_NAMES.map((name, i) => ({
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    score: 65 + Math.floor(Math.random() * 30),
    testsCompleted: 15 + Math.floor(Math.random() * 60),
    streak: Math.floor(Math.random() * 14),
    xp: 1000 + Math.floor(Math.random() * 5000),
    lastActive: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
  }));
  return entries.sort((a, b) => b.xp - a.xp);
}

export function getGlobalRating(): RatingEntry[] {
  try {
    const saved = localStorage.getItem(RATING_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  const mock = generateMockData();
  localStorage.setItem(RATING_KEY, JSON.stringify(mock));
  return mock;
}

export function getMyRating(): RatingEntry | null {
  try {
    return JSON.parse(localStorage.getItem(MY_RATING_KEY) || "null");
  } catch { return null; }
}

export function updateMyRating(name: string, score: number, testsCompleted: number, streak: number, xp: number): void {
  const myRating: RatingEntry = {
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    score,
    testsCompleted,
    streak,
    xp,
    lastActive: new Date().toISOString(),
  };
  localStorage.setItem(MY_RATING_KEY, JSON.stringify(myRating));

  // Global рейтингке қосу/жаңарту
  const global = getGlobalRating().filter((e) => e.name !== name);
  global.push(myRating);
  global.sort((a, b) => b.xp - a.xp);
  localStorage.setItem(RATING_KEY, JSON.stringify(global.slice(0, 100)));
}

export function getMyRank(): number {
  const my = getMyRating();
  if (!my) return 0;
  const global = getGlobalRating();
  const rank = global.findIndex((e) => e.name === my.name);
  return rank >= 0 ? rank + 1 : global.length + 1;
}
