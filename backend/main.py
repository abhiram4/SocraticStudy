import os
import hashlib
import uuid
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel

import asyncio
import httpx
from dotenv import load_dotenv

# Lazy import to avoid heavy import on cold start if unused
def _ensure_dirs():
    os.makedirs("backend/uploads", exist_ok=True)
    os.makedirs("backend/media", exist_ok=True)


load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE = os.getenv("OPENROUTER_BASE", "https://openrouter.ai/api/v1")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

app = FastAPI(title="SocraticStudy Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_origins=["https://socraticstudy.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_ensure_dirs()
app.mount("/media", StaticFiles(directory="backend/media"), name="media")


class UploadResponse(BaseModel):
    num_pages: int
    pages: List[str]
    metadata: Dict[str, Any] = {}


class SummarizeRequest(BaseModel):
    page_number: int
    text: str


class TTSRequest(BaseModel):
    summary: str


class DoubtRequest(BaseModel):
    question: str
    context: str


# In-memory caches (simple)
SUMMARY_CACHE: Dict[str, str] = {}


def _hash_key(prefix: str, *parts: str) -> str:
    h = hashlib.sha256()
    for p in parts:
        h.update(p.encode("utf-8"))
    return f"{prefix}:{h.hexdigest()}"


@app.post("/upload_pdf", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    path = os.path.join("backend/uploads", f"{uuid.uuid4()}_{file.filename}")
    try:
        with open(path, "wb") as f:
            f.write(await file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {e}")

    # Extract text with pdfplumber
    try:
        import pdfplumber  # type: ignore
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"pdfplumber not installed: {e}")

    pages_text: List[str] = []
    meta: Dict[str, Any] = {}
    try:
        with pdfplumber.open(path) as pdf:
            meta = pdf.metadata or {}
            for page in pdf.pages:
                txt = page.extract_text() or ""
                pages_text.append(txt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read PDF: {e}")

    return UploadResponse(num_pages=len(pages_text), pages=pages_text, metadata=meta)


async def _openrouter_chat(system_prompt: str, user_prompt: str, model: Optional[str] = None) -> str:
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")
    payload = {
        "model": model or os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct"),
        "temperature": 0.3,
        "max_tokens": 1024,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": os.getenv("HTTP_REFERER", "http://localhost:3000"),
        "X-Title": os.getenv("X_TITLE", "SocraticStudy"),
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(f"{OPENROUTER_BASE}/chat/completions", headers=headers, json=payload)
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        data = r.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")


@app.post("/summarize")
async def summarize(req: SummarizeRequest):
    key = _hash_key("sum", str(req.page_number), req.text)
    if key in SUMMARY_CACHE:
        return {"summary": SUMMARY_CACHE[key], "cached": True}

    system = "You are an expert academic assistant."
    user = (
        "Summarize this text clearly and concisely, focusing on key ideas, formulas, and definitions suitable for revision.\n\n"
        + req.text
    )
    try:
        summary = await _openrouter_chat(system, user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {e}")

    SUMMARY_CACHE[key] = summary
    return {"summary": summary, "cached": False}


@app.post("/tts")
async def tts(req: TTSRequest):
    # Generate MP3 with gTTS
    try:
        from gtts import gTTS  # type: ignore
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"gTTS not installed: {e}")

    if not req.summary.strip():
        raise HTTPException(status_code=400, detail="Summary is empty")
    filename = f"tts_{uuid.uuid4()}.mp3"
    filepath = os.path.join("backend/media", filename)
    try:
        tts = gTTS(text=req.summary)
        tts.save(filepath)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {e}")

    return {"url": f"/media/{filename}"}


@app.post("/doubt")
async def doubt(req: DoubtRequest):
    system = "You are an expert academic assistant. Answer only from the provided context."
    user = (
        "CONTEXT:\n" + req.context + "\n\n" +
        "QUESTION:\n" + req.question + "\n\n" +
        "If the context is insufficient, state that clearly."
    )
    try:
        answer = await _openrouter_chat(system, user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QA failed: {e}")

    return {"answer": answer}


# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}


