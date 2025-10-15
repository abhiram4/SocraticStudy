<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1TtcXp5UeGnUYoSgk5xd_Ri80O8oCeKNt

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env` file in the project root and add your API key:
   
   ```bash
   echo GEMINI_API_KEY=your_api_key_here > .env
   ```
   
   The app reads `GEMINI_API_KEY` via Vite and also supports running directly in the browser.
3. Run the app:
   `npm run dev`

Notes
- If you don't set `GEMINI_API_KEY`, features that call Gemini (summarization, TTS, Q&A) will show a helpful error but the app UI will still load.
- This project uses CDN import maps for some runtime dependencies (React, LangChain ESM, etc.) when served via `index.html`. Vite handles TypeScript and dev server.
