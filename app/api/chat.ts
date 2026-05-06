// ============================================
// 🤖 AI CHAT API — Groq (llama-3.3-70b-versatile)
// ============================================
// Vercel Function: POST /api/chat

import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Биология системалық промпт (қазақша)
const SYSTEM_PROMPT = `Сен — NKT BIOLOGY платформасының AI жаттықтырушысысың. Қазақстандық оқушыларға ОЗП/ҰБТ биология пәніне дайындыққа көмектесесің.

Ережелер:
1. ТІЛ: Қазақша жауап бер (олы тілі). Терминдерді түсіндіріп бер.
2. ТАҚЫРЫПТАР: Клетка биологиясы, генетика, эволюция, экология, анатомия/физиология
3. ФОРМАТ: Қысқа, түсінікті, нөмірленген тізім. Мысалдар келтір.
4. ТЕСТ ФОРМАТЫ: Егер сұрақ тест түрінде болса, A/B/C/D нұсқаларымен және дұрыс жауаппен бер.
5. ОЗП: Сұрақтар ОЗП/ҰБТ деңгейінде болу керек.
6. Егер сұрақ басқа пән бойынша болса, сыпайы түрде биологияға бағытта.

Мысал жауап форматы:
- Түсініктеме: [қысқа]
- Негізгі ұғымдар: [3-4 нүкте]
- Мысал: [нақты мысал]
- Тест сұрағы: [есеп түрінде]`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured" });
  }

  const { messages, temperature = 0.7 } = req.body || {};

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array required" });
  }

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10), // соңғы 10 хабарламаны алу
        ],
        temperature,
        max_tokens: 2048,
        top_p: 0.9,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || `Groq API error: ${response.status}`,
      });
    }

    const content = data?.choices?.[0]?.message?.content || "";

    return res.status(200).json({
      response: content,
      model: "llama-3.3-70b-versatile",
      usage: data?.usage || {},
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
