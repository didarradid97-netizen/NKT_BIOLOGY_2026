import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY табылмады" },
        { status: 500 }
      );
    }

    const messages = (body.messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Сен NKT мектебінің биология мұғалімісің. Оқушыларға қазақ тілінде түсінікті, қысқа және нақты жауап бер.",
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Groq қатесі:", err);
      return NextResponse.json(
        { error: "Groq қате қайтарды", details: err },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("route.ts қатесі:", error);
    return NextResponse.json(
      { error: "Сервер ішкі қатесі" },
      { status: 500 }
    );
  }
}
