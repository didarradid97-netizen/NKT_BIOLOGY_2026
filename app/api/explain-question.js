// ============================================
// 🎓 EXPLAIN QUESTION API — Тест сұрағын түсіндіру
// ============================================
// Vercel Function: POST /api/explain-question

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
    const { question, options, correctAnswer } = req.body || {};
    if (!question || !options || correctAnswer === undefined) {
      return res.status(400).json({ error: "question, options, correctAnswer required" });
    }

    const prompt = `Сен — NKT BIOLOGY платформасының кәсіпқой биология оқытушысысың. Бұл тест сұрағын ТОЛЫҚТАЙ түсіндір.

Ережелер:
1. Қазақша жаз
2. Сұрақты не сұрайтынын түсіндір
3. Әр нұсқаны талда (неге дұрыс/қате)
4. Дұрыс жауапты неге сол екенін терең түсіндір
5. ОЗП/ҰБТ-да осындай сұрақ қалай кездесетінін айт
6. Ұқсас сұрақ мысал бер

Сұрақ: "${question}"
A) ${options[0] || "A"}
B) ${options[1] || "B"}
C) ${options[2] || "C"}
D) ${options[3] || "D"}
Дұрыс жауап: ${String.fromCharCode(65 + correctAnswer)} (${options[correctAnswer]})

ФОРМАТ:
📌 Сұрақ мазмұны: ...
🔍 Нұсқалар талдауы:
A) ... (қате/дұрыс, себебі...)
B) ...
C) ...
D) ...
✅ Дұрыс жауап түсіндірмесі: ...
🎯 Ұқсас сұрақ: ...
💡 Есте сақтау керектер: ...`;

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Сен — кәсіпқой биология оқытушысысың. Қазақша жаз. Тест сұрақтарын терең түсіндір." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message });
    }

    return res.status(200).json({
      explanation: data.choices[0].message.content,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
