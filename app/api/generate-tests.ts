// ============================================
// 🤖 AI TEST GENERATOR API — Groq
// ============================================
// Vercel Function: POST /api/generate-tests

import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `Сен — NKT BIOLOGY платформасының AI тест генераторысың. Биология мәтінінен тест сұрақтары жасайсың.

Ережелер:
1. ҚАЗАҚША тест сұрақтары
2. Әр сұрақта 4 нұсқа (A, B, C, D)
3. Дұрыс жауапты белгіле
4. Түсініктеме бер
5. ОЗП/ҰБТ деңгейінде қиындық
6. Формат ТІЗІМ түрінде:

Сұрақ 1: [сұрақ мәтіні]
A) [нұсқа]
B) [нұсқа]
C) [нұсқа]
D) [нұсқа]
Дұрыс: [A/B/C/D]
Түсініктеме: [неге дұрыс]`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured" });
  }

  const { content, count = 10 } = req.body || {};

  if (!content || typeof content !== "string" || content.length < 20) {
    return res.status(400).json({ error: "content required (min 20 chars)" });
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
          {
            role: "user",
            content: `Мына мәтін бойынша ${count} тест сұрағы жаса:\n\n${content.slice(0, 3000)}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 4096,
        top_p: 0.9,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || `Groq API error: ${response.status}`,
      });
    }

    const raw = data?.choices?.[0]?.message?.content || "";

    // Парсинг сұрақтар
    const questions = parseQuestions(raw);

    return res.status(200).json({
      questions,
      raw,
      count: questions.length,
      model: "llama-3.3-70b-versatile",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}

function parseQuestions(raw: string) {
  const questions: any[] = [];
  const blocks = raw.split(/Сұрақ\s*\d+|Вопрос\s*\d+|Question\s*\d+/).filter(Boolean);

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (block.length < 20) continue;

    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 6) continue;

    const text = lines[0];
    const options: string[] = [];
    let correctAnswer = 0;
    let explanation = "";

    for (const line of lines) {
      const optMatch = line.match(/^([A-D])\s*[).:]\s*(.+)/);
      if (optMatch) {
        options.push(optMatch[2]);
      }
      const correctMatch = line.match(/Дұрыс\s*[:.]\s*([A-D])/i);
      if (correctMatch) {
        correctAnswer = correctMatch[1].charCodeAt(0) - 65;
      }
      const explMatch = line.match(/Түсініктеме\s*[:.]\s*(.+)/i);
      if (explMatch) {
        explanation = explMatch[1];
      }
    }

    if (text && options.length >= 2) {
      // 4 нұсқаға толықтыру
      while (options.length < 4) options.push(`Нұсқа ${options.length + 1}`);
      questions.push({
        id: `ai_${i}`,
        text,
        options: options.slice(0, 4),
        correctAnswer: Math.max(0, Math.min(3, correctAnswer)),
        explanation: explanation || "AI генерациясы",
      });
    }
  }

  return questions;
}
