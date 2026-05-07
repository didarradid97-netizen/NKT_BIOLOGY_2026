// api/chat.js — AI Chat API (чистый JS)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `Сен — NKT BIOLOGY платформасының AI жаттықтырушысысың. Қазақстандық оқушыларға ОЗП/ҰБТ биология пәніне дайындыққа көмектесесің.

Ережелер:
1. ТІЛ: Қазақша жауап бер
2. ТАҚЫРЫПТАР: Клетка, генетика, эволюция, экология, анатомия
3. ФОРМАТ: Қысқа, түсінікті, нөмірленген тізім
4. ОЗП деңгейінде`;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured in Vercel Environment Variables" });
  }

  try {
    const { messages, temperature = 0.7 } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

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
          ...messages.slice(-10),
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

    return res.status(200).json({
      response: data.choices[0].message.content,
      model: "llama-3.3-70b-versatile",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal error" });
  }
};
