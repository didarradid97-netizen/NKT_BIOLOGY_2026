export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return Response.json({ error: "API key жоқ" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: body.model || "llama-3.3-70b-versatile",
        messages: body.messages,
        temperature: body.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return Response.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    return Response.json({ error: "Сервер қатесі" }, { status: 500 });
  }
}
