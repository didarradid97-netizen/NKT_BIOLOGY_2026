// ============================================
// 💡 AI TEST HINTS API — Тест подсказкалары
// ============================================
// Vercel Function: POST /api/hints
// Тест тапшырууда AI подсказка берет

import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured" });
  }

  const { question, options, hintType = "full" } = req.body || {};

  if (!question || !options) {
    return res.status(400).json({ error: "question and options required" });
  }

  const prompt = hintType === "mini"
    ? `ЖАЛПЫ ПОДСКАЗКА бер (бірден жауап көрсетпе). Сұрақ: "${question}". Нұсқалар: ${options.join(", ")}. 1-2 сөйлем менен жардам бер.`
    : `СҰРАҚ ЖАУАП БЕРУГЕ ЖАРДАМ БЕР. Сұрақ: "${question}". Нұсқалар: ${options.join(", ")}. Неге дұрыс жауап сол екенин түсіндір, бирок тікелей айтпай жардам бер.`;

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
          { role: "system", content: "Сен — биология тесттері бойынша AI көмекшісің. ОЗП/ҰБТ деңгейінде қысқа, пайдалы подсказкалар бересің. Қазақша жаз." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "Подсказка алу мүмкін болмады";

    return res.status(200).json({ hint: content, type: hintType });
  } catch (err: any) {
    return res.status(500).json({ error: err.message, hint: "Қате орын алды. Қайта байқап көріңіз." });
  }
}
