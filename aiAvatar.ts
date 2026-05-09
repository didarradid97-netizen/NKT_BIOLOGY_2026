// ============================================
// 👤 AI AVATAR COACH — Personality Engine
// Қазақ/орыс тілінде, әр оқушыға сай стиль
// ============================================

export type AvatarPersonality = "coach" | "scientist" | "motivator" | "strict";

export interface AvatarState {
  personality: AvatarPersonality;
  mood: "happy" | "neutral" | "concerned" | "excited";
  lastMessage: string;
  energy: number; // 0-100
}

const PERSONALITIES: Record<AvatarPersonality, { name: string; emoji: string; greeting: string }> = {
  coach: {
    name: "Coach Arman",
    emoji: "🏋️",
    greeting: "Қайырлы күн! Бүгін де бірге жаттығамыз! 💪",
  },
  scientist: {
    name: "Профессор Айгүл",
    emoji: "👩‍🔬",
    greeting: "Ғылымға қош келдіңіз! Бүгін қызықты тақырыпты зерттейміз. 🧬",
  },
  motivator: {
    name: "Мотиватор Нұрлан",
    emoji: "🌟",
    greeting: "Сен мүмкіндіктеріңнің шегі жоқ екенін білесің бе? Жарайды, бастаймыз! 🔥",
  },
  strict: {
    name: "Мұғалім Қайрат",
    emoji: "📏",
    greeting: "Жұмыс басталды. Уақыт = алтын. Кідіріс жоқ. 📚",
  },
};

// ---- REACTIONS ----

export function getReaction(
  event: "correct" | "wrong" | "streak" | "level_up" | "struggling" | "idle",
  personality: AvatarPersonality
): string {
  const reactions: Record<AvatarPersonality, Record<string, string[]>> = {
    coach: {
      correct: ["Жақсы! 💪", "Дәл дәл! 👍", "Мынау workout сияқты! 🔥"],
      wrong: ["Қате! Қайтадан! 💪", "Жаттығу керек! 📚", "Мен сенің мықты екеніңді білемін!"],
      streak: ["🔥🔥🔥 Streak!", "Нере! 5 қатарынан! 💪", "Сен машинасың!"],
      level_up: ["Жаңа деңгей! 🎉", "Progress bar толды! 💪", "Келесі rank! 🏆"],
      struggling: ["Дем алып, қайтадан. 💪", "Барлығы бірден емес! 🌱", "Мен сенің жанындамын!"],
      idle: ["Қайта орал! 💪", "Жаттығуды жалғастырыңыз!", "Сен күте алмаймын! 😊"],
    },
    scientist: {
      correct: ["Дұрыс! Гипотеза расталды. ✅", "Деректер дұрыс. 📊", "Теория сақталды. 🧬"],
      wrong: ["Гипотеза қабылданбады. Қайта зерттеу керек. 🔬", "Қате дерек. Талдауды қайталау керек. 📚", "Бұл тәжірибедегі қате. Жаңа әдіспен көріңіз."],
      streak: ["Статистикалық ауытқу емес! 🎉", "Ғалымдардан гөрі мықтысың! 🧬", "PhD деңгейі! 👩‍🔬"],
      level_up: ["Жаңа зерттеу деңгейі! 🔬", "Білім индексі өсті! 📈", "Сапа сертификаты! ✅"],
      struggling: ["Бұл — зерттеу үрдісі. Қайта талдау керек. 🔬", "Барлық эксперимент сәтсіз бола бермейді. 🧪", "Деректерді басқаша қарап көріңіз."],
      idle: ["Зерттеу уақыты келді. ⏰", "Жаңа деректер күтуде. 📊", "Зертхана ашық. 🧪"],
    },
    motivator: {
      correct: ["Сенің ішінде жұлдыз бар! ⭐", "Тамаша! Сен өзгерудесің! 🔥", "Бұл сенің күнің! 🌟"],
      wrong: ["Қате — тек сабақ. Алға! 💪", "Сен жеңілмейсің! Тағы бір рет! 🌟", "Төмендеме! Сен мықтысың! 🔥"],
      streak: ["🔥🔥🔥 Бұл легенда!", "Сен шектен астың! 🌟", "Өзіңе сен! Сен кереметсің! ⭐"],
      level_up: ["Жаңа биіктер! 🏔️", "Сен мүмкіндіктеріңді таптың! 🌟", "Өмірің өзгеріп жатыр! 🔥"],
      struggling: ["Армандағаныңа сен! 🌟", "Әр қадам — жеңіс! 💪", "Сен жасайсың! Мен сенемін! ⭐"],
      idle: ["Сенің уақытың келді! 🔥", "Жарыққа шық! 🌟", "Бүгінгі күн сенік! 💪"],
    },
    strict: {
      correct: ["Дұрыс. Келесі. 📚", "Қабылданды. ✅", "Стандартқа сай. 📏"],
      wrong: ["Қате! Теорияны қайта оқы! 📚", "Бұл сабақ біткен жоқ! Келесі сұрақ!", "Үй тапсырмасы! 📖"],
      streak: ["Жақсы нәтиже. Бірақ тоқтама! 📏", "Стандарт жоғары! 📊", "Жеткіліксіз. 10 болуы керек! 📚"],
      level_up: ["Жаңа сынақ. 📚", "Тексеру аяқталды. Келесі. 📏", "Талап: 100%. ✅"],
      struggling: ["Көп уақыт өтті. Жұмыс! 📚", "Нәтиже төмен. Қосымша сабақ! 📖", "Түсінбеудің кешірімі жоқ!"],
      idle: ["Уақыт! ⏰", "Демалыс аяқталды! 📚", "Сабақ күтуде! 📏"],
    },
  };

  const options = reactions[personality]?.[event] || ["Жақсы!"];
  return options[Math.floor(Math.random() * options.length)];
}

// ---- GREETING ----

export function getGreeting(personality: AvatarPersonality, name: string): string {
  const hour = new Date().getHours();
  let timeGreeting = "Сәлем";
  if (hour < 6) timeGreeting = "Таң атып барады";
  else if (hour < 12) timeGreeting = "Қайырлы таң";
  else if (hour < 18) timeGreeting = "Қайырлы күн";
  else timeGreeting = "Қайырлы кеш";

  const p = PERSONALITIES[personality];
  return `${timeGreeting}, ${name}! ${p.greeting}`;
}

// ---- STUDY ADVICE ----

export function getStudyAdvice(personality: AvatarPersonality, weakTopics: string[]): string {
  if (weakTopics.length === 0) return "Барлық тақырыптарды меңгердіңіз! 🎉";

  const topic = weakTopics[0];
  const advice: Record<AvatarPersonality, string> = {
    coach: `"${topic}" тақырыбында жаттығу жасаймыз! 10 сұрақ, 15 минут. Дайынсың ба? 💪`,
    scientist: `"${topic}" тақырыбына ғылыми талдау жасаймыз. Теория + тәжірибе. 🔬`,
    motivator: `"${topic}" қиын көрінуі мүмкін, бірақ сен МҮМКІН! Бастаймыз! 🔥`,
    strict: `"${topic}". Теорияны оқы, 10 сұрақ шеш. Уақыт 15 минут. Баста! 📚`,
  };

  return advice[personality];
}

// ---- ANIMATION CONFIG ----

export function getAvatarAnimation(mood: AvatarState["mood"]): string {
  const animations: Record<string, string> = {
    happy: "animate-bounce",
    neutral: "",
    concerned: "animate-pulse",
    excited: "animate-bounce animate-pulse",
  };
  return animations[mood] || "";
}

export { PERSONALITIES };
