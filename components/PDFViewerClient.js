
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

    return (
        <div className="flex gap-4 h-[calc(100vh-80px)]" onMouseUp={handleTextSelection}>
            {/* Sidebar: Notes/Highlights */}
            <div className="w-1/4 card h-full scrollable hidden md:block">
                <h3>Highlights</h3>
                <p className="text-muted text-sm">Select text to explain.</p>
                {/* Placeholder for saved highlights */}
            </div>

            {/* Main Viewer */}
            <div className="flex-1 card h-full overflow-auto relative flex flex-col items-center bg-gray-100" ref={containerRef}>
                <Document
                    file={book.file_path}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="pdf-document"
                >
                    <Page
                        pageNumber={pageNumber}
                        width={containerRef.current ? containerRef.current.offsetWidth - 40 : 600}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                    />
                </Document>

                {/* Navigation */}
                <div className="sticky bottom-4 bg-white p-2 rounded shadow flex gap-4 items-center mt-4">
                    <button
                        disabled={pageNumber <= 1}
                        onClick={() => setPageNumber(prev => prev - 1)}
                        className="btn btn-secondary btn-sm"
                    >
                        Previous
                    </button>
                    <span>Page {pageNumber} of {numPages}</span>
                    <button
                        disabled={pageNumber >= numPages}
                        onClick={() => setPageNumber(prev => prev + 1)}
                        className="btn btn-secondary btn-sm"
                    >
                        Next
                    </button>
                </div>

                {/* Text Selection Popup */}
                {selection && !explanation && (
                    <div
                        className="absolute z-50 bg-black text-white px-3 py-1 rounded shadow-lg cursor-pointer flex items-center gap-2 transform -translate-x-1/2"
                        style={{ top: selection.top, left: selection.left + 50 }}
                        onClick={handleExplain}
                        onMouseDown={(e) => e.stopPropagation()} // Prevent deselection
                    >
                        <span>✨ Explain with AI</span>
                    </div>
                )}

                {/* AI Explanation Modal/Tooltip */}
                {(loadingAI || explanation) && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setExplanation(null)}>
                        <div className="bg-white p-6 rounded-lg max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-bold mb-2">AI Explanation</h3>
                            {loadingAI ? (
                                <div className="spinner mx-auto"></div>
                            ) : (
                                <>
                                    <p className="text-sm text-muted mb-4 p-2 bg-gray-50 rounded">"{selection?.text}"</p>
                                    <div className="prose">{explanation}</div>
                                    <button className="btn btn-primary w-full mt-4" onClick={() => setExplanation(null)}>Close</button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
