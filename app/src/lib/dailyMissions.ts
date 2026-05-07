// ============================================
// 🎁 DAILY MISSIONS + 1 Minute Biology
// ============================================

export interface DailyMission {
  id: string;
  title: string;
  completed: boolean;
  type: "test" | "streak" | "topic" | "scan" | "voice";
  reward: number;
}

export interface DailyState {
  date: string;
  missions: DailyMission[];
  streak: number;
  lastCompleted: string;
  todayFact: string;
  todayFactRead: boolean;
}

const DAILY_KEY = "bio_daily_hub";

const FACTS = [
  "Митохондрия — жасушаның 'энергетикалық станциясы', АТФ түзіледі.",
  "Фотосинтез: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Хлоропластта жүреді.",
  "ДНҚ екі тізбектен тұрады: A-T, G-C жұптары байланысады.",
  "Митоз — соматикалық жасушалар көбеюі: 2n→2n. 4 фаза бар.",
  "Мейоз — жыныстық жасушалар түзілуі: 2n→n. Кроссинговер болады.",
  "Эволюцияның басты қозғаушы күші — табиғи сұрыпталу (Дарвин).",
  "Экожүйеде энергия 10% заңымен тасымалданады (Линдеман).",
  "Қан құрамы: плазма + формал элементтер (Эритроцит, Лейкоцит, Тромбоцит).",
  "Атмосферадағы оттегі 21%-ын өсімдіктер фотосинтез арқылы береді.",
  "Вирус — өздігінен көбейе алмайтын неклеткалық паразит.",
  "Генетикалық код: 3 нуклеотид = 1 амин қышқылы (триплеттік).",
  "Энзим — биокатализатор, пісіру температурада бұзылады (денатурация).",
  "Тамыр қысымы өлшеу: 120/80 — норма. Жоғары = гипертония.",
  "Хлоропласттағы пигменттер: хлорофилл a, хлорофилл b, каротиноидтар.",
  "Бүйрек сүзгіші: күніне ~180 литр қан сүзіледі, 1.5 л несап түзіледі.",
];

export function getDailyState(): DailyState {
  const today = new Date().toISOString().split("T")[0];
  try {
    const saved: DailyState = JSON.parse(localStorage.getItem(DAILY_KEY) || "null");
    if (saved && saved.date === today) return saved;
  } catch { /* ignore */ }

  // Жаңа күн — жаңа миссиялар
  const randomFact = FACTS[Math.floor(Math.random() * FACTS.length)];
  const missions: DailyMission[] = [
    { id: "m1", title: "10 сұрақ шеш", completed: false, type: "test", reward: 10 },
    { id: "m2", title: "3 күн streak сақта", completed: false, type: "streak", reward: 20 },
    { id: "m3", title: "Генетика тақырыбынан тест", completed: false, type: "topic", reward: 15 },
    { id: "m4", title: "AI Cheat Sheet қолдан", completed: false, type: "scan", reward: 10 },
    { id: "m5", title: "Voice Teacher тыңда", completed: false, type: "voice", reward: 10 },
  ];

  // Streak логикасы
  let streak = 0;
  try {
    const prev: DailyState = JSON.parse(localStorage.getItem(DAILY_KEY) || "null");
    if (prev) {
      const prevDate = new Date(prev.date);
      const todayDate = new Date(today);
      const diff = Math.floor((todayDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) streak = prev.streak + 1;
      else if (diff === 0) streak = prev.streak;
      else streak = 0;
    }
  } catch { /* ignore */ }

  const state: DailyState = {
    date: today,
    missions,
    streak,
    lastCompleted: "",
    todayFact: randomFact,
    todayFactRead: false,
  };
  localStorage.setItem(DAILY_KEY, JSON.stringify(state));
  return state;
}

export function completeMission(missionId: string): void {
  const state = getDailyState();
  const mission = state.missions.find((m) => m.id === missionId);
  if (mission && !mission.completed) {
    mission.completed = true;
    state.lastCompleted = new Date().toISOString();
    // XP арттыру (Gamification интеграциясы)
    try {
      const gamification = JSON.parse(localStorage.getItem("bio_gamification") || "null");
      if (gamification) {
        gamification.xp = (gamification.xp || 0) + mission.reward;
        localStorage.setItem("bio_gamification", JSON.stringify(gamification));
      }
    } catch { /* ignore */ }
    localStorage.setItem(DAILY_KEY, JSON.stringify(state));
  }
}

export function markFactRead(): void {
  const state = getDailyState();
  state.todayFactRead = true;
  localStorage.setItem(DAILY_KEY, JSON.stringify(state));
}
