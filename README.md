# 🧠 SocraticStudy  
**An AI-powered study companion for PDFs**  

Upload a PDF, get page-wise AI summaries, listen with TTS, and ask questions — all directly in your browser.  
Built with React + TypeScript, powered by OpenRouter and Gemini APIs.

---

## 🚀 Features

- 📄 **PDF Upload & Viewing**
  - Navigate pages easily and resume from where you left off.
- ✍️ **AI Summaries (Per Page)**
  - Context-aware (neighbor + global) summarization.
  - Dual modes: **Standard** and **ELI5 (Explain Like I’m 5)**.
  - Cached locally for instant reloads.
- 🔊 **Text-to-Speech (TTS)**
  - Natural voice playback using **Google Gemini SDK**.
  - Continuous reading across pages in fullscreen.
- ❓ **Ask Questions**
  - Ask about the document using a simple retrieval + OpenRouter model.
- 🧘 **Fullscreen Study Mode**
  - Distraction-free layout with keyboard shortcuts:
    - `←` / `→` – Prev / Next page  
    - `Space` – Play / Pause audio  
    - `Esc` – Exit fullscreen
- 💾 **Offline Caching**
  - Summaries, audio, and progress stored in `localStorage`.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| Framework | React 19 + TypeScript (Vite) |
| Styling | Tailwind CSS (CDN) + Inter Font |
| PDF Rendering | Mozilla PDF.js (CDN) |
| AI & Q&A | OpenRouter API |
| TTS | Google Gemini SDK |
| Storage | Browser `localStorage` |
| Build Tool | Vite |

This app uses a **FastAPI backend** to handle AI and TTS securely; API keys are never shipped to the browser.

---

## 🗂️ Project Structure

---

## 🔒 Optional Secure Backend (FastAPI)

Use this if you want to keep API keys server-side and proxy all AI, file, and TTS logic.

1. Setup backend
   ```bash
   cd backend
   python -m venv .venv
   .venv\\Scripts\\activate  # Windows
   pip install -r requirements.txt
   ```
2. Create `backend/.env` with:
   ```env
   OPENROUTER_API_KEY=your_openrouter_key
   OPENROUTER_BASE=https://openrouter.ai/api/v1
   FRONTEND_ORIGIN=http://localhost:3000
   HTTP_REFERER=http://localhost:3000
   X_TITLE=SocraticStudy
   ```
3. Run backend
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
4. Update the frontend services to call `http://localhost:8000` endpoints
   - POST `/upload_pdf` — upload PDF and get per-page text
   - POST `/summarize` — summarize page text
   - POST `/tts` — get MP3 URL under `/media/...`
   - POST `/doubt` — ask a question with context

---

## 🔐 Security Model

- Keys are stored only on the backend (`backend/.env`). The frontend calls your backend; keys are never exposed to users.
- Set `FRONTEND_ORIGIN` in `backend/.env` to your site URL for strict CORS.

---

## 🌐 Deploy to Vercel (Frontend)

1) Push this repo to GitHub and import into Vercel.

2) Vercel project settings → Build & Output:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3) Environment variables (choose ONE setup):
   - Frontend-only (quick):
     - `GEMINI_API_KEY` and `OPENROUTER_API_KEY` (keys will be embedded client-side)
   - Secure (recommended):
     - Do NOT set AI keys on the frontend project. Instead, deploy the backend separately (see below) and point the frontend to your backend URL.

4) Rewrite client calls (if using the backend):
   - Update your frontend services to call your backend domain (e.g., `https://your-backend.example.com`).

---

## 🚀 Deploy the Backend (FastAPI)

You can deploy the backend to platforms like Railway, Render, Fly.io, or a VM:

1) Set env vars on the backend service:
   - `OPENROUTER_API_KEY` (required)
   - `OPENROUTER_BASE=https://openrouter.ai/api/v1`
   - `FRONTEND_ORIGIN=https://your-vercel-app.vercel.app`
   - `HTTP_REFERER=https://your-vercel-app.vercel.app`
   - `X_TITLE=SocraticStudy`

2) Expose port 8000 and run:
   - `uvicorn backend.main:app --host 0.0.0.0 --port 8000`

3) In the frontend, call your backend endpoints instead of direct AI providers.


