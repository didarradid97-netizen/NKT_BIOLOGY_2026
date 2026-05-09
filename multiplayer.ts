// ============================================
// ⚔️ MULTIPLAYER BATTLE ENGINE
// Duel Mode + Group Battle + Matchmaking
// LocalStorage-based (server upgrade ready)
// ============================================

export interface BattlePlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  currentQuestion: number;
  answers: Record<number, number>;
  isReady: boolean;
  isAI: boolean;
  streak: number;
}

export interface BattleRoom {
  id: string;
  name: string;
  mode: "duel" | "group" | "team";
  players: BattlePlayer[];
  questions: BattleQuestion[];
  status: "waiting" | "starting" | "playing" | "finished";
  currentQuestion: number;
  timePerQuestion: number;
  createdAt: string;
  winner: string | null;
}

export interface BattleQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const STORAGE_KEY = "nkt_battle";

// ---- SAMPLE QUESTIONS (75 questions for battles) ----

const BATTLE_QUESTIONS: BattleQuestion[] = [
  { id: "bq1", text: "Митохондрия функциясы?", options: ["АТФ түзу", "Белок синтезі", "Фотосинтез", "ДНҚ репликациясы"], correctIndex: 0, explanation: "Митохондрия — энергетикалық станция" },
  { id: "bq2", text: "Фотосинтез формуласы?", options: ["6CO₂+6H₂O→C₆H₁₂O₆+6O₂", "C₆H₁₂O₆→6CO₂+6H₂O", "6O₂+6H₂O→6CO₂+C₆H₁₂O₆", "C₆H₁₂O₆+6O₂→6CO₂+6H₂O"], correctIndex: 0, explanation: "Фотосинтезде оттегі бөлінеді" },
  { id: "bq3", text: "ДНҚ спиралын ашқан?", options: ["Уотсон мен Крик", "Мендель", "Дарвин", "Линней"], correctIndex: 0, explanation: "1953 жылы ашылды" },
  { id: "bq4", text: "Мейоз нәтижесі?", options: ["4 гаплоидты жасуша", "2 диплоидты", "4 диплоидты", "2 гаплоидты"], correctIndex: 0, explanation: "Мейоз I және II нәтижесінде" },
  { id: "bq5", text: "Гликолиз қайда жүреді?", options: ["Цитоплазмада", "Митохондрияда", "Ядрода", "Гольджи аппаратында"], correctIndex: 0, explanation: "Гликолиз — цитоплазмалық процесс" },
  { id: "bq6", text: "Креатин фосфаты?", options: ["Бұлшықет энергиясы", "Белок", "Фермент", "Гормон"], correctIndex: 0, explanation: "Бұлшықет жұмысына энергия береді" },
  { id: "bq7", text: "Экзоцитоз?", options: ["Затты сыртқа шығару", "Затты іске алу", "Бөліну", "Сіңіру"], correctIndex: 0, explanation: "Везикула арқылы сыртқа шығару" },
  { id: "bq8", text: "Аннамия?", options: ["Қан аздығы", "Қан көптігі", "Жара", "Ісік"], correctIndex: 0, explanation: "Гемоглобин төмендеуі" },
  { id: "bq9", text: "Соматикалық жасуша?", options: ["Дене жасушасы", "Жыныс жасушасы", "Төбе жасуша", "Ісік жасуша"], correctIndex: 0, explanation: "Барлық дене жасушалары" },
  { id: "bq10", text: "Транскрипция нәтижесі?", options: ["мРНҚ", "тРНҚ", "рРНҚ", "ДНҚ"], correctIndex: 0, explanation: "ДНҚ-дан мРНҚ түзіледі" },
  { id: "bq11", text: "Полипептидті қандай РНҚ аударады?", options: ["тРНҚ", "мРНҚ", "рРНҚ", "миРНҚ"], correctIndex: 0, explanation: "Трансляция процесінде" },
  { id: "bq12", text: "Өсімдік клеткасында қандай пластидта ДНҚ бар?", options: ["Хлоропласт", "Лейкопласт", "Хромопласт", "Барлығында"], correctIndex: 3, explanation: "Барлық пластидтарда өз ДНҚ-ы бар" },
  { id: "bq13", text: "Клетка цикліндегі G1 фазасы?", options: ["Өсу фазасы", "ДНҚ репликациясы", "Бөліну", "Демалыс"], correctIndex: 0, explanation: "Клетка өсіп, органеллалар көбейеді" },
  { id: "bq14", text: "Апоптоз?", options: ["Бағдарлы өлім", "Некроз", "Ісік", "Мутация"], correctIndex: 0, explanation: "Бағдарлы клетка өлімі" },
  { id: "bq15", text: "Қандай витамин қан ұюына қатысады?", options: ["K", "C", "D", "A"], correctIndex: 0, explanation: "Витамин K протромбин синтезіне қатысады" },
  { id: "bq16", text: "Миозин белогы қайда табылады?", options: ["Бұлшықет", "Тері", "Сүйек", "Қан"], correctIndex: 0, explanation: "Бұлшықет жиырылуында" },
  { id: "bq17", text: "Эволюцияның қозғаушы күші?", options: ["Табиғи сұрыптау", "Мутация", "Ген ағымы", "Барлығы"], correctIndex: 3, explanation: "Барлық факторлар қатысады" },
  { id: "bq18", text: "Харди-Вайнберг теңдеуі?", options: ["p²+2pq+q²=1", "p+q=1", "p²+q²=1", "2pq=1"], correctIndex: 0, explanation: "Аллель жиіліктерінің теңдеуі" },
  { id: "bq19", text: "Симбиоздың типтері?", options: ["Мутуализм, комменсализм, паразитизм", "Тек мутуализм", "Тек паразитизм", "Предация, конкуренция"], correctIndex: 0, explanation: "Үш тип бар" },
  { id: "bq20", text: "Өсімдіктердегі транспирация?", options: ["Су булануы", "Газ алмасу", "Фотосинтез", "Минерал сіңіру"], correctIndex: 0, explanation: "Жапырақ арқылы су булануы" },
];

// ---- MATCHMAKING & ROOM MANAGEMENT ----

export function createRoom(name: string, mode: BattleRoom["mode"]): BattleRoom {
  const room: BattleRoom = {
    id: generateId(),
    name,
    mode,
    players: [],
    questions: shuffleArray([...BATTLE_QUESTIONS]).slice(0, 10),
    status: "waiting",
    currentQuestion: 0,
    timePerQuestion: 20,
    createdAt: new Date().toISOString(),
    winner: null,
  };

  saveRoom(room);
  return room;
}

export function joinRoom(roomId: string, playerName: string): BattleRoom | null {
  const room = getRoom(roomId);
  if (!room || room.status !== "waiting") return null;
  if (room.players.length >= (room.mode === "duel" ? 2 : 6)) return null;

  const player: BattlePlayer = {
    id: generateId(),
    name: playerName,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerName}`,
    score: 0,
    currentQuestion: 0,
    answers: {},
    isReady: false,
    isAI: false,
    streak: 0,
  };

  room.players.push(player);
  saveRoom(room);
  return room;
}

export function addAIPlayer(roomId: string): BattleRoom | null {
  const room = getRoom(roomId);
  if (!room || room.status !== "waiting") return null;

  const aiNames = ["AI-Мендель", "AI-Дарвин", "AI-Пастер", "AI-Вагнер", "AI-Кюри"];
  const aiName = aiNames[Math.floor(Math.random() * aiNames.length)];

  const aiPlayer: BattlePlayer = {
    id: generateId(),
    name: aiName,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${aiName}`,
    score: 0,
    currentQuestion: 0,
    answers: {},
    isReady: true,
    isAI: true,
    streak: 0,
  };

  room.players.push(aiPlayer);
  saveRoom(room);
  return room;
}

export function setReady(roomId: string, playerId: string): BattleRoom | null {
  const room = getRoom(roomId);
  if (!room) return null;

  const player = room.players.find((p) => p.id === playerId);
  if (player) player.isReady = true;

  // Auto-start if all ready
  if (room.players.length >= 2 && room.players.every((p) => p.isReady)) {
    room.status = "starting";
    setTimeout(() => {
      const r = getRoom(roomId);
      if (r) {
        r.status = "playing";
        saveRoom(r);
      }
    }, 3000);
  }

  saveRoom(room);
  return room;
}

export function submitAnswer(
  roomId: string,
  playerId: string,
  questionIdx: number,
  answerIdx: number
): BattleRoom | null {
  const room = getRoom(roomId);
  if (!room || room.status !== "playing") return null;

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  const q = room.questions[questionIdx];
  if (!q) return null;

  // Already answered this question
  if (player.answers[questionIdx] !== undefined) return room;

  player.answers[questionIdx] = answerIdx;

  if (answerIdx === q.correctIndex) {
    const timeBonus = 1; // Could calculate from time remaining
    const streakBonus = player.streak >= 2 ? 2 : 1;
    player.score += 10 * timeBonus * streakBonus;
    player.streak += 1;
  } else {
    player.streak = 0;
  }

  player.currentQuestion = questionIdx + 1;

  // Check if all players answered or moved to next
  const allAnswered = room.players.every(
    (p) => p.answers[questionIdx] !== undefined
  );

  if (allAnswered) {
    room.currentQuestion = questionIdx + 1;

    // Check if battle finished
    if (room.currentQuestion >= room.questions.length) {
      room.status = "finished";
      // Find winner
      const winner = room.players.reduce((a, b) =>
        a.score > b.score ? a : b
      );
      room.winner = winner.name;
    }
  }

  saveRoom(room);
  return room;
}

// ---- AI PLAYER LOGIC ----

export function processAITurn(roomId: string): void {
  const room = getRoom(roomId);
  if (!room || room.status !== "playing") return;

  const currentQ = room.currentQuestion;
  if (currentQ >= room.questions.length) return;

  room.players.forEach((player) => {
    if (!player.isAI) return;
    if (player.answers[currentQ] !== undefined) return;

    // AI accuracy based on difficulty
    const accuracy = 0.7; // 70% correct
    const isCorrect = Math.random() < accuracy;

    if (isCorrect) {
      submitAnswer(roomId, player.id, currentQ, room.questions[currentQ].correctIndex);
    } else {
      // Random wrong answer
      const wrongOptions = room.questions[currentQ].options
        .map((_, i) => i)
        .filter((i) => i !== room.questions[currentQ].correctIndex);
      const randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
      submitAnswer(roomId, player.id, currentQ, randomWrong);
    }
  });
}

// ---- STORAGE ----

function getRoom(roomId: string): BattleRoom | null {
  try {
    const rooms: Record<string, BattleRoom> = JSON.parse(
      localStorage.getItem(STORAGE_KEY + "_rooms") || "{}"
    );
    return rooms[roomId] || null;
  } catch {
    return null;
  }
}

function saveRoom(room: BattleRoom): void {
  const rooms: Record<string, BattleRoom> = JSON.parse(
    localStorage.getItem(STORAGE_KEY + "_rooms") || "{}"
  );
  rooms[room.id] = room;
  localStorage.setItem(STORAGE_KEY + "_rooms", JSON.stringify(rooms));
}

export function getAllRooms(): BattleRoom[] {
  try {
    const rooms: Record<string, BattleRoom> = JSON.parse(
      localStorage.getItem(STORAGE_KEY + "_rooms") || "{}"
    );
    return Object.values(rooms).filter((r) => r.status === "waiting");
  } catch {
    return [];
  }
}

export function deleteRoom(roomId: string): void {
  const rooms: Record<string, BattleRoom> = JSON.parse(
    localStorage.getItem(STORAGE_KEY + "_rooms") || "{}"
  );
  delete rooms[roomId];
  localStorage.setItem(STORAGE_KEY + "_rooms", JSON.stringify(rooms));
}

// ---- UTILS ----

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---- LEADERBOARD ----

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  avatar: string;
  xp: number;
  wins: number;
  totalBattles: number;
  streak: number;
  rank: string;
  league: string;
}

const RANKS = [
  { name: "Бронза", minXP: 0, color: "#cd7f32" },
  { name: "Күміс", minXP: 500, color: "#c0c0c0" },
  { name: "Алтын", minXP: 1500, color: "#ffd700" },
  { name: "Платина", minXP: 3000, color: "#e5e4e2" },
  { name: "Алмаз", minXP: 5000, color: "#b9f2ff" },
  { name: "Мастер", minXP: 8000, color: "#ff6b6b" },
  { name: "Грандмастер", minXP: 12000, color: "#ff8e53" },
  { name: "Легенда", minXP: 20000, color: "#a855f7" },
];

const LEAGUES = [
  { name: "Жасыл лига", min: 0 },
  { name: "Көк лига", min: 1000 },
  { name: "Қызыл лига", min: 3000 },
  { name: "Алтын лига", min: 6000 },
  { name: "Чемпиондар лигасы", min: 10000 },
];

export function getRank(xp: number): (typeof RANKS)[0] {
  return [...RANKS].reverse().find((r) => xp >= r.minXP) || RANKS[0];
}

export function getLeague(xp: number): (typeof LEAGUES)[0] {
  return [...LEAGUES].reverse().find((l) => xp >= l.min) || LEAGUES[0];
}

export function addBattleResult(
  playerId: string,
  playerName: string,
  won: boolean,
  score: number
): void {
  const key = STORAGE_KEY + "_leaderboard";
  const board: Record<string, LeaderboardEntry> = JSON.parse(
    localStorage.getItem(key) || "{}"
  );

  const entry = board[playerId] || {
    playerId,
    name: playerName,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerName}`,
    xp: 0,
    wins: 0,
    totalBattles: 0,
    streak: 0,
    rank: "Бронза",
    league: "Жасыл лига",
  };

  entry.xp += score + (won ? 50 : 10);
  entry.totalBattles += 1;
  if (won) {
    entry.wins += 1;
    entry.streak += 1;
  } else {
    entry.streak = 0;
  }

  const rank = getRank(entry.xp);
  const league = getLeague(entry.xp);
  entry.rank = rank.name;
  entry.league = league.name;

  board[playerId] = entry;
  localStorage.setItem(key, JSON.stringify(board));
}

export function getLeaderboard(): LeaderboardEntry[] {
  const board: Record<string, LeaderboardEntry> = JSON.parse(
    localStorage.getItem(STORAGE_KEY + "_leaderboard") || "{}"
  );
  return Object.values(board).sort((a, b) => b.xp - a.xp);
}

export { RANKS, LEAGUES };
