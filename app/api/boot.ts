import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// ===========================
// 🤖 AI ENDPOINTS (ЖАҢА)
// ===========================

// Groq API Key
const GROQ_API_KEY = env.GROQ_API_KEY || process.env.GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// AI Chat - қазақша биология жаттықтырушысы
app.post("/api/ai/chat", async (c) => {
  try {
    if (!GROQ_API_KEY) {
      return c.json(
        { error: "GROQ_API_KEY орнатылмаған. .env файлына GROQ_API_KEY=gsk_... қосыңыз" },
        500
      );
    }

    const body = await c.req.json();
    const { messages, model = "llama-3.3-70b-versatile", temperature = 0.7 } = body;

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "messages массиві қажет" }, 400);
    }

    const systemMessage = {
      role: "system",
      content:
        "Сен қазақ тілінде сөйлейтін биология пәні мұғалімісің. Ата-ана: Нұрислам, сынып: 9. ОЗП (Орта білімге қабылдау) биологиядан дайындайсың. Жауаптарың қысқа, түсінікті және нақты болсын. Керек болғанда мысалдар келтір. Егер сұрақ басқа пәннен болса, сыпайы түрде биологияға бағытта.",
    };

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [systemMessage, ...messages],
        temperature,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return c.json(
        { error: "Groq API қатесі", status: response.status, details: errorData },
        500
      );
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("AI Chat error:", error);
    return c.json({ error: "Сервер қатесі", details: String(error) }, 500);
  }
});

// AI Test Generator - мәтіннен тест құру
app.post("/api/ai/generate-tests", async (c) => {
  try {
    if (!GROQ_API_KEY) {
      return c.json(
        { error: "GROQ_API_KEY орнатылмаған. .env файлына GROQ_API_KEY=gsk_... қосыңыз" },
        500
      );
    }

    const body = await c.req.json();
    const { content, count = 10, model = "llama-3.3-70b-versatile" } = body;

    if (!content || content.length < 50) {
      return c.json({ error: "Мәтін 50 таңбадан кем болмауы керек" }, 400);
    }

    const prompt = `Төмендегі биология мәтінінен ${count} тест сұрағы құр. 

Мәтін:
"""${content.substring(0, 4000)}"""

ТАЛАПТАР:
1. Әр сұраққа 4 жауап нұсқа (A, B, C, D)
2. Дұрыс жауапты нөмірімен белгіле (0=A, 1=B, 2=C, 3=D)
3. Әр сұраққа қысқа түсініктеме бер
4. Сұрақтар қазақша болсын
5. ТЕК төмендегі JSON форматында қайтар, басқа мәтін жазба:

[{"text":"Сұрақ мәтіні?","options":["A нұсқа","B нұсқа","C нұсқа","D нұсқа"],"correctAnswer":0,"explanation":"Түсініктеме"}]`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "Сен биология тестін құру бойынша мамансың. Жауаптарды ТЕК JSON форматында қайтар.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return c.json(
        { error: "Groq API қатесі", status: response.status, details: errorData },
        500
      );
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("AI Generate Tests error:", error);
    return c.json({ error: "Тест генерациясы қатесі", details: String(error) }, 500);
  }
});

// ===========================

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
