'use client';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { copyToClipboard } from '@/lib/utils/clipboard';

export default function GrowthCopilotPage() {
    const [doubtText, setDoubtText] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [platform, setPlatform] = useState('facebook');
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Setup Paste Event Listener (So founder can just hit Cmd+V)
    useEffect(() => {
        const handlePaste = (e) => {
            if (e.clipboardData.files.length > 0) {
                const file = e.clipboardData.files[0];
                if (file.type.startsWith('image/')) {
                    handleImageUpload(file);
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const handleImageUpload = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setImagePreview(base64String);
            // Split off the header (e.g. "data:image/png;base64,")
            const pureBase64 = base64String.split(',')[1];
            setImageBase64(pureBase64);
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!doubtText && !imageBase64) {
            setErrorMessage('Provide text or an image doubt before generating variants.');
            return;
        }
        setIsGenerating(true);
        setResults(null);
        setCopiedIndex(null);
        setErrorMessage('');

        try {
            const res = await fetch('/api/admin/growth/solve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    textContent: doubtText, 
                    imageBase64: imageBase64 
                })
            });

            if (res.ok) {
                const json = await res.json();
                setResults(json);
            } else {
                setErrorMessage('Unable to generate variants. Please try again.');
            }
        } catch (e) {
            console.error(e);
            setErrorMessage('Unable to reach the growth copilot service. Please try again.');
        }
        setIsGenerating(false);
    };

    const handleCopy = async (variantName, text) => {
        await copyToClipboard(text);
        setCopiedIndex(variantName);

        // Silent MD Tracker: Memory Hook
        fetch('/api/admin/growth/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                platform,
                topicDetected: results?.topic_detected,
                originalDoubtText: doubtText || 'Image Based',
                selectedVariantText: text
            })
        }).catch(err => console.error("Failed to commit to Memory Tracker", err));
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', minHeight: '100vh', }}>
            <div className="flex items-center gap-3 space_mb_8">
                <span className="text-4xl"><Icon name="Zap" /></span>
                <div>
                    <h1 className="text-3xl font-black space_mb_1">Growth Copilot</h1>
                    <p className="text-muted">Human-in-the-Loop Organic Customer Acquisition</p>
                </div>
            </div>

            <div className="grid grid-2 gap-8 items-start">
                
                {/* INTERFACE LAYER */}
                <div className="card" style={{ padding: 32 }}>
                    <h3 className="text-xl font-bold space_mb_4">1. Ingest Doubt</h3>
                    <p className="text-sm text-muted space_mb_6">Take a screenshot of a Facebook/Telegram doubt and press <strong className="tone_white bg-slate-800 space_px_2 space_py_1 rounded">Cmd + V</strong> to paste it.</p>
                    {errorMessage && (
                        <div className="space_mb_4 space_pa_3 radius_lg border line_red_500_20 surface_red_900_20 tone_red_300 text-sm">
                            {errorMessage}
                        </div>
                    )}

                    <div 
                        style={{ border: '2px dashed var(--border-color)', minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, background: imagePreview ? 'transparent' : 'var(--bg-glass)', position: 'relative', overflow: 'hidden' }}
                    >
                        {imagePreview ? (
                            <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: 300 }} alt="Pasted Doubt" />
                        ) : (
                            <span className="text-muted font-bold text-sm">Paste Image Here</span>
                        )}
                        {imagePreview && (
                            <Button onClick={() => {setImagePreview(null); setImageBase64(null)}} style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', }}>Clear</Button>
                        )}
                    </div>

                    <div className="space_mb_6">
                        <label className="block text-sm font-bold tone_gray_400 space_mb_2">Or Paste Text</label>
                        <Textarea 
                            value={doubtText}
                            onChange={(e) => setDoubtText(e.target.value)}
                            placeholder="E.g. I don't understand how Newton's 3rd Law applies to the tension puzzle..."
                            className="input"
                            style={{ minHeight: 100 }}
                        />
                    </div>

                    <div className="flex justify-between items-center space_mt_6 space_py_4 border-t line_gray_800">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold tone_gray_400">Target</span>
                            <Select className="input" value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ padding: '6px 12px', height: 'auto' }}>
                                <option value="facebook">Facebook</option>
                                <option value="telegram">Telegram</option>
                                <option value="reddit">Reddit</option>
                            </Select>
                        </div>
                        <Button 
                            onClick={handleGenerate} 
                            disabled={isGenerating}
                            className="btn btn-primary"
                        >
                            {isGenerating ? 'Generating...' : <><Icon name="Zap" size={16} /> Generate Variants</>}
                        </Button>
                    </div>
                </div>

                {/* OUTPUT LAYER */}
                <div>
                    {!results && !isGenerating ? (
                        <div style={{ padding: 60, textAlign: 'center', border: '1px solid var(--border-color)', }}>
                            <span className="text-5xl opacity-50 block space_mb_4"><Icon name="Brain" /></span>
                            <h3 className="text-xl tone_gray_400">Awaiting Target Data</h3>
                        </div>
                    ) : isGenerating ? (
                        <div style={{ padding: 60, textAlign: 'center', border: '1px solid var(--border-color)', }}>
                            <div className="spinner space_mb_4 mx-auto" />
                            <h3 className="text-xl tone_gray_400 animate-pulse">Running AI Copilot...</h3>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up">
                            <div className="space_mb_4">
                                <span className="space_px_3 space_py_1 surface_green_900 tone_green_400 radius_full text-xs font-bold space_mr_2">Target Acquired</span>
                                <span className="tone_gray_400 text-sm">Detected Topic: </span>
                                <strong className="tone_white">{results.topic_detected}</strong>
                            </div>

                            <div className="flex flex-col gap-4">
                                {/* Variant 1 */}
                                <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                                    <div className="flex justify-between items-center space_mb_3">
                                        <h4 className="font-bold tone_blue_400">1. Concise Variant</h4>
                                        <Button onClick={() => handleCopy('concise', results.concise)} className="text-xs surface_blue_900 tone_white space_px_3 space_py_1 rounded">
                                            {copiedIndex === 'concise' ? '✓ Copied' : 'Copy Text'}
                                        </Button>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{results.concise}</p>
                                </div>

                                {/* Variant 2 */}
                                <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                                    <div className="flex justify-between items-center space_mb_3">
                                        <h4 className="font-bold text-emerald-400">2. Detailed Breakdown</h4>
                                        <Button onClick={() => handleCopy('detailed', results.detailed)} className="text-xs bg-emerald-900 tone_white space_px_3 space_py_1 rounded">
                                            {copiedIndex === 'detailed' ? '✓ Copied' : 'Copy Text'}
                                        </Button>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{results.detailed}</p>
                                </div>

                                {/* Variant 3 */}
                                <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                                    <div className="flex justify-between items-center space_mb_3">
                                        <h4 className="font-bold text-amber-400">3. Highly Conversational</h4>
                                        <Button onClick={() => handleCopy('conversational', results.conversational)} className="text-xs bg-amber-900 tone_white space_px_3 space_py_1 rounded">
                                            {copiedIndex === 'conversational' ? '✓ Copied' : 'Copy Text'}
                                        </Button>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{results.conversational}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
