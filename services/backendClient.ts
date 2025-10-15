const BASE_URL = (import.meta as any)?.env?.VITE_API_BASE || (globalThis as any)?.process?.env?.VITE_API_BASE || 'http://localhost:8000';

export async function uploadPdf(file: File): Promise<{ num_pages: number; pages: string[]; metadata: any; }>{
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE_URL}/upload_pdf`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function summarize(text: string, pageNumber: number): Promise<string> {
  const res = await fetch(`${BASE_URL}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, page_number: pageNumber })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.summary as string;
}

export async function tts(summary: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return `${BASE_URL}${data.url}`;
}

export async function doubt(question: string, context: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/doubt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.answer as string;
}


