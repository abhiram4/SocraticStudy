/// <reference types="vite/client" />

declare module "@langchain/google-genai";
declare module "langchain/vectorstores/memory";
declare module "langchain/text_splitter";
declare module "@langchain/core/documents";


interface ImportMetaEnv {
  readonly GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


