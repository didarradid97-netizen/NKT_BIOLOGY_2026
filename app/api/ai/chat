export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Тек POST рұқсат етілген' });
  }

  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return res.status(500).json({ 
        error: 'GROQ_API_KEY орнатылмаған. Vercel Environment Variables-қа қосыңыз.' 
      });
    }

    const body = req.body;
    const { messages, model = 'llama-3.3-70b-versatile', temperature = 0.7 } = body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages массиві қажет' });
    }

    const systemMessage = {
      role: 'system',
      content: 'Сен қазақ тілінде сөйлейтін биология пәні мұғалімісің. Ата-ана: Нұрислам, сынып: 9. ОЗП (Орта білімге қабылдау) биологиядан дайындайсың. Жауаптарың қысқа, түсінікті және нақты болсын. Керек болғанда мысалдар келтір. Егер сұрақ басқа пәннен болса, сыпайы түрде биологияға бағытта.'
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [systemMessage, ...messages],
        temperature,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(500).json({ 
        error: 'Groq API қатесі', 
        status: response.status, 
        details: err 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('AI Chat error:', error);
    return res.status(500).json({ 
      error: 'Сервер қатесі', 
      details: String(error) 
    });
  }
}
