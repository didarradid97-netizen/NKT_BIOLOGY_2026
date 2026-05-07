// api/generate-tests.js — AI Test Generator API
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `Сен — NKT BIOLOGY платформасының AI тест генераторысың. Биология мәтінінен қазақша тест сұрақтары жасайсың.

Ережелер:
1. ҚАЗАҚША тест сұрақтары
2. Әр сұрақта 4 нұсқа (A, B, C, D)
3. Дұрыс жауапты белгіле (correctAnswer: 0/1/2/3)
4. Түсініктеме бер
5. ОЗП/ҰБТ деңгейінде

Формат — JSON массив:
[{"text":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]`;

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
    const { content, count = 10 } = req.body || {};
    if (!content || content.length < 20) {
      return res.status(400).json({ error: "content required (min 20 chars)" });
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
          { role: "user", content: `Мына мәтін бойынша ${count} тест жаса:\n\n${content.slice(0, 3000)}\n\nТЕК JSON форматында жауап бер, ешқандай қосымша мәтінсіз:` },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || `Groq error: ${response.status}` });
    }

    const raw = data.choices[0].message.content;
    // Парсим JSON из ответа
    let questions = [];
    try {
      // Пытаемся найти JSON массив в ответе
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(raw);
      }
    } catch {
      // Если не удалось распарсить, возвращаем raw для отладки
      return res.status(200).json({ questions: [], raw, error: "JSON parse failed" });
    }

    return res.status(200).json({ questions, count: questions.length });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal error" });
  }
};
