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
    const { content, count = 10, model = 'llama-3.3-70b-versatile' } = body;

    if (!content || content.length < 50) {
      return res.status(400).json({ error: 'Мәтін 50 таңбадан кем' });
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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Сен биология тестін құру бойынша мамансың. Жауаптарды ТЕК JSON форматында қайтар.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 4096,
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
    console.error('AI Generate Tests error:', error);
    return res.status(500).json({ 
      error: 'Тест генерациясы қатесі', 
      details: String(error) 
    });
  }
}
