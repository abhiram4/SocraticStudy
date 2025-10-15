
import React, { useRef } from 'react';

interface PdfUploaderProps {
    onFileChange: (file: File | null) => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onFileChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileChange(file);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div 
            className="flex flex-col items-center justify-center w-full max-w-lg p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleClick}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700">Upload your PDF</h2>
            <p className="text-gray-500 mt-2">Click to browse or drag and drop a file</p>
            <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
            />
        </div>
    );
};
