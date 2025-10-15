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

Everything runs **100% in-browser** — no backend required.

---

## 🗂️ Project Structure

---

## 🔧 Run Locally (Frontend Only)

1. Install dependencies:
   `npm install`
2. Create a `.env` in project root and add keys:
   ```bash
   echo GEMINI_API_KEY=your_gemini_key_here > .env
   echo OPENROUTER_API_KEY=your_openrouter_key_here >> .env
   ```
3. Start dev server:
   `npm run dev`

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


