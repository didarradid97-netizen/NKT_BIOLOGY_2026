const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export async function askGroq(messages: { role: string; content: string }[]) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Сен биология мұғалімісің. Қазақша жауап бер.",
        },
        ...messages,
      ],
      max_tokens: 1024,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
