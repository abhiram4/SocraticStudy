
import React, { useRef, useEffect, useCallback } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import type { PDFDocumentProxy } from '../types';

interface PdfViewerProps {
    pdfDoc: PDFDocumentProxy | null;
    currentPage: number;
    setCurrentPage: (page: number) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfDoc, currentPage, setCurrentPage }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const renderPage = useCallback(async (pageNum: number) => {
        if (!pdfDoc || !canvasRef.current) return;
        try {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            if (context) {
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              const renderContext = {
                  canvasContext: context,
                  viewport: viewport,
              };
              await page.render(renderContext).promise;
            }
        } catch (error) {
            console.error('Failed to render PDF page:', error);
        }
    }, [pdfDoc]);

    useEffect(() => {
        renderPage(currentPage);
    }, [currentPage, renderPage]);

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (pdfDoc && currentPage < pdfDoc.numPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <button
                    onClick={goToPreviousPage}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous Page"
                >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
                <span className="text-gray-700 font-medium">
                    Page {currentPage} of {pdfDoc?.numPages || '...'}
                </span>
                <button
                    onClick={goToNextPage}
                    disabled={!pdfDoc || currentPage >= pdfDoc.numPages}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next Page"
                >
                    <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                </button>
            </div>
            <div className="flex-grow overflow-auto bg-gray-100 rounded-lg flex justify-center items-start p-2">
                <canvas ref={canvasRef} className="max-w-full h-auto shadow-md"></canvas>
            </div>
        </div>
    );
};
