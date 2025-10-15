
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PdfUploader } from './components/PdfUploader';
import { PdfViewer } from './components/PdfViewer';
import { SummaryPanel } from './components/SummaryPanel';
import { DoubtPanel } from './components/DoubtPanel';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { extractTextFromPage, extractTextFromAllPages } from './services/pdfService';
import { summarizePageWithContext, answerDoubt as getAnswerFromLLM, createVectorStore } from './services/langchainService';
import { uploadPdf, summarize as summarizeApi, tts as ttsApi } from './services/backendClient';
import type { PDFDocumentProxy } from './types';

declare const pdfjsLib: any;

const App: React.FC = () => {
    const [file, setFile] = useState(null as File | null);
    const [pdfDoc, setPdfDoc] = useState(null as PDFDocumentProxy | null);
    const [currentPage, setCurrentPage] = useState(1);
    
    // State for summaries and TTS
    const [summaries, setSummaries] = useState([] as string[]);
    const [audioSrcs, setAudioSrcs] = useState([] as (string | null)[]);
    const [currentAudioSrc, setCurrentAudioSrc] = useState(null as string | null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Loading and error states
    const [isPreparing, setIsPreparing] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summarizationProgress, setSummarizationProgress] = useState(0);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [error, setError] = useState(null as string | null);

    // LangChain and Q&A state
    const [vectorStore, setVectorStore] = useState(null as any | null);
    
    // User preferences
    const [isEli5, setIsEli5] = useState(false);
    
    const audioRef = useRef(null as HTMLAudioElement | null);
    const viewerContainerRef = useRef(null as HTMLDivElement | null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isAutoPlayMode, setIsAutoPlayMode] = useState(false);
    
    useEffect(() => {
        const audioEl = audioRef.current;
        if (!audioEl) return;
  
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);
  
        audioEl.addEventListener('play', handlePlay);
        audioEl.addEventListener('pause', handlePause);
        audioEl.addEventListener('ended', handleEnded);
  
        return () => {
            audioEl.removeEventListener('play', handlePlay);
            audioEl.removeEventListener('pause', handlePause);
            audioEl.removeEventListener('ended', handleEnded);
        };
    }, []);

    // Track fullscreen changes and stop autoplay when exiting
    useEffect(() => {
        const onFsChange = () => {
            const fs = !!document.fullscreenElement;
            setIsFullscreen(fs);
            if (!fs) {
                setIsAutoPlayMode(false);
                audioRef.current?.pause();
            }
        };
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    useEffect(() => {
        if (file) {
            localStorage.setItem(`socraticstudy-page-${file.name}`, String(currentPage));
        }
    }, [currentPage, file]);

    useEffect(() => {
        // Load cached summary immediately when page changes
        if (!file || !pdfDoc) return;
        const cacheKey = `ssum:${file.name}:${currentPage}:${isEli5 ? 'eli5' : 'std'}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const updated = [...summaries];
            updated[currentPage - 1] = cached;
            setSummaries(updated);
        }
    }, [currentPage, file, pdfDoc, isEli5]);

    const resetState = () => {
        setFile(null);
        setPdfDoc(null);
        setCurrentPage(1);
        setSummaries([]);
        setAudioSrcs([]);
        setCurrentAudioSrc(null);
        setError(null);
        setIsPreparing(false);
        setIsSummarizing(false);
        setSummarizationProgress(0);
        setVectorStore(null);
    };

    const handleFileChange = useCallback(async (selectedFile: File | null) => {
        if (!selectedFile) return;
        resetState();
        setFile(selectedFile);
        setIsPreparing(true);
        setError(null);

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);
            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);
            
            const savedPage = localStorage.getItem(`socraticstudy-page-${selectedFile.name}`);
            if (savedPage && parseInt(savedPage, 10) <= pdf.numPages) {
                setCurrentPage(parseInt(savedPage, 10));
            }

            // Use backend page texts for consistency (and future server-side extraction)
            try {
              const uploaded = await uploadPdf(selectedFile);
              const store = await createVectorStore(uploaded.pages);
              setVectorStore(store);
            } catch (e) {
              const allText = await extractTextFromAllPages(pdf);
              const store = await createVectorStore(allText);
              setVectorStore(store);
            }

        } catch (err) {
            setError('Failed to load and process PDF. The file might be corrupted or unsupported.');
            console.error(err);
        } finally {
            setIsPreparing(false);
        }
    }, []);

    const handleSummarizeDocument = useCallback(async () => {
        if (!pdfDoc) return;

        setIsSummarizing(true);
        setSummaries([]);
        setAudioSrcs([]);
        setError(null);

        const newSummaries = new Array(pdfDoc.numPages).fill('');
        const newAudioSrcs = new Array(pdfDoc.numPages).fill(null);

        try {
            const allPagesText: string[] = [];
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const text = await extractTextFromPage(pdfDoc, i);
                allPagesText.push(text);
            }

            const globalContext = allPagesText.slice(0, 3).join('\n\n').substring(0, 2000);

            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const prevPageText = i > 1 ? allPagesText[i - 2] : '';
                const currentPageText = allPagesText[i - 1];
                const nextPageText = i < pdfDoc.numPages ? allPagesText[i] : '';
                
                const cacheKey = `ssum:${file?.name || 'unknown'}:${i}:${isEli5 ? 'eli5' : 'std'}`;
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    newSummaries[i - 1] = cached;
                } else if (!currentPageText.trim()) {
                    newSummaries[i - 1] = "No text content found on this page.";
                    localStorage.setItem(cacheKey, newSummaries[i - 1]);
                } else {
                    const generatedSummary = await summarizeApi(currentPageText, i);
                    newSummaries[i - 1] = generatedSummary;
                    localStorage.setItem(cacheKey, generatedSummary);
                }
                
                setSummaries([...newSummaries]);
                setSummarizationProgress((i / pdfDoc.numPages) * 100);
            }
        } catch (err) {
            setError('Failed to generate summaries. Please check your API key and try again.');
            console.error(err);
        } finally {
            setIsSummarizing(false);
            setSummarizationProgress(0);
        }
    }, [pdfDoc, isEli5]);

    const handleListen = useCallback(async () => {
        const summary = summaries[currentPage - 1];
        if (!summary) return;
        
        if (isPlaying && currentAudioSrc === audioSrcs[currentPage - 1]) {
            audioRef.current?.pause();
            return;
        }

        // Check cache first
        const audioKey = `saud:${file?.name || 'unknown'}:${currentPage}`;
        const cachedAudio = localStorage.getItem(audioKey);
        if (cachedAudio) {
            const [mime, base64] = cachedAudio.split(',', 2);
            const url = URL.createObjectURL(new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: mime || 'audio/wav' }));
            const newAudioSrcs = [...audioSrcs];
            newAudioSrcs[currentPage - 1] = url;
            setAudioSrcs(newAudioSrcs);
            setCurrentAudioSrc(url);
            return;
        }

        if (audioSrcs[currentPage - 1]) {
            setCurrentAudioSrc(audioSrcs[currentPage - 1]);
            return;
        }
        
        setIsLoadingAudio(true);
        setError(null);
        
        try {
            const audioUrl = await ttsApi(summary);
            const newAudioSrcs = [...audioSrcs];
            newAudioSrcs[currentPage - 1] = audioUrl;
            setAudioSrcs(newAudioSrcs);
            setCurrentAudioSrc(audioUrl);
        } catch (err) {
            setError('Failed to generate audio. Please try again.');
            console.error(err);
        } finally {
            setIsLoadingAudio(false);
        }
    }, [summaries, audioSrcs, currentPage, isPlaying, currentAudioSrc]);

    const handleAnswerDoubt = useCallback(async (question: string) => {
        if (!vectorStore) {
            throw new Error("Document not ready for Q&A.");
        }
        return await getAnswerFromLLM(question, vectorStore);
    }, [vectorStore]);

    useEffect(() => {
      if (currentAudioSrc && audioRef.current) {
        audioRef.current.src = currentAudioSrc;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
    }, [currentAudioSrc]);
    
    const exitFullscreen = async () => {
        if (document.exitFullscreen) await document.exitFullscreen();
    };

    const startFullscreenAutoplay = async () => {
        const container = viewerContainerRef.current as any;
        if (container?.requestFullscreen) {
            await container.requestFullscreen();
        }
        setIsAutoPlayMode(true);
        const audioEl = audioRef.current;
        if (!audioEl) return;
        const onEnded = async () => {
            if (!isAutoPlayMode || !pdfDoc) return;
            const next = currentPage + 1;
            if (next <= (pdfDoc?.numPages || 0)) {
                setCurrentPage(next);
                await handleListen();
            }
        };
        audioEl.onended = onEnded;
        await handleListen();
    };

    const stopAutoplay = () => {
        setIsAutoPlayMode(false);
        if (audioRef.current) {
            audioRef.current.onended = null;
            audioRef.current.pause();
        }
    };

    const goToNextInFullscreen = async () => {
        if (!pdfDoc) return;
        const next = currentPage + 1;
        if (next <= pdfDoc.numPages) {
            setCurrentPage(next);
            if (isFullscreen) {
                await handleListen();
            }
        }
    };

    const goToPrevInFullscreen = async () => {
        if (!pdfDoc) return;
        const prev = currentPage - 1;
        if (prev >= 1) {
            setCurrentPage(prev);
            if (isFullscreen) {
                await handleListen();
            }
        }
    };

    const togglePlayPause = async () => {
        const el = audioRef.current;
        if (!el) return;
        if (isPlaying) {
            el.pause();
        } else {
            await handleListen();
        }
    };

    // If user changes page during fullscreen autoplay, ensure audio follows
    useEffect(() => {
        if (isFullscreen && isAutoPlayMode) {
            handleListen();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, isFullscreen, isAutoPlayMode]);

    // Keyboard shortcuts in fullscreen: ←/→ for prev/next, Space for play/pause, Esc to exit
    useEffect(() => {
        if (!isFullscreen) return;
        const onKey = async (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                await goToPrevInFullscreen();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                await goToNextInFullscreen();
            } else if (e.key === ' ') {
                e.preventDefault();
                await togglePlayPause();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                await exitFullscreen();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isFullscreen, goToPrevInFullscreen, goToNextInFullscreen, togglePlayPause]);

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-800" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
            <header className="bg-white shadow-md w-full p-4 flex items-center justify-between z-10">
                <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-accent">
                      <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7l3-7z" />
                    </svg>
                    <h1 className="text-2xl font-bold text-gray-700">SocraticStudy</h1>
                </div>
                <div>
                    <button
                        onClick={resetState}
                        className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                        aria-label="Upload new PDF"
                    >
                        New PDF
                    </button>
                </div>
            </header>
            <main className="flex-grow flex flex-col lg:flex-row p-4 lg:p-6 gap-6">
                {!file ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <PdfUploader onFileChange={handleFileChange} />
                    </div>
                ) : (
                    <>
                        <div ref={viewerContainerRef} className="relative flex-1 flex flex-col lg:w-1/2 bg-white rounded-xl shadow-lg p-4">
                            <PdfViewer
                                pdfDoc={pdfDoc}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                            />
                            {isFullscreen && (
                              <>
                                <div className="absolute top-2 right-2 flex space-x-2">
                                  <button
                                    onClick={exitFullscreen}
                                    className="px-3 py-1.5 text-sm font-semibold rounded bg-gray-800 text-white hover:bg-black"
                                  >Exit Fullscreen</button>
                                  {isAutoPlayMode ? (
                                    <button onClick={stopAutoplay} className="px-3 py-1.5 text-sm font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700">Stop Autoplay</button>
                                  ) : (
                                    <button onClick={startFullscreenAutoplay} className="px-3 py-1.5 text-sm font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700">Start Autoplay</button>
                                  )}
                                </div>
                                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center space-x-3">
                                  <button onClick={goToPrevInFullscreen} className="px-3 py-2 text-sm font-semibold rounded bg-white/90 hover:bg-white shadow">Prev</button>
                                  <button onClick={togglePlayPause} className="px-3 py-2 text-sm font-semibold rounded bg-white/90 hover:bg-white shadow">{isPlaying ? 'Pause' : 'Play'}</button>
                                  <button onClick={goToNextInFullscreen} className="px-3 py-2 text-sm font-semibold rounded bg-white/90 hover:bg-white shadow">Next</button>
                                </div>
                              </>
                            )}
                        </div>
                <div className="flex-1 flex flex-col lg:w-1/2 bg-white rounded-xl shadow-lg p-6 gap-6">
                            <SummaryPanel
                                summary={summaries[currentPage - 1] || ''}
                                isSummarizing={isSummarizing}
                                summarizationProgress={summarizationProgress}
                                isLoadingAudio={isLoadingAudio}
                                isPlaying={isPlaying}
                                error={error}
                                onSummarize={handleSummarizeDocument}
                                onListen={handleListen}
                                hasPdf={!!pdfDoc}
                                hasSummaries={summaries.length > 0}
                                isEli5={isEli5}
                                setIsEli5={setIsEli5}
                                isPreparing={isPreparing}
                            />
                    <div className="flex justify-end">
                        <button
                          onClick={startFullscreenAutoplay}
                          disabled={!pdfDoc}
                          className="mt-2 inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gray-800 hover:bg-black disabled:bg-gray-300"
                        >
                          Fullscreen Auto-Play
                        </button>
                    </div>
                            <DoubtPanel 
                                onAnswerDoubt={handleAnswerDoubt}
                                isReady={!!vectorStore}
                            />
                        </div>
                    </>
                )}
            </main>
            <audio ref={audioRef} />
        </div>
    );
};

export default App;
