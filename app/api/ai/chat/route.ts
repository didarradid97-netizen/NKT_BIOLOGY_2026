export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // API кілт бар ма тексеру
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "API кілт табылмады" }, 
        { status: 500 }
      );
    }

    const userMessage = body.messages?.at(-1)?.content || "";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: "Сен биология мұғалімісің. Қазақша жауап бер. Сұрақ: " + userMessage 
            }]
          }]
        }),
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: "AI сервисі қате қайтарды" }, 
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return Response.json(
        { error: "Жауап алынбады" }, 
        { status: 502 }
      );
    }

    // Groq форматына сәйкес қайтару
    return Response.json({
      choices: [{ message: { content: text } }]
    });

  } catch (error) {
    return Response.json(
      { error: "Сервер қатесі" }, 
      { status: 500 }
    );
  }
}
