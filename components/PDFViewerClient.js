
'use client';
import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
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
        <div className="flex gap-4 h-full bg-gray-900" onMouseUp={handleTextSelection}>
            {/* Sidebar: Notes/Highlights */}
            <div className="w-1/4 card h-full scrollable hidden lg:block bg-gray-950 border-r border-gray-800 rounded-none">
                <h3 className="text-xl font-bold text-white mb-2">Highlights</h3>
                <p className="text-gray-400 text-sm">Select text in the PDF to explain concepts with AI.</p>
                {/* Placeholder for saved highlights */}
                <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <div className="text-center text-gray-500 text-sm">
                        No highlights saved yet.
                    </div>
                </div>
            </div>

            {/* Main Viewer */}
            <div className="flex-1 h-full overflow-auto relative flex flex-col items-center bg-gray-800 p-4" ref={containerRef}>

                {/* Top Controls Toolbar */}
                <div className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur border border-gray-700 p-3 rounded-xl shadow-lg flex gap-6 items-center mb-6 w-full max-w-4xl justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">
                            {numPages ? `${numPages} Pages` : 'Loading...'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-white hover:bg-gray-700" title="Zoom Out">
                            -
                        </button>
                        <span className="text-gray-300 text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={zoomIn} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-white hover:bg-gray-700" title="Zoom In">
                            +
                        </button>
                    </div>
                </div>

                <div className="mb-20 w-full flex flex-col items-center" style={{ minHeight: 800 }}>
                    <Document
                        file={book.file_path}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="pdf-document flex flex-col gap-6"
                        loading={<div className="p-20 text-center text-gray-400 font-bold">Loading PDF...</div>}
                    >
                        {Array.from(new Array(numPages || 0), (el, index) => (
                            <div key={`page_${index + 1}`} className="shadow-2xl bg-white rounded-lg overflow-hidden">
                                <Page
                                    pageNumber={index + 1}
                                    scale={zoom}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    className="bg-white"
                                />
                            </div>
                        ))}
                    </Document>
                </div>

                {/* Text Selection Popup */}
                {selection && !explanation && (
                    <div
                        className="absolute z-50 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-xl cursor-pointer flex items-center gap-2 transform -translate-x-1/2 transition-colors border border-blue-400 font-bold"
                        style={{ top: selection.top, left: selection.left + 50 }}
                        onClick={handleExplain}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        ✨ Explain with AI
                    </div>
                )}

                {/* AI Explanation Modal */}
                {(loadingAI || explanation) && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => setExplanation(null)}>
                        <div className="bg-gray-900 border border-gray-700 shadow-2xl p-6 rounded-2xl max-w-lg w-full text-white m-4" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-800">
                                <h3 className="text-xl font-bold flex items-center gap-2">✨ AI Explanation</h3>
                                <button onClick={() => setExplanation(null)} className="text-gray-400 hover:text-white text-xl">×</button>
                            </div>

                            {loadingAI ? (
                                <div className="py-10 text-center">
                                    <div className="spinner mx-auto mb-4 border-blue-500"></div>
                                    <p className="text-gray-400">Analyzing NCERT concept...</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-6 p-4 bg-gray-950 border border-gray-800 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                        <p className="text-sm text-gray-300 italic">"{selection?.text}"</p>
                                    </div>
                                    <div className="prose prose-invert max-w-none text-gray-200">
                                        {/* Mock explanation formatting - in reality this would ideally be markdown rendered */}
                                        <div dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br/>') }} />
                                    </div>
                                    <button className="btn btn-primary w-full mt-6 py-3 font-bold text-lg rounded-xl" onClick={() => setExplanation(null)}>
                                        Got it!
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
