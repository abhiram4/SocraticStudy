
import React, { useState } from 'react';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';
import { Spinner } from './Spinner';

interface DoubtPanelProps {
    onAnswerDoubt: (question: string) => Promise<string>;
    isReady: boolean;
}

export const DoubtPanel: React.FC<DoubtPanelProps> = ({ onAnswerDoubt, isReady }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !isReady) return;

        setIsLoading(true);
        setAnswer('');
        setError(null);

        try {
            const result = await onAnswerDoubt(question);
            setAnswer(result);
        } catch (err) {
            setError('Sorry, I could not find an answer to your question. Please try rephrasing it.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Doubt Section</h3>
            <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={isReady ? "Ask a question about the document..." : "Document is being processed..."}
                    disabled={!isReady || isLoading}
                    className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
                    aria-label="Ask a question"
                />
                <button
                    type="submit"
                    disabled={!isReady || isLoading || !question.trim()}
                    className="p-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                    aria-label="Submit question"
                >
                   {isLoading ? <Spinner /> : <QuestionMarkIcon className="h-5 w-5" />}
                </button>
            </form>
            <div className="flex-grow bg-gray-100 p-4 rounded-lg overflow-y-auto min-h-[100px]">
                {error && <div className="text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
                {isLoading ? (
                    <div className="text-center text-gray-500 py-4">
                        <Spinner />
                        <p className="mt-2">Searching for an answer...</p>
                    </div>
                ) : answer ? (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{answer}</p>
                ) : (
                    <div className="text-center text-gray-500 pt-8">
                        <QuestionMarkIcon className="h-10 w-10 mx-auto text-gray-300" />
                        <p className="mt-2">Your questions about the document will be answered here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
