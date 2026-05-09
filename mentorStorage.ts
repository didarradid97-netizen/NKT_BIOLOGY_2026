// ============================================
// 🤖 AI MENTOR — Келбет, Explain Like, Motivation
// ============================================

export type MentorType = "strict" | "friend" | "coach" | "meme";
export type ExplainMode = "child" | "student" | "meme" | "short" | "hardcore";

export interface MentorSettings {
  type: MentorType;
  explainMode: ExplainMode;
  motivationEnabled: boolean;
  voiceEnabled: boolean;
}

const MENTOR_KEY = "bio_mentor_settings";

export const MENTOR_PROMPTS: Record<MentorType, string> = {
  strict: "Сен — қатал мұғалімсің. Қысқа, нақты, талапшыл тілде сөйле. Қателерді қатаң сөгіп, дұрысын дәлелде. Оқушыны басқару керек.",
  friend: "Сен — дос сияқтысың. Жеңіл, түсінікті, әзіл-қалжыңмен сөйле. Оқушыны қолдап, 'болады, қағып алдық' деп мотивта.",
  coach: "Сен — мотивациялық коучсың. 'Сен мынаны істей аласың!', 'Кел, тағы бір көреміз!' деп отырасың. Спорттық энергия бер.",
  meme: "Сен — Gen Z мем-сүйер AI-сың. 'Бро', 'кринж', 'вайб', 'ризз' сияқты сөздерді қолдан. Тіксок форматында түсіндір. Қысқа, punchline-мен.",
};

export const EXPLAIN_PROMPTS: Record<ExplainMode, string> = {
  child: "5 жасар балаға түсіндір. 'Жасуша дегеніміз — кішкентай үй, онда жиһаздар (митохондрия) тұрады'. Төменгі деңгейде.",
  student: "Студентке түсіндір. Терминдерді қолдан, бірақ қарапайымдап. Салыстыру, мысалдар бер.",
  meme: "Мем форматында түсіндір. 'Чел не пон' сияқты формат. Скриншотқа лайық қысқа мәтін. Gen Z тілі.",
  short: "30 секундтық түсіндірме. Тек маңыздысы. Bullet points. Көп мәтін жазба.",
  hardcore: "Глубоко, терең, PhD деңгейінде. Химиялық формулалар, генетикалық механизмдер, эволюциялық теориялар. Академиялық стиль.",
};

export function getMentorSettings(): MentorSettings {
  try {
    const saved = localStorage.getItem(MENTOR_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  const defaults: MentorSettings = {
    type: "coach",
    explainMode: "student",
    motivationEnabled: true,
    voiceEnabled: false,
  };
  localStorage.setItem(MENTOR_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveMentorSettings(settings: MentorSettings): void {
  localStorage.setItem(MENTOR_KEY, JSON.stringify(settings));
}

export function getMentorSystemPrompt(): string {
  const s = getMentorSettings();
  const base = MENTOR_PROMPTS[s.type];
  const explain = EXPLAIN_PROMPTS[s.explainMode];
  return `${base}\n\nТҮСІНДІРУ СТИЛІ:\n${explain}\n\nЕгер мотивация қосулы болса, әр жауап соңында қысқа мотивациялық сөйлем жаз.`;
}

export function getMotivationMessage(score: number, total: number, streak: number): string {
  const pct = (score / total) * 100;
  if (pct >= 90) return "🔥 Тамаша! Сен биология гроссмейстерісің!";
  if (pct >= 70) return "💪 Өте жақсы! Осылай жалғастыр, НКТ-ны алатын шығарсың!";
  if (pct >= 50) return "👍 Жақсы! Бірақ тағы да үйрену керек — сенің мүмкіндігің бар!";
  if (pct >= 30) return "📚 Қайта тырысыңыз. Қателер — үйренудің бөлігі. Бұл сені мықты етеді!";
  if (streak >= 7) return "🌟 7 күн streak! Сенің төзімділігің қатты ұнайды!";
  return "💡 Сен осылай жалғастырсаң, барлық қателерді жеңесің. Бастысы — тоқтама!";
}
