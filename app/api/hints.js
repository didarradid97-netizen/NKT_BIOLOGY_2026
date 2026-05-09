// ============================================
// 💡 AI HINTS API — КӘСІПТІ ПОДСКАЗКАЛАР
// ============================================
// Vercel Function: POST /api/hints

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured" });
  }

  try {
    const { question, options, hintType = "mini" } = req.body || {};
    if (!question || !options) {
      return res.status(400).json({ error: "question and options required" });
    }

    const systemPrompt = `Сен — NKT BIOLOGY платформасының кәсіпқой AI көмекшісің. Тест сұрақтары бойынша подсказкалар бересің.

Ережелер:
1. Қазақша жаз
2. Бірден жауапты айтпа — жардам бер
3. Қадамдап түсіндір
4. Тақырыпқа байланысты негізгі ұғымдарды еске түсір
5. Ұқсас мысал келтір
6. ОЗП стилінде`;

    const prompt = hintType === "mini"
      ? `ЖЕҢІЛ ПОДСКАЗҚА бер (бірден жауап көрсетпе). Сұрақ: "${question}". Нұсқалар: ${options.join(", ")}. 2-3 сөйлеммен көмектес.`
      : `ТОЛЫҚ ЖАРДАМ БЕР. Сұрақ: "${question}". Нұсқалар: ${options.join(", ")}. Дұрыс жауапты неге сол екенін түсіндір. Негізгі ұғымдарды түсіндір.`;

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message });
    }

    return res.status(200).json({
      hint: data.choices[0].message.content,
      type: hintType,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
