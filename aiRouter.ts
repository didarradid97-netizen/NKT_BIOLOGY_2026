// ============================================
// 🧠 UNIFIED AI BRAIN — AI Router System
// 1 entry point → smart model selection
// ============================================

export type AIModel = "grok" | "gemini" | "whisper";
export type AITask = "fast" | "deep" | "voice" | "generate" | "analyze";

interface RouterConfig {
  model: AIModel;
  endpoint: string;
  maxTokens: number;
  temperature: number;
}

const ROUTER_CONFIG: Record<AITask, RouterConfig> = {
  fast: {
    model: "gemini",
    endpoint: "/api/fast",
    maxTokens: 256,
    temperature: 0.3,
  },
  deep: {
    model: "grok",
    endpoint: "/api/chat",
    maxTokens: 2048,
    temperature: 0.7,
  },
  voice: {
    model: "whisper",
    endpoint: "/api/voice",
    maxTokens: 1024,
    temperature: 0.5,
  },
  generate: {
    model: "grok",
    endpoint: "/api/generate-tests",
    maxTokens: 4096,
    temperature: 0.8,
  },
  analyze: {
    model: "grok",
    endpoint: "/api/analyze",
    maxTokens: 2048,
    temperature: 0.6,
  },
};

export async function aiRequest(
  task: AITask,
  messages: { role: string; content: string }[],
  fallbackEnabled = true
): Promise<string> {
  const config = ROUTER_CONFIG[task];

  try {
    const res = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
    });

    if (!res.ok) {
      // Fallback to alternative model
      if (fallbackEnabled && config.model === "grok") {
        console.log("[AI Router] Groq fail → Gemini fallback");
        return geminiFallback(messages, config);
      }
      throw new Error(`AI ${config.model} error: ${res.status}`);
    }

    const data = await res.json();
    return data.response || data.choices?.[0]?.message?.content || "❌ Бос жауап";
  } catch (err) {
    console.error(`[AI Router] ${task} error:`, err);

    if (fallbackEnabled) {
      return localFallback(task, messages);
    }
    throw err;
  }
}

// Gemini Flash fallback
async function geminiFallback(
  messages: { role: string; content: string }[],
  config: RouterConfig
): Promise<string> {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature,
        },
      }),
    });

    const data = await res.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Gemini fallback тежелді"
    );
  } catch {
    return localFallback("deep", messages);
  }
}

// Local knowledge base fallback
function localFallback(
  task: AITask,
  messages: { role: string; content: string }[]
): string {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";

  // Biology knowledge base
  if (lastMsg.includes("митоз")) {
    return `📌 **Митоз** — соматикалық жасушалардың көбеюі:
• 4 фаза: профаза → метафаза → анафаза → телофаза
• Нәтиже: 2n→2n (хромосома саны өзгермейді)
• Кроссинговер: ЖОҚ
• Мақсаты: өсу, жөндеу`;
  }
  if (lastMsg.includes("мейоз")) {
    return `📌 **Мейоз** — жыныстық жасушалар түзілуі:
• 2 бөліну: мейоз I + мейоз II
• Нәтиже: 2n→n
• Кроссинговер: БАР (I профаза)
• Генетикалық әртүрлендіру көзі`;
  }
  if (lastMsg.includes("фотосинтез")) {
    return `📌 **Фотосинтез**:
• Формула: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
• Жарық фазасы: гранада, АТФ түзіледі
• Кальвин циклі: стромада`;
  }

  return `⚠️ AI offline. Локалды базадан жауап.\n\nСұрақ: "${lastMsg.slice(0, 100)}..."`;
}

// Quick task helpers
export const ai = {
  fast: (msg: string) =>
    aiRequest("fast", [
      { role: "system", content: "Қысқа, 2-3 сөйлемде жауап бер." },
      { role: "user", content: msg },
    ]),

  deep: (msg: string) =>
    aiRequest("deep", [
      {
        role: "system",
        content:
          "Сен — NKT BIOLOGY AI Coach. Терең, толық түсіндір. Мысалдар бер.",
      },
      { role: "user", content: msg },
    ]),

  analyze: (data: string) =>
    aiRequest("analyze", [
      {
        role: "system",
        content:
          "Сен — аналитик. Мұқият талдау жаса, кестелер бер, маңыздысын бөлекте.",
      },
      { role: "user", content: data },
    ]),

  generate: (topic: string, count: number = 5) =>
    aiRequest("generate", [
      {
        role: "system",
        content: `Сен — ҰБТ биология экспертісі. "${topic}" тақырыбынан ${count} тест сұрақ жаса. JSON форматында.`,
      },
      {
        role: "user",
        content: `Тақырып: ${topic}\nСан: ${count}\nТіл: қазақша\nФормат: [{"q":"","options":["","","",""],"correct":0,"explanation":""}]`,
      },
    ]),
};
