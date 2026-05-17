'use client';
import { Icon } from '@/components/ui/Icon';
import { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Select } from '@/components/ui';
import { TrustBadge } from '@/components/trust/TrustBadge';
import { useMutation } from '@tanstack/react-query';
import { isInsideNativeApp } from '@/lib/platform';

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
    const [scanError, setScanError] = useState(null);
    const cameraCaptureMode = isInsideNativeApp() ? undefined : 'environment';

    // Verification Grid State
    const [needsVerification, setNeedsVerification] = useState(false);
    const [scannedAnswers, setScannedAnswers] = useState({});
    const [lastSaved, setLastSaved] = useState(null);

    // Draft persistence
    useEffect(() => {
        const draft = localStorage.getItem('omr_draft');
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                if (parsed.testId && parsed.answers && Object.keys(parsed.answers).length > 0) {
                    setSelectedTestId(parsed.testId);
                    setScannedAnswers(parsed.answers);
                    setNeedsVerification(true);
                }
            } catch(e) {}
        }
    }, []);

    useEffect(() => {
        if (!needsVerification) return;
        const t = setTimeout(() => {
            localStorage.setItem('omr_draft', JSON.stringify({ answers: scannedAnswers, testId: selectedTestId }));
            setLastSaved(Date.now());
        }, 1000);
        return () => clearTimeout(t);
    }, [scannedAnswers, needsVerification, selectedTestId]);

    // Grading State
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

    const scanMutation = useMutation({
        mutationFn: async ({ pureBase64, selectedTestId }) => {
            const res = await fetch('/api/omr/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: pureBase64,
                    testId: selectedTestId
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.reason || "Couldn't detect bubbles clearly. Try better lighting or upload a clearer image.");
            return data;
        },
        onSuccess: (data) => {
            setScannedAnswers(data.answers || {});
            setNeedsVerification(true);
        },
        onError: (error) => {
            setScanError(error.message);
        }
    });

    const handleVisionScan = async () => {
        if (!selectedFile || !selectedTestId) {
            setScanError('Please select a test and capture/upload your OMR sheet first.');
            return;
        }

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

            scanMutation.mutate({ pureBase64, selectedTestId });

        } catch (e) {
            setScanError("Couldn't read the file. Please try again.");
        }
    };

    const handleBubbleCorrection = (qNum, newValue) => {
        setScannedAnswers(prev => ({
            ...prev,
            [qNum]: newValue
        }));
    };

    const gradeMutation = useMutation({
        mutationFn: async ({ scannedAnswers, selectedTestId }) => {
            const res = await fetch('/api/omr/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    verifiedAnswers: scannedAnswers,
                    testId: selectedTestId
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to grade answers.');
            return data;
        },
        onSuccess: (data) => {
            setNeedsVerification(false);
            localStorage.removeItem('omr_draft');
            setFinalResult(data);
        },
        onError: (error) => {
            setScanError(error.message);
        }
    });

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

        gradeMutation.mutate({ scannedAnswers, selectedTestId });
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
        localStorage.removeItem('omr_draft');
        setLastSaved(null);
    };

    return (
        <div className="page omr-wrapper">

            <header className="omr-header">
                <span className="omr-header-icon"><Icon name="Star" size={16} /></span>
                <h1 className="omr-title">OMR Scanner</h1>
                <p className="omr-subtitle">Scan your offline answer sheet &amp; get instant results</p>
            </header>

            {/* ERROR BANNER */}
            {scanError && (
                <div className="omr-error-banner">
                    <span className="omr-error-icon"><Icon name="AlertCircle" /></span>
                    <span>{scanError}</span>
                </div>
            )}

            {/* ═══ FINAL RESULT STATE ═══ */}
            {finalResult ? (
                <div className="animate-fade-in">
                    <Card className="omr-result-card">
                        <h2 className="omr-result-score">{finalResult.score} / {finalResult.totalPossible}</h2>
                        <p className="omr-result-accuracy">Accuracy: <span className="omr-result-accuracy-val">{finalResult.accuracy}%</span></p>

                        {/* Correct / Wrong / Skipped stats */}
                        <div className="omr-stats-container">
                            <div className="omr-stat-box omr-stat-box--correct">
                                <div className="omr-stat-val--correct"><Icon name="Star" size={16} /> {finalResult.correct || 0}</div>
                                <div className="omr-stat-label">Correct</div>
                            </div>
                            <div className="omr-stat-box omr-stat-box--wrong">
                                <div className="omr-stat-val--wrong"><Icon name="Star" size={16} /> {finalResult.wrong || 0}</div>
                                <div className="omr-stat-label">Wrong</div>
                            </div>
                            <div className="omr-stat-box omr-stat-box--skipped">
                                <div className="omr-stat-val--skipped">— {finalResult.skipped || 0}</div>
                                <div className="omr-stat-label">Skipped</div>
                            </div>
                        </div>

                        <div className="omr-rank-box">
                            <span className="omr-rank-label">Estimated NEET Rank</span>
                            <span className="omr-rank-val">{finalResult.estimatedRankRange}</span>
                        </div>

                        <p className="omr-insight">{finalResult.communityInsight}</p>
                    </Card>

                    {/* Post-grade actions — learning loop */}
                    <div className="omr-actions">
                        <a href="/mistakes" style={{ textDecoration: 'none', display: 'block' }}>
                            <Button variant="primary" className="omr-action-btn">
                                <Icon name="FileText" /> View My Mistakes
                            </Button>
                        </a>
                        <a href="/dashboard" style={{ textDecoration: 'none', display: 'block' }}>
                            <Button variant="secondary" className="omr-action-btn">
                                <Icon name="BarChart2" /> Go to Dashboard
                            </Button>
                        </a>
                        <Button variant="secondary" className="omr-action-btn" onClick={resetScanner}>
                            📸 Scan Another Sheet
                        </Button>
                    </div>
                </div>
            )

            /* ═══ VERIFICATION STATE ═══ */
            : needsVerification ? (
                <div className="animate-fade-in">
                    <div className="omr-verify-header">
                        <div>
                            <h3 className="omr-verify-title">
                                Verify extracted answers
                                {lastSaved && <TrustBadge type="autosave" meta={{ seconds: Math.floor((Date.now() - lastSaved)/1000) }} />}
                            </h3>
                        </div>
                        <span className="omr-verify-hint">Tap to correct</span>
                    </div>

                    <div className="omr-verify-grid">
                        {Object.keys(scannedAnswers).map(qNum => (
                            <div key={qNum} className="omr-verify-item">
                                <span className="omr-verify-num">{qNum}.</span>
                                <Select
                                    className="input omr-verify-select"
                                    value={scannedAnswers[qNum] || ''}
                                    onChange={(e) => handleBubbleCorrection(qNum, e.target.value)}
                                >
                                    <option value="" className="omr-verify-option">-</option>
                                    <option value="A" className="omr-verify-option">A</option>
                                    <option value="B" className="omr-verify-option">B</option>
                                    <option value="C" className="omr-verify-option">C</option>
                                    <option value="D" className="omr-verify-option">D</option>
                                </Select>
                            </div>
                        ))}
                    </div>

                    <Button variant="success" onClick={handleGradeSubmit} disabled={gradeMutation.isPending} className="critical-flow omr-action-btn" style={{ marginBottom: 12 }}>
                        {gradeMutation.isPending ? 'Grading your answers...' : 'Lock Answers & Grade →'}
                    </Button>
                    <Button variant="secondary" onClick={resetScanner} className="omr-action-btn">
                        Cancel &amp; Rescan
                    </Button>
                </div>
            )

            /* ═══ INITIAL UPLOAD STATE ═══ */
            : (
                <div className="omr-step-container">

                    {/* Step 1: Select Test */}
                    <div>
                        <label className="omr-step-label">
                            1. Select Test Paper
                        </label>
                        {testsLoading ? (
                            <div className="skeleton" style={{ height: 48, }} />
                        ) : tests.length === 0 ? (
                            <Card className="omr-empty-tests">
                                <p className="omr-empty-text">No test papers available yet.</p>
                                <p className="omr-empty-subtext">PYQ papers will appear here once uploaded.</p>
                            </Card>
                        ) : (
                            <>
                                <Select
                                    className="input omr-test-select"
                                    value={selectedTestId}
                                    onChange={(e) => setSelectedTestId(e.target.value)}
                                >
                                    {tests.map(t => (
                                        <option key={t.id} value={t.id} className="omr-test-option">
                                            {t.test_name} ({t.total_questions} Qs)
                                        </option>
                                    ))}
                                </Select>
                                {/* Subject breakdown */}
                                {(() => {
                                    const selected = tests.find(t => t.id === selectedTestId);
                                    if (selected?.subject_breakdown) {
                                        return (
                                            <div className="omr-subject-breakdown">
                                                <Icon name="FileText" /> {selected.subject_breakdown}
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
                        <label className="omr-step-label-mb12">
                            2. Capture OMR Sheet
                        </label>

                        {/* Dual Capture Buttons */}
                        <div className="omr-capture-grid">
                            {/* Camera Button */}
                            <Button
                                onClick={() => cameraInputRef.current?.click()}
                                className="omr-capture-btn omr-capture-btn--camera"
                                variant="ghost"
                            >
                                <span className="omr-capture-icon"><Icon name="Star" size={16} /></span>
                                <span className="omr-capture-title">Take Photo</span>
                                <span className="omr-capture-subtitle">Open camera</span>
                            </Button>

                            {/* Gallery/PDF Button */}
                            <Button
                                onClick={() => galleryInputRef.current?.click()}
                                className="omr-capture-btn omr-capture-btn--gallery"
                                variant="ghost"
                            >
                                <span className="omr-capture-icon"><Icon name="Star" size={16} />️</span>
                                <span className="omr-capture-title">Upload from Gallery</span>
                                <span className="omr-capture-subtitle">Photo or PDF</span>
                            </Button>
                        </div>

                        {/* Hidden File Inputs */}
                        <Input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture={cameraCaptureMode}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <Input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        {/* Image Preview */}
                        {imagePreview && (
                            <Card className="omr-preview-card">
                                {fileInfo?.isPdf ? (
                                    <div className="omr-preview-pdf">
                                        <span className="omr-preview-pdf-icon"><Icon name="Star" size={16} /></span>
                                        <span className="omr-preview-pdf-title">PDF Uploaded</span>
                                        <div className="omr-preview-pdf-size">{fileInfo.sizeLabel}</div>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={imagePreview}
                                            alt="OMR Sheet Preview"
                                            className="omr-preview-img"
                                        />
                                        {fileInfo?.sizeLabel && (
                                            <div className="omr-preview-size">
                                                {fileInfo.sizeLabel}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Re-capture button */}
                                <Button
                                    onClick={resetScanner}
                                    className="omr-preview-close"
                                    title="Remove and re-capture"
                                    variant="ghost"
                                >
                                    ✕
                                </Button>
                            </Card>
                        )}

                        {/* Dimension Warning */}
                        {fileInfo?.warning && (
                            <div className="omr-dim-warning">
                                <span><Icon name="AlertCircle" /></span> {fileInfo.warning}
                            </div>
                        )}
                    </div>

                    {/* Step 3: Extract */}
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleVisionScan}
                        disabled={!imagePreview || scanMutation.isPending || !selectedTestId}
                        className="critical-flow omr-extract-btn"
                    >
                        {scanMutation.isPending ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <div className="spinner" style={{ width: 20, height: 20 }} />
                                Analyzing OMR Sheet…
                            </span>
                        ) : 'Extract Answers'}
                    </Button>
                </div>
            )}
        </div>
    );
}
