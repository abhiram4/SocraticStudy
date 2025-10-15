// Simple OpenRouter API key check
// Usage: node scripts/test-openrouter.mjs

const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error('OPENROUTER_API_KEY is not set. Create a .env with OPENROUTER_API_KEY=... or set the env variable before running.');
  process.exit(1);
}

const body = {
  model: 'meta-llama/llama-3.1-8b-instruct',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Reply with the word "pong" only.' },
  ],
  temperature: 0.0,
  max_tokens: 10,
};

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  // Optional ranking headers:
  'HTTP-Referer': 'http://localhost:3000',
  'X-Title': 'SocraticStudy Dev',
};

async function main() {
  try {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const text = await resp.text();
    if (!resp.ok) {
      console.error(`Request failed (${resp.status}):\n${text}`);
      process.exit(1);
    }
    const data = JSON.parse(text);
    const content = data?.choices?.[0]?.message?.content ?? '';
    console.log('OpenRouter response:', content);
    if (/pong/i.test(content)) {
      console.log('OK: Key works.');
    } else {
      console.warn('Unexpected reply. The key may still be valid, but response was:', content);
    }
  } catch (err) {
    console.error('Network or parsing error:', err);
    process.exit(1);
  }
}

main();


