const labels = new Set(['real', 'fake']);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  if (!process.env.GROQ_API_KEY) {
    return response.status(503).json({ error: 'GROQ_API_KEY is not configured for this deployment.' });
  }

  const { text, label, confidence, hits } = request.body || {};
  if (typeof text !== 'string' || !labels.has(label)) {
    return response.status(400).json({ error: 'Invalid analysis payload.' });
  }

  const prompt = `Explain this news-classification result cautiously. Do not claim the text is factually true or false.
Local user-trained model prediction: ${label}; confidence: ${confidence}%; sensational-language signals: ${hits}.
Claim: ${text}
Give three short bullets: what this model signal means, what evidence would verify the claim, and the model's limitation.`;

  try {
    const groq = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        temperature: 0.2,
        max_tokens: 260,
        messages: [
          { role: 'system', content: 'You are a responsible media-literacy assistant. Never present a classifier output as a fact check.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    const result = await groq.json();
    if (!groq.ok) throw new Error(result.error?.message || 'Groq rejected the request.');
    return response.status(200).json({ explanation: result.choices?.[0]?.message?.content || 'No explanation returned.' });
  } catch (error) {
    return response.status(502).json({ error: error.message });
  }
}
