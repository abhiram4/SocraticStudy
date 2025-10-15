import { generateText } from './openRouterService';

// Remove LangChain dependency to avoid circular imports issues in the browser

// Avoid throwing at import time in the browser; we'll validate within functions.

// No external model instances needed when using direct Gemini calls from geminiService

export const createVectorStore = async (pages: string[]) => {
    // Simple in-memory docs, used by naive retriever below
    return pages;
};

// Simple template function instead of PromptTemplate
const formatSummaryPrompt = (
    currentPageText: string,
    prevPageText: string,
    nextPageText: string,
    globalContext: string,
    isEli5: boolean
): string => {
    const eli5Instruction = isEli5 
        ? "\n- Explain it in very simple terms, as if you were talking to a 5-year-old."
        : "";

    return `You are an expert academic assistant. Your task is to summarize a single page from a PDF document.

GLOBAL CONTEXT FROM THE DOCUMENT (first few pages):
---
${globalContext}
---

TEXT FROM PREVIOUS PAGE:
---
${prevPageText || "This is the first page."}
---

TEXT FROM CURRENT PAGE (your main focus):
---
${currentPageText}
---

TEXT FROM NEXT PAGE:
---
${nextPageText || "This is the last page."}
---

INSTRUCTIONS:
- Generate a concise summary of the CURRENT PAGE text in 3-5 sentences.
- Use the context from the other sections to better understand abbreviations, concepts, and the flow of argument.
- Your summary must focus ONLY on the content of the current page.
- Focus on key definitions, equations, and logical flow. Avoid redundancy.${eli5Instruction}`;
};

export const summarizePageWithContext = async (
    currentPageText: string,
    prevPageText: string,
    nextPageText: string,
    globalContext: string,
    isEli5: boolean
): Promise<string> => {
    try {
        const prompt = formatSummaryPrompt(
            currentPageText,
            prevPageText,
            nextPageText,
            globalContext,
            isEli5
        );
        const system = 'You are an expert academic assistant.';
        return await generateText(system, prompt);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error in summarizePageWithContext:", error);
        throw new Error(`Failed to generate summary: ${message}`);
    }
};

export const answerDoubt = async (question: string, vectorStore: any): Promise<string> => {
    try {
        // Naive retrieval: rank pages by token overlap
        const qTokens = question.toLowerCase().match(/[\w]+/g) || [];
        const scored = (vectorStore as string[]).map((content: string, idx: number) => {
            const tokens = (content.toLowerCase().match(/[\w]+/g) || []);
            const set = new Set(tokens);
            let score = 0;
            for (const t of qTokens) if (set.has(t)) score++;
            return { page: idx + 1, content, score };
        }).sort((a, b) => b.score - a.score).slice(0, 4);

        const context = scored
            .map((item, i) => `[Page ${item.page}]\n${item.content}`)
            .join('\n\n---\n\n');
        
        // Create prompt
        const prompt = `You are an expert academic assistant. Answer the following question based on the provided context from a PDF document.

CONTEXT FROM THE DOCUMENT:
---
${context}
---

QUESTION:
${question}

INSTRUCTIONS:
- Answer the question accurately based on the context provided.
- If the context doesn't contain enough information, say so clearly.
- Be concise but thorough.
- If relevant, cite which document section supports your answer.

ANSWER:`;

        const system = 'You are an expert academic assistant.';
        return await generateText(system, prompt);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error in answerDoubt:", error);
        throw new Error(`Failed to answer question: ${message}`);
    }
};