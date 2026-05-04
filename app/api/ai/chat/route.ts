import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY табылмады" },
        { status: 500 }
      );
    }

    // Хабарламаларды дайындау
    const messages = (body.messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system:
          "Сен NKT мектебінің биология мұғалімісің. Оқушыларға қазақ тілінде түсінікті, қысқа және нақты жауап бер. Биология тақырыптары: клетка, генетика, фотосинтез, эволюция, экология.",
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Anthropic қатесі:", err);
      return NextResponse.json(
        { error: "AI сервисі қате қайтарды", details: err },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "Жауап алынбады";

    // Groq форматымен сәйкес қайтару (фронтенд өзгертпеу үшін)
    return NextResponse.json({
      choices: [
        {
          message: {
            role: "assistant",
            content: text,
          },
        },
      ],
    });
  } catch (error) {
    console.error("route.ts қатесі:", error);
    return NextResponse.json(
      { error: "Сервер ішкі қатесі" },
      { status: 500 }
    );
  }
}
