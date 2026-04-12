'use client';
import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/utils/supabase/client';

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
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            
            <header className="mb-8 text-center pb-6 border-b border-gray-800">
                <span className="text-4xl block mb-2">📸</span>
                <h1 className="text-3xl font-black mb-1">OMR Engine</h1>
                <p className="text-muted text-sm">Digitize offline mock tests into your NEET Heatmap</p>
            </header>

            {/* ERROR TOAST */}
            {scanError && (
                <div className="bg-red-900 border border-red-500 text-red-200 p-4 rounded-lg mb-6 text-sm flex gap-2">
                    <span>⚠️</span> {scanError}
                </div>
            )}

            {/* FINAL RESULT STATE */}
            {finalResult ? (
                <div className="animate-fade-in-up">
                    <div className="card text-center py-10 px-4" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', borderColor: 'rgba(99,102,241,0.2)' }}>
                        <h2 className="text-4xl font-black text-indigo-400 mb-2">{finalResult.score} / {finalResult.totalPossible}</h2>
                        <p className="text-gray-400 font-bold mb-6">Accuracy: <span className="text-white">{finalResult.accuracy}%</span></p>
                        
                        <div className="bg-black/30 p-4 rounded-lg mb-6">
                            <span className="block text-xs uppercase tracking-widest text-emerald-500 font-bold mb-1">Rank Estimate</span>
                            <span className="text-2xl font-bold">{finalResult.estimatedRankRange}</span>
                        </div>

                        <p className="text-sm text-yellow-300 bg-yellow-900/30 p-3 rounded">{finalResult.communityInsight}</p>
                    </div>

                    <button className="btn btn-secondary w-full mt-6" onClick={() => { setFinalResult(null); setImagePreview(null); }}>
                        Scan Another OMR Sheet
                    </button>
                    {/* MD Hook to jump straight into Heatmap action */}
                    <a href="/mistakes" className="btn btn-primary w-full mt-3 block text-center" style={{ textDecoration: 'none' }}>
                        View Updated Mistake Heatmap
                    </a>
                </div>
            ) 
            /* VERIFICATION STATE (MD MANDATE) */
            : needsVerification ? (
                <div className="animate-fade-in-up">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl text-yellow-400">Verify extracted answers</h3>
                        <span className="text-xs text-gray-400">Tap to correct</span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 mb-8 max-h-[400px] overflow-y-auto p-2 border border-gray-800 rounded bg-black/20">
                        {Object.keys(scannedAnswers).map(qNum => (
                            <div key={qNum} className="flex gap-2 items-center bg-gray-900 p-2 rounded">
                                <span className="text-xs text-gray-500 w-4 text-right">{qNum}.</span>
                                <select 
                                    className="bg-transparent border-none text-white text-sm font-bold p-0 focus:ring-0 cursor-pointer"
                                    value={scannedAnswers[qNum] || ''}
                                    onChange={(e) => handleBubbleCorrection(qNum, e.target.value)}
                                >
                                    <option value="" className="bg-gray-800">-</option>
                                    <option value="A" className="bg-gray-800">A</option>
                                    <option value="B" className="bg-gray-800">B</option>
                                    <option value="C" className="bg-gray-800">C</option>
                                    <option value="D" className="bg-gray-800">D</option>
                                </select>
                            </div>
                        ))}
                    </div>

                    <button onClick={handleIdentityInjection} disabled={isGrading} className="btn w-full font-bold" style={{ background: '#10b981', color: 'white' }}>
                        {isGrading ? 'Injecting into Heatmap...' : 'Lock Initial Answers & Grade →'}
                    </button>
                    <button onClick={() => setNeedsVerification(false)} className="btn btn-secondary w-full mt-3">
                        Cancel & Rescan
                    </button>
                </div>
            ) 
            /* INITIAL UPLOAD STATE */
            : (
                <div className="space-y-6">
                    {/* MD Upgrade 3: Test Identification Gateway */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">1. Select Offline Test</label>
                        <select 
                            className="input w-full p-3 bg-gray-900"
                            value={selectedTestId}
                            onChange={(e) => setSelectedTestId(e.target.value)}
                        >
                            {tests.map(t => (
                                <option key={t.id} value={t.id}>{t.provider} - {t.test_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">2. Capture OMR Sheet</label>
                        <div className="relative border-2 border-dashed border-gray-700 rounded-xl bg-gray-900/50 p-6 flex flex-col items-center justify-center min-h-[200px] overflow-hidden group hover:border-indigo-500 transition-colors cursor-pointer">
                            
                            {imagePreview ? (
                                <img src={imagePreview} alt="OMR Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                            ) : (
                                <div className="text-center pointer-events-none">
                                    <span className="text-4xl block mb-2 text-indigo-400">📷</span>
                                    <span className="font-bold text-gray-300">Tap to open Camera</span>
                                </div>
                            )}

                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                onChange={handleCameraCapture}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleVisionScan}
                        disabled={!imagePreview || isScanning}
                        className="btn btn-primary w-full py-4 text-lg mt-4 disabled:opacity-50"
                    >
                        {isScanning ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                                Extracting Neural Bubbles...
                            </span>
                        ) : 'Extract Answers'}
                    </button>
                </div>
            )}
        </div>
    );
}
