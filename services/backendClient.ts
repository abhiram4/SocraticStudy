// API base URL detection
// Priority (top to bottom):
// 1) VITE_API_URL (set at build/deploy time for maximum flexibility)
// 2) If running on localhost, default to local backend http://localhost:8000
// 3) Otherwise, use the deployed Render backend
const explicit = (import.meta as any)?.env?.VITE_API_URL || (globalThis as any)?.process?.env?.VITE_API_URL;
const isLocal = typeof window !== 'undefined' && /^(localhost|127\.|0:0:0:0:0:0:0:1|\[::1\])$/.test(window.location.hostname);
const DEFAULT_LOCAL = 'http://localhost:8000';
const DEFAULT_PROD = 'https://socraticstudy.onrender.com';
export const API_BASE_URL: string = (explicit as string) || (isLocal ? DEFAULT_LOCAL : DEFAULT_PROD);

export async function uploadPdf(file: File): Promise<{ num_pages: number; pages: string[]; metadata: any; }>{
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE_URL}/upload_pdf`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function summarize(text: string, pageNumber: number): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, page_number: pageNumber })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.summary as string;
}

export async function tts(summary: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return `${API_BASE_URL}${data.url}`;
}

export async function doubt(question: string, context: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/doubt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.answer as string;
}


