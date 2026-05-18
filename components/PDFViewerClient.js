
'use client';
import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactMarkdown from 'react-markdown';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { Button } from '@/components/ui';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewerClient({ book }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [selection, setSelection] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const [zoom, setZoom] = useState(1.2);

    const containerRef = useRef(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    const handleTextSelection = () => {
        const sel = window.getSelection();
        const text = sel.toString().trim();

        if (text.length > 5) {
            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setSelection({
                text,
                top: rect.top + window.scrollY - 40,
                left: rect.left + window.scrollX,
            });
        } else {
            setSelection(null);
        }
    };

    const handleExplain = async () => {
        if (!selection) return;
        setLoadingAI(true);
        setExplanation(null);

        try {
            const res = await fetch('/api/ncert/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: selection.text, bookId: book.id })
            });
            const data = await res.json();
            setExplanation(data.explanation);
        } catch (err) {
            console.error(err);
            setExplanation('Failed to get explanation.');
        } finally {
            setLoadingAI(false);
        }
    };

    const zoomIn = () => setZoom(z => Math.min(z + 0.2, 3.0));
    const zoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));

    return (
        <div className="flex gap-4 h-full surface_gray_900" onMouseUp={handleTextSelection}>
            {/* Sidebar: Notes/Highlights */}
            <div className="w-1/4 card h-full scrollable hidden lg:block surface_gray_950 border-r line_gray_800 radius_none">
                <h3 className="text-xl font-bold tone_white space_mb_2">Highlights</h3>
                <p className="tone_gray_400 text-sm">Select text in the PDF to explain concepts with AI.</p>
                {/* Placeholder for saved highlights */}
                <div className="space_mt_8 space_pa_4 surface_gray_900 radius_lg border line_gray_800">
                    <div className="text-center tone_gray_500 text-sm">
                        No highlights saved yet.
                    </div>
                </div>
            </div>

            {/* Main Viewer */}
            <div className="flex-1 h-full overflow-auto relative flex flex-col items-center surface_gray_800 space_pa_4" ref={containerRef}>

                {/* Top Controls Toolbar */}
                <div className="sticky top-0 z-40 surface_gray_900_90 backdrop-blur border line_gray_700 space_pa_3 radius_xl shadow-lg flex gap-6 items-center space_mb_6 w-full max-w-4xl justify-between">
                    <div className="flex items-center gap-2">
                        <span className="tone_white font-medium text-sm">
                            {numPages ? `${numPages} Pages` : 'Loading...'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={zoomOut} aria-label="Zoom Out" className="w-11 h-11 flex items-center justify-center radius_lg surface_gray_800 tone_white hover_surface_gray_700 space_pa_2" title="Zoom Out">
                            -
                        </Button>
                        <span className="tone_gray_300 text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <Button variant="ghost" size="sm" onClick={zoomIn} aria-label="Zoom In" className="w-11 h-11 flex items-center justify-center radius_lg surface_gray_800 tone_white hover_surface_gray_700 space_pa_2" title="Zoom In">
                            +
                        </Button>
                    </div>
                </div>

                <div className="space_mb_20 w-full flex flex-col items-center" style={{ minHeight: 800 }}>
                    <Document
                        file={book.file_path}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="pdf-document flex flex-col gap-6"
                        loading={<div className="space_pa_20 text-center tone_gray_400 font-bold">Loading PDF...</div>}
                    >
                        {Array.from(new Array(numPages || 0), (el, index) => (
                            <div key={`page_${index + 1}`} className="shadow-2xl surface_white radius_lg overflow-hidden">
                                <Page
                                    pageNumber={index + 1}
                                    scale={zoom}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    className="surface_white"
                                />
                            </div>
                        ))}
                    </Document>
                </div>

                {/* Text Selection Popup */}
                {selection && !explanation && (
                    <div
                        className="absolute z-50 surface_blue_600 hover_surface_blue_500 tone_white space_px_4 space_py_2 radius_lg shadow-xl cursor-pointer flex items-center gap-2 transform -translate-x-1/2 transition-colors border line_blue_400 font-bold"
                        style={{ top: selection.top, left: selection.left + 50 }}
                        onClick={handleExplain}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        ✨ Explain with AI
                    </div>
                )}

                {/* AI Explanation Modal */}
                {(loadingAI || explanation) && (
                    <div className="fixed inset-0 surface_black_80 flex items-center justify-center z-[100] space_pa_4" onClick={() => setExplanation(null)}>
                        <div className="surface_gray_900 border line_gray_700 shadow-2xl space_pa_6 radius_2xl max-w-lg w-full tone_white space_ma_4" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center space_mb_4 space_pb_4 border-b line_gray_800">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold flex items-center gap-2 space_ma_0">✨ AI Explanation</h3>
                                    {!loadingAI && <TrustBadge type="ai-confidence" meta={{ score: 0.95 }} />}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setExplanation(null)} aria-label="Close explanation" className="w-11 h-11 flex items-center justify-center tone_gray_400 hover_tone_white text-2xl space_pa_2" style={{ margin: '-12px -12px 0 0' }}>×</Button>
                            </div>

                            {loadingAI ? (
                                <div className="space_py_10 text-center">
                                    <div className="spinner mx-auto space_mb_4 line_blue_500"></div>
                                    <p className="tone_gray_400">Analyzing NCERT concept...</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="space_mb_6 space_pa_4 surface_gray_950 border line_gray_800 radius_xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full surface_blue_500"></div>
                                        <p className="text-sm tone_gray_300 italic">"{selection?.text}"</p>
                                    </div>
                                    <div className="prose prose-invert max-w-none tone_gray_200">
                                        <ReactMarkdown>{explanation}</ReactMarkdown>
                                    </div>
                                    <Button className="w-full space_mt_6 space_py_3 font-bold text-lg radius_xl" onClick={() => setExplanation(null)}>
                                        Got it!
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
