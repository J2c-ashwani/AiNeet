'use client';
import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/utils/supabase/client';
import { Card, Button } from '@/components/ui';

export default function OMRScannerPage() {
    const supabase = createSupabaseClient();
    
    // Core App State
    const [tests, setTests] = useState([]);
    const [selectedTestId, setSelectedTestId] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState(null);
    
    // Verification Grid State (MD Mandate 1)
    const [needsVerification, setNeedsVerification] = useState(false);
    const [scannedAnswers, setScannedAnswers] = useState({});
    
    // Final Identity State
    const [isGrading, setIsGrading] = useState(false);
    const [finalResult, setFinalResult] = useState(null);

    useEffect(() => {
        async function fetchTests() {
            const { data } = await supabase.from('offline_tests').select('id, test_name, provider');
            if (data) {
                setTests(data);
                if (data.length > 0) setSelectedTestId(data[0].id);
            }
        }
        fetchTests();
    }, [supabase]);

    const handleCameraCapture = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setImagePreview(base64String);
            const pureBase64 = base64String.split(',')[1];
            setImageBase64(pureBase64);
            setScanError(null);
            setFinalResult(null);
        };
        reader.readAsDataURL(file);
    };

    const handleVisionScan = async () => {
        if (!imageBase64 || !selectedTestId) return alert('Select a test and take a photo of your OMR.');
        
        setIsScanning(true);
        setScanError(null);
        
        try {
            const res = await fetch('/api/omr/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    imageBase64, 
                    testId: selectedTestId 
                })
            });

            const data = await res.json();
            
            // MD Safeguard: Quality Gate
            if (!res.ok) {
                setScanError(data.reason || 'Failed to scan image.');
                setIsScanning(false);
                return;
            }

            setScannedAnswers(data.answers || {});
            setNeedsVerification(true);
            
        } catch (e) {
            setScanError('Network or vision architecture error.');
        }
        setIsScanning(false);
    };

    // Allows user to manually fix AI hallucinated bubbles
    const handleBubbleCorrection = (qNum, newValue) => {
        setScannedAnswers(prev => ({
            ...prev,
            [qNum]: newValue
        }));
    };

    const handleIdentityInjection = async () => {
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
            setScanError('Failed to inject tracking data.');
        }
        setIsGrading(false);
    };

    return (
        <div className="page" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh' }}>
            
            <header style={{ marginBottom: '32px', textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>📸</span>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '4px', color: 'var(--text-primary)' }}>OMR Engine</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Digitize offline mock tests into your NEET Heatmap</p>
            </header>

            {/* ERROR TOAST */}
            {scanError && (
                <div style={{ background: 'var(--danger-light, rgba(239, 68, 68, 0.1))', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '16px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>⚠️</span> {scanError}
                </div>
            )}

            {/* FINAL RESULT STATE */}
            {finalResult ? (
                <div className="animate-fade-in-up">
                    <Card style={{ textAlign: 'center', padding: '40px 16px', background: 'var(--gradient-primary-light, linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05)))', border: '1px solid var(--primary)', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '8px' }}>{finalResult.score} / {finalResult.totalPossible}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '24px' }}>Accuracy: <span style={{ color: 'var(--text-primary)' }}>{finalResult.accuracy}%</span></p>
                        
                        <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--success)', fontWeight: 700, marginBottom: '4px' }}>Rank Estimate</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{finalResult.estimatedRankRange}</span>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: 'var(--warning)', background: 'var(--warning-light, rgba(245, 158, 11, 0.1))', padding: '12px', borderRadius: 'var(--radius-sm)' }}>{finalResult.communityInsight}</p>
                    </Card>

                    <Button variant="secondary" style={{ width: '100%', marginBottom: '12px' }} onClick={() => { setFinalResult(null); setImagePreview(null); }}>
                        Scan Another OMR Sheet
                    </Button>
                    {/* MD Hook to jump straight into Heatmap action */}
                    <a href="/mistakes" style={{ textDecoration: 'none', display: 'block' }}>
                        <Button variant="primary" style={{ width: '100%' }}>
                            View Updated Mistake Heatmap
                        </Button>
                    </a>
                </div>
            ) 
            /* VERIFICATION STATE (MD MANDATE) */
            : needsVerification ? (
                <div className="animate-fade-in-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--warning)' }}>Verify extracted answers</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tap to correct</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px', marginBottom: '32px', maxHeight: '400px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)' }}>
                        {Object.keys(scannedAnswers).map(qNum => (
                            <div key={qNum} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-elevated)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '16px', textAlign: 'right' }}>{qNum}.</span>
                                <select 
                                    className="input-field"
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, padding: 0, cursor: 'pointer', outline: 'none' }}
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

                    <Button variant="success" onClick={handleIdentityInjection} disabled={isGrading} style={{ width: '100%', marginBottom: '12px' }}>
                        {isGrading ? 'Injecting into Heatmap...' : 'Lock Initial Answers & Grade →'}
                    </Button>
                    <Button variant="secondary" onClick={() => setNeedsVerification(false)} style={{ width: '100%' }}>
                        Cancel & Rescan
                    </Button>
                </div>
            ) 
            /* INITIAL UPLOAD STATE */
            : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* MD Upgrade 3: Test Identification Gateway */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>1. Select Offline Test</label>
                        <select 
                            className="input-field"
                            style={{ width: '100%', padding: '12px', background: 'var(--bg-elevated)' }}
                            value={selectedTestId}
                            onChange={(e) => setSelectedTestId(e.target.value)}
                        >
                            {tests.map(t => (
                                <option key={t.id} value={t.id}>{t.provider} - {t.test_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>2. Capture OMR Sheet</label>
                        <div style={{ position: 'relative', border: '2px dashed var(--border)', borderRadius: 'var(--radius-xl)', background: 'var(--bg-glass)', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' }}
                             onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                             onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                            
                            {imagePreview ? (
                                <img src={imagePreview} alt="OMR Preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                            ) : (
                                <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                                    <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px', color: 'var(--primary)' }}>📷</span>
                                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Tap to open Camera</span>
                                </div>
                            )}

                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                onChange={handleCameraCapture}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            />
                        </div>
                    </div>

                    <Button 
                        variant="primary"
                        size="lg"
                        onClick={handleVisionScan}
                        disabled={!imagePreview || isScanning}
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '16px' }}
                    >
                        {isScanning ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div className="spinner" style={{ width: '20px', height: '20px' }} />
                                Extracting Neural Bubbles...
                            </span>
                        ) : 'Extract Answers'}
                    </Button>
                </div>
            )}
        </div>
    );
}
