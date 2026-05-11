'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, Button } from '@/components/ui';

// ── Image Validation Helpers ──
function validateImage(file) {
    const MAX_SIZE_MB = 15;
    const MIN_DIMENSION = 300;
    const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const SUPPORTED_PDF = 'application/pdf';

    if (!file) return { valid: false, error: 'No file selected.' };

    const isPdf = file.type === SUPPORTED_PDF;
    const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);

    if (!isImage && !isPdf) {
        return { valid: false, error: `Unsupported format: ${file.type || 'unknown'}. Use JPG, PNG, WebP, or PDF.` };
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
        return { valid: false, error: `File too large (${sizeMB.toFixed(1)}MB). Maximum is ${MAX_SIZE_MB}MB.` };
    }

    if (isPdf) {
        return { valid: true, isPdf: true, sizeLabel: `PDF · ${sizeMB.toFixed(1)}MB` };
    }

    return { valid: true, isPdf: false, sizeLabel: `${sizeMB.toFixed(1)}MB` };
}

function checkImageDimensions(base64) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            if (img.width < 300 || img.height < 300) {
                resolve({ warning: `Image is very small (${img.width}×${img.height}px). A clearer photo will improve accuracy.` });
            } else {
                resolve({ warning: null, width: img.width, height: img.height });
            }
        };
        img.onerror = () => resolve({ warning: null });
        img.src = base64;
    });
}

export default function OMRScannerPage() {

    // Core App State
    const [tests, setTests] = useState([]);
    const [testsLoading, setTestsLoading] = useState(true);
    const [selectedTestId, setSelectedTestId] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileInfo, setFileInfo] = useState(null); // { sizeLabel, isPdf, warning }
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState(null);

    // Verification Grid State
    const [needsVerification, setNeedsVerification] = useState(false);
    const [scannedAnswers, setScannedAnswers] = useState({});

    // Grading State
    const [isGrading, setIsGrading] = useState(false);
    const [finalResult, setFinalResult] = useState(null);

    // Refs for hidden file inputs
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    useEffect(() => {
        async function fetchTests() {
            try {
                const res = await fetch('/api/omr/tests');
                const data = await res.json();
                if (data.tests && data.tests.length > 0) {
                    setTests(data.tests);
                    setSelectedTestId(data.tests[0].id);
                }
            } catch (e) {
                // silently fail — empty state handled in UI
            }
            setTestsLoading(false);
        }
        fetchTests();
    }, []);

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const processFile = async (file) => {
        if (!file) return;

        // Validate format and size
        const validation = validateImage(file);
        if (!validation.valid) {
            setScanError(validation.error);
            return;
        }

        setScanError(null);
        setFinalResult(null);

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setSelectedFile(file);

        // Check dimensions for images (not PDFs)
        const info = { sizeLabel: validation.sizeLabel, isPdf: validation.isPdf, warning: null };
        if (!validation.isPdf) {
            const dimCheck = await checkImageDimensions(previewUrl);
            info.warning = dimCheck.warning;
        }
        setFileInfo(info);
    };

    const handleFileSelect = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        processFile(e.target.files[0]);
        // Reset input so the same file can be re-selected
        e.target.value = '';
    };

    const handleVisionScan = async () => {
        if (!selectedFile || !selectedTestId) {
            setScanError('Please select a test and capture/upload your OMR sheet first.');
            return;
        }

        setIsScanning(true);
        setScanError(null);

        try {
            // Generate base64 only right before sending to keep memory free
            const base64String = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(selectedFile);
            });
            const pureBase64 = base64String.split(',')[1];

            const res = await fetch('/api/omr/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: pureBase64,
                    testId: selectedTestId
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setScanError(data.reason || 'Couldn\'t detect bubbles clearly. Try better lighting or upload a clearer image.');
                setIsScanning(false);
                return;
            }

            setScannedAnswers(data.answers || {});
            setNeedsVerification(true);

        } catch (e) {
            setScanError('Couldn\'t detect bubbles clearly. Please try again with better lighting or a clearer photo.');
        }
        setIsScanning(false);
    };

    const handleBubbleCorrection = (qNum, newValue) => {
        setScannedAnswers(prev => ({
            ...prev,
            [qNum]: newValue
        }));
    };

    const handleGradeSubmit = async () => {
        // Pre-grade validation
        const selectedTest = tests.find(t => t.id === selectedTestId);
        const expectedTotal = selectedTest?.total_questions || 180;
        const answeredCount = Object.values(scannedAnswers).filter(v => v && v !== '-' && v !== '').length;
        const skippedCount = expectedTotal - answeredCount;
        
        // Reject if less than 10% questions answered — likely a bad scan
        if (answeredCount < Math.max(5, expectedTotal * 0.1)) {
            setScanError(`Only ${answeredCount} answers detected out of ${expectedTotal} questions. The scan quality may be too low. Please re-scan with better lighting.`);
            return;
        }

        // Warn if more than 50% skipped (but allow submission)
        if (skippedCount > expectedTotal * 0.5) {
            const proceed = window.confirm(
                `${skippedCount} out of ${expectedTotal} questions appear unanswered.\n\n` +
                `This could mean:\n` +
                `• Some bubbles weren't detected clearly\n` +
                `• You intentionally skipped those questions\n\n` +
                `Do you want to grade with ${answeredCount} answers?`
            );
            if (!proceed) return;
        }

        setIsGrading(true);
        try {
            const res = await fetch('/api/omr/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    verifiedAnswers: scannedAnswers,
                    testId: selectedTestId
                })
            });

            const data = await res.json();
            if (res.ok) {
                setNeedsVerification(false);
                setFinalResult(data);
            } else {
                setScanError(data.error);
            }
        } catch (e) {
            setScanError('Failed to grade answers. Please try again.');
        }
        setIsGrading(false);
    };

    const resetScanner = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setFinalResult(null);
        setImagePreview(null);
        setSelectedFile(null);
        setFileInfo(null);
        setScanError(null);
        setNeedsVerification(false);
        setScannedAnswers({});
    };

    return (
        <div className="page" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px 120px', minHeight: '100vh' }}>

            <header style={{ marginBottom: '32px', textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>📸</span>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '4px', color: 'var(--text-primary)' }}>OMR Scanner</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Scan your offline answer sheet & get instant results</p>
            </header>

            {/* ERROR BANNER */}
            {scanError && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--danger)',
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '24px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-start',
                    lineHeight: 1.5,
                }}>
                    <span style={{ flexShrink: 0 }}>⚠️</span>
                    <span>{scanError}</span>
                </div>
            )}

            {/* ═══ FINAL RESULT STATE ═══ */}
            {finalResult ? (
                <div className="animate-fade-in">
                    <Card style={{ textAlign: 'center', padding: '40px 16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))', border: '1px solid var(--accent-primary)', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '8px' }}>{finalResult.score} / {finalResult.totalPossible}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '20px' }}>Accuracy: <span style={{ color: 'var(--text-primary)' }}>{finalResult.accuracy}%</span></p>

                        {/* Correct / Wrong / Skipped stats */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px 16px', borderRadius: 'var(--radius-md)', minWidth: '80px' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)' }}>✓ {finalResult.correct || 0}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Correct</div>
                            </div>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px 16px', borderRadius: 'var(--radius-md)', minWidth: '80px' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--danger)' }}>✗ {finalResult.wrong || 0}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Wrong</div>
                            </div>
                            <div style={{ background: 'rgba(148, 163, 184, 0.1)', padding: '10px 16px', borderRadius: 'var(--radius-md)', minWidth: '80px' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-secondary)' }}>— {finalResult.skipped || 0}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Skipped</div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--success)', fontWeight: 700, marginBottom: '4px' }}>Estimated NEET Rank</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{finalResult.estimatedRankRange}</span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{finalResult.communityInsight}</p>
                    </Card>

                    {/* Post-grade actions — learning loop */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <a href="/mistakes" style={{ textDecoration: 'none', display: 'block' }}>
                            <Button variant="primary" style={{ width: '100%', minHeight: '48px' }}>
                                📝 View My Mistakes
                            </Button>
                        </a>
                        <a href="/dashboard" style={{ textDecoration: 'none', display: 'block' }}>
                            <Button variant="secondary" style={{ width: '100%', minHeight: '48px' }}>
                                📊 Go to Dashboard
                            </Button>
                        </a>
                        <Button variant="secondary" style={{ width: '100%', minHeight: '48px' }} onClick={resetScanner}>
                            📸 Scan Another Sheet
                        </Button>
                    </div>
                </div>
            )

            /* ═══ VERIFICATION STATE ═══ */
            : needsVerification ? (
                <div className="animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--warning)' }}>Verify extracted answers</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tap to correct</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px', marginBottom: '32px', maxHeight: '400px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)' }}>
                        {Object.keys(scannedAnswers).map(qNum => (
                            <div key={qNum} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-card)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '16px', textAlign: 'right' }}>{qNum}.</span>
                                <select
                                    className="input"
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, padding: '4px', cursor: 'pointer', outline: 'none', width: '40px' }}
                                    value={scannedAnswers[qNum] || ''}
                                    onChange={(e) => handleBubbleCorrection(qNum, e.target.value)}
                                >
                                    <option value="" style={{ background: 'var(--bg-card)' }}>-</option>
                                    <option value="A" style={{ background: 'var(--bg-card)' }}>A</option>
                                    <option value="B" style={{ background: 'var(--bg-card)' }}>B</option>
                                    <option value="C" style={{ background: 'var(--bg-card)' }}>C</option>
                                    <option value="D" style={{ background: 'var(--bg-card)' }}>D</option>
                                </select>
                            </div>
                        ))}
                    </div>

                    <Button variant="success" onClick={handleGradeSubmit} disabled={isGrading} className="critical-flow" style={{ width: '100%', marginBottom: '12px', minHeight: '48px' }}>
                        {isGrading ? 'Grading your answers...' : 'Lock Answers & Grade →'}
                    </Button>
                    <Button variant="secondary" onClick={resetScanner} style={{ width: '100%', minHeight: '48px' }}>
                        Cancel & Rescan
                    </Button>
                </div>
            )

            /* ═══ INITIAL UPLOAD STATE ═══ */
            : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                    {/* Step 1: Select Test */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            1. Select Test Paper
                        </label>
                        {testsLoading ? (
                            <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-md)' }} />
                        ) : tests.length === 0 ? (
                            <Card style={{ padding: '16px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>No test papers available yet.</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>PYQ papers will appear here once uploaded.</p>
                            </Card>
                        ) : (
                            <>
                                <select
                                    className="input"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        minHeight: '48px',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                    }}
                                    value={selectedTestId}
                                    onChange={(e) => setSelectedTestId(e.target.value)}
                                >
                                    {tests.map(t => (
                                        <option key={t.id} value={t.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                                            {t.test_name} ({t.total_questions} Qs)
                                        </option>
                                    ))}
                                </select>
                                {/* Subject breakdown */}
                                {(() => {
                                    const selected = tests.find(t => t.id === selectedTestId);
                                    if (selected?.subject_breakdown) {
                                        return (
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '8px 12px',
                                                background: 'rgba(99, 102, 241, 0.06)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                                fontWeight: 500,
                                            }}>
                                                📋 {selected.subject_breakdown}
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </>
                        )}
                    </div>

                    {/* Step 2: Capture OMR Sheet */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            2. Capture OMR Sheet
                        </label>

                        {/* Dual Capture Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            {/* Camera Button */}
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '20px 12px',
                                    minHeight: '100px',
                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
                                    border: '2px solid rgba(99,102,241,0.3)',
                                    borderRadius: 'var(--radius-lg)',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit',
                                    transition: 'border-color var(--transition-fast), background var(--transition-fast)',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                            >
                                <span style={{ fontSize: '2rem' }}>📷</span>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Take Photo</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open camera</span>
                            </button>

                            {/* Gallery/PDF Button */}
                            <button
                                onClick={() => galleryInputRef.current?.click()}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '20px 12px',
                                    minHeight: '100px',
                                    background: 'var(--bg-glass)',
                                    border: '2px solid var(--border-color)',
                                    borderRadius: 'var(--radius-lg)',
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit',
                                    transition: 'border-color var(--transition-fast), background var(--transition-fast)',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-glow)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                            >
                                <span style={{ fontSize: '2rem' }}>🖼️</span>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Upload from Gallery</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Photo or PDF</span>
                            </button>
                        </div>

                        {/* Hidden File Inputs */}
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        {/* Image Preview */}
                        {imagePreview && (
                            <Card style={{ padding: '0', overflow: 'hidden', position: 'relative', marginBottom: '8px' }}>
                                {fileInfo?.isPdf ? (
                                    <div style={{
                                        padding: '32px',
                                        textAlign: 'center',
                                        background: 'var(--bg-glass)',
                                    }}>
                                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>📄</span>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>PDF Uploaded</span>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{fileInfo.sizeLabel}</div>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={imagePreview}
                                            alt="OMR Sheet Preview"
                                            style={{
                                                width: '100%',
                                                maxHeight: '300px',
                                                objectFit: 'contain',
                                                display: 'block',
                                                background: '#000',
                                            }}
                                        />
                                        {fileInfo?.sizeLabel && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '8px',
                                                right: '8px',
                                                background: 'rgba(0,0,0,0.7)',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                            }}>
                                                {fileInfo.sizeLabel}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Re-capture button */}
                                <button
                                    onClick={resetScanner}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: 'rgba(0,0,0,0.6)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    title="Remove and re-capture"
                                >
                                    ✕
                                </button>
                            </Card>
                        )}

                        {/* Dimension Warning */}
                        {fileInfo?.warning && (
                            <div style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                color: 'var(--warning)',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.85rem',
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                            }}>
                                <span>⚠️</span> {fileInfo.warning}
                            </div>
                        )}
                    </div>

                    {/* Step 3: Extract */}
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleVisionScan}
                        disabled={!imagePreview || isScanning || !selectedTestId}
                        className="critical-flow"
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem', minHeight: '56px' }}
                    >
                        {isScanning ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <div className="spinner" style={{ width: '20px', height: '20px' }} />
                                Analyzing OMR Sheet…
                            </span>
                        ) : 'Extract Answers'}
                    </Button>
                </div>
            )}
        </div>
    );
}
