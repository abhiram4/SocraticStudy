# SocraticStudy  
**[https://socratic-study-snowy.vercel.app/](https://socratic-study-snowy.vercel.app/)**  

An AI-powered web application for intelligent, interactive study sessions on PDFs.  
SocraticStudy integrates document summarization, question answering, and text-to-speech (TTS) to create a seamless learning experience directly in the browser.  

---

## Overview

SocraticStudy enables users to upload academic PDFs, receive **contextual summaries per page**, and **interactively query** the content using advanced large language models.  
It also includes a **text-to-speech engine** for audio-based learning, **offline caching** for persistence, and a **fullscreen distraction-free study mode**.  

The system combines **React + TypeScript** on the frontend with a **FastAPI + LangChain** backend that securely handles AI model orchestration and TTS generation.

---

## Features

### PDF Upload and Viewing  
- Supports standard PDF files using **Mozilla PDF.js**.  
- Persistent page navigation and reading progress tracking.

### Context-Aware Summarization  
- Page-wise summaries with **cross-page context** (neighbor + global context).  
- Two summarization modes:  
  - *Standard* — concise academic-style summaries.  
  - *ELI5* — simplified explanations.  
- Summaries cached locally for instant reloads.

### Interactive Q&A  
- Users can query the document with natural language.  
- Uses **LangChain** to construct dynamic prompts combining document embeddings and user questions.  
- Employs **retrieval-augmented generation (RAG)** for contextually accurate answers.

### Text-to-Speech (TTS)  
- Converts AI summaries to natural speech.  
- Built with the **Google Gemini SDK** for realistic voice generation.  
- Supports continuous playback and fullscreen reading.

### Fullscreen Study Mode  
- Distraction-free interface with keyboard shortcuts:  
  - `←` / `→` — Navigate between pages  
  - `Space` — Play / Pause audio  
  - `Esc` — Exit fullscreen  

### Offline Caching  
- Summaries, audio, and user progress are stored in `localStorage`.  
- Ensures reliability even with intermittent connectivity.

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Inter Font |
| PDF Rendering | Mozilla PDF.js |
| AI & LLM Orchestration | LangChain + OpenRouter API |
| TTS Engine | Google Gemini SDK |
| Backend Framework | FastAPI (Python) |
| Storage | Browser `localStorage` |
| Deployment | Vercel (Frontend) + Render/Railway (Backend) |

---

## Architecture

The system is divided into two core layers:

1. **Frontend (React + TypeScript)**  
   - Handles PDF viewing, summary display, TTS playback, and user interaction.  
   - Communicates with the backend through RESTful endpoints.  
   - Implements caching and offline storage.

2. **Backend (FastAPI + LangChain)**  
   - Acts as a secure proxy between frontend and LLM providers.  
   - Manages summarization, TTS requests, and document Q&A pipelines.  
   - Integrates LangChain components for:  
     - PDF text chunking and vector embedding  
     - Context retrieval  
     - Query-based generation using LLMs  
   - All API keys and credentials remain server-side.

---

## Project Structure

```
socratic-study/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── pages/
│   └── vite.config.ts
└── backend/
    ├── main.py
    ├── routes/
    ├── utils/
    └── .env
```

---

## Backend Setup (FastAPI + LangChain)

1. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # Linux/Mac
   .venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   ```

2. Create an `.env` file:
   ```env
   OPENROUTER_API_KEY=your_openrouter_key
   OPENROUTER_BASE=https://openrouter.ai/api/v1
   FRONTEND_ORIGIN=http://localhost:3000
   HTTP_REFERER=http://localhost:3000
   X_TITLE=SocraticStudy
   ```

3. Run the backend:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

4. Endpoints:
   - `POST /upload_pdf` – Extracts and splits PDF text
   - `POST /summarize` – Summarizes a given page
   - `POST /tts` – Generates speech for summaries
   - `POST /doubt` – Handles user queries using RAG

---

## Deployment Guide

### Frontend (Vercel)

1. Push the repository to GitHub and import into Vercel.
2. Configure build settings:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Optionally, add environment variables for public APIs if not using a backend.

### Backend (Render / Railway / Fly.io)

1. Set environment variables:
   ```env
   OPENROUTER_API_KEY=your_openrouter_key
   FRONTEND_ORIGIN=https://socratic-study-snowy.vercel.app
   HTTP_REFERER=https://socratic-study-snowy.vercel.app
   X_TITLE=SocraticStudy
   ```

2. Expose port 8000 and start the server:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```

3. Update frontend API base URL to your deployed backend endpoint.

---

## Security Model

- API keys are securely stored on the backend only.
- CORS and referer validation are enforced via environment configuration.
- Frontend communicates exclusively with the backend proxy to prevent key exposure.

---

## License

This project is open-source under the MIT License.