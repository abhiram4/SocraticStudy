
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { Spinner } from './Spinner';
import { ToggleSwitch } from './ToggleSwitch';

interface SummaryPanelProps {
    summary: string;
    isSummarizing: boolean;
    summarizationProgress: number;
    isLoadingAudio: boolean;
    isPlaying: boolean;
    error: string | null;
    onSummarize: () => void;
    onListen: () => void;
    hasPdf: boolean;
    hasSummaries: boolean;
    isEli5: boolean;
    setIsEli5: (value: boolean) => void;
    isPreparing: boolean;
}

const ShimmerEffect = () => (
    <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-4 bg-gray-200 rounded-full ${i === 3 ? 'w-2/3' : ''} animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:2000px_100%]`}></div>
        ))}
    </div>
);

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
    summary,
    isSummarizing,
    summarizationProgress,
    isLoadingAudio,
    isPlaying,
    error,
    onSummarize,
    onListen,
    hasPdf,
    hasSummaries,
    isEli5,
    setIsEli5,
    isPreparing,
}) => {
    return (
        <div className="flex flex-col">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onSummarize}
                    disabled={isSummarizing || isPreparing || !hasPdf}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:bg-gray-300 disabled:text-gray-100 disabled:cursor-not-allowed transition-colors shadow"
                >
                    {isPreparing ? <><Spinner /><span className="ml-2">Preparing...</span></> : 
                     isSummarizing ? <><Spinner /><span className="ml-2">Summarizing...</span></> : 
                     <><SparklesIcon className="h-5 w-5 mr-2" /><span>Summarize Document</span></>
                    }
                </button>
                <button
                    onClick={onListen}
                    disabled={!summary || isLoadingAudio}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-semibold rounded-lg text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shadow"
                >
                    {isLoadingAudio ? <Spinner /> : isPlaying ? <StopIcon className="h-5 w-5 mr-2" /> : <PlayIcon className="h-5 w-5 mr-2" />}
                    {isPlaying ? 'Stop' : 'Listen'}
                </button>
            </div>

            {isSummarizing && (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${summarizationProgress}%`, transition: 'width 0.3s ease-in-out' }}></div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-1">{Math.round(summarizationProgress)}% Complete</p>
                </div>
            )}

            <div className="flex justify-between items-center mt-6 mb-4 border-b pb-2">
                 <h3 className="text-lg font-semibold text-gray-800">AI Summary</h3>
                 <ToggleSwitch label="Explain Like I'm 5" checked={isEli5} onChange={setIsEli5} disabled={isSummarizing}/>
            </div>
            
            <div className="flex-grow bg-brand-light/40 p-4 rounded-lg overflow-y-auto min-h-[150px]">
                {error && <div className="text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
                
                {isPreparing ? (
                     <div className="text-center text-gray-500 pt-8">
                        <Spinner />
                        <p className="mt-2">Preparing document for analysis...</p>
                    </div>
                ) : isSummarizing && !summary ? (
                     <div className="text-center text-gray-500 pt-8">
                        <Spinner />
                        <p className="mt-2">Generating summaries...</p>
                    </div>
                ): summary ? (
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {summary.replace(/Here is a concise summary of the CURRENT PAGE text in 3-5 sentences:?\s*/i, '')}
                    </p>
                ) : !hasSummaries ? (
                    <div className="text-center text-gray-500 pt-8">
                        <SparklesIcon className="h-12 w-12 mx-auto text-gray-300" />
                        <p className="mt-2">Click "Summarize Document" to generate summaries for all pages.</p>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 pt-8">
                        <p>Summary for this page will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
