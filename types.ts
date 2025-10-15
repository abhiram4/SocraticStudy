
export interface PDFPageProxy {
    getViewport: (options: { scale: number }) => { width: number; height: number; };
    render: (options: { canvasContext: CanvasRenderingContext2D; viewport: any; }) => { promise: Promise<void> };
    getTextContent: () => Promise<{ items: { str: string }[] }>;
}

export interface PDFDocumentProxy {
    numPages: number;
    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}
