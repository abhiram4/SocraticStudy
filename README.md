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

