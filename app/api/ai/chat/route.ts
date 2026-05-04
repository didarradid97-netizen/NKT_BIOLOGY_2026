export async function POST(req: Request) {
  const body = await req.json();
  
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

  const data = await response.json();
  return Response.json(data);
}
