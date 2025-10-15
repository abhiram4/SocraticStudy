const OPENROUTER_API_KEY: string | undefined =
  (import.meta as any)?.env?.OPENROUTER_API_KEY ||
  (globalThis as any)?.process?.env?.OPENROUTER_API_KEY ||
  (globalThis as any)?.process?.env?.OPENROUTER_API_KEY;

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export async function generateText(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set.');
  }
  const resp = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'SocraticStudy',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct',
      temperature: 0.3,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`OpenRouter error ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  const content: string = data?.choices?.[0]?.message?.content || '';
  return content;
}


