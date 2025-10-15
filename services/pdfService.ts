
import type { PDFDocumentProxy } from '../types';

export const extractTextFromPage = async (pdfDoc: PDFDocumentProxy, pageNum: number): Promise<string> => {
    try {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        return textContent.items.map(item => item.str).join(' ');
    } catch (error) {
        console.error(`Error extracting text from PDF page ${pageNum}:`, error);
        throw new Error(`Could not extract text from page ${pageNum}.`);
    }
};

export const extractTextFromAllPages = async (pdfDoc: PDFDocumentProxy): Promise<string[]> => {
    try {
        const allPagesText: string[] = [];
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const pageText = await extractTextFromPage(pdfDoc, i);
            allPagesText.push(pageText);
        }
        return allPagesText;
    } catch (error) {
        console.error("Error extracting text from all PDF pages:", error);
        throw new Error("Could not extract text from the PDF.");
    }
}
