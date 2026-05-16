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
        if (!doubtText && !imageBase64) return alert('Provide text or an image doubt');
        setIsGenerating(true);
        setResults(null);
        setCopiedIndex(null);

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
                alert('Generation Failed');
            }
        } catch (e) {
            console.error(e);
            alert('Generation Exception');
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
            <div className="flex items-center gap-3 mb-8">
                <span className="text-4xl"><Icon name="Zap" /></span>
                <div>
                    <h1 className="text-3xl font-black mb-1">Growth Copilot</h1>
                    <p className="text-muted">Human-in-the-Loop Organic Customer Acquisition</p>
                </div>
            </div>

            <div className="grid grid-2 gap-8 items-start">
                
                {/* INTERFACE LAYER */}
                <div className="card" style={{ padding: 32 }}>
                    <h3 className="text-xl font-bold mb-4">1. Ingest Doubt</h3>
                    <p className="text-sm text-muted mb-6">Take a screenshot of a Facebook/Telegram doubt and press <strong className="text-white bg-slate-800 px-2 py-1 rounded">Cmd + V</strong> to paste it.</p>

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

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-400 mb-2">Or Paste Text</label>
                        <Textarea 
                            value={doubtText}
                            onChange={(e) => setDoubtText(e.target.value)}
                            placeholder="E.g. I don't understand how Newton's 3rd Law applies to the tension puzzle..."
                            className="input"
                            style={{ minHeight: 100 }}
                        />
                    </div>

                    <div className="flex justify-between items-center mt-6 py-4 border-t border-gray-800">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-400">Target</span>
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
                            {isGenerating ? 'Firing Vision Engine...' : <><Icon name="Zap" size={16} /> Generate Variants</>}
                        </Button>
                    </div>
                </div>

                {/* OUTPUT LAYER */}
                <div>
                    {!results && !isGenerating ? (
                        <div style={{ padding: 60, textAlign: 'center', border: '1px solid var(--border-color)', }}>
                            <span className="text-5xl opacity-50 block mb-4"><Icon name="Brain" /></span>
                            <h3 className="text-xl text-gray-400">Awaiting Target Data</h3>
                        </div>
                    ) : isGenerating ? (
                        <div style={{ padding: 60, textAlign: 'center', border: '1px solid var(--border-color)', }}>
                            <div className="spinner mb-4 mx-auto" />
                            <h3 className="text-xl text-gray-400 animate-pulse">Running AI Copilot...</h3>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up">
                            <div className="mb-4">
                                <span className="px-3 py-1 bg-green-900 text-green-400 rounded-full text-xs font-bold mr-2">Target Acquired</span>
                                <span className="text-gray-400 text-sm">Detected Topic: </span>
                                <strong className="text-white">{results.topic_detected}</strong>
                            </div>

                            <div className="flex flex-col gap-4">
                                {/* Variant 1 */}
                                <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-blue-400">1. Concise Variant</h4>
                                        <Button onClick={() => handleCopy('concise', results.concise)} className="text-xs bg-blue-900 text-white px-3 py-1 rounded">
                                            {copiedIndex === 'concise' ? '✓ Copied' : 'Copy Text'}
                                        </Button>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{results.concise}</p>
                                </div>

                                {/* Variant 2 */}
                                <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-emerald-400">2. Detailed Breakdown</h4>
                                        <Button onClick={() => handleCopy('detailed', results.detailed)} className="text-xs bg-emerald-900 text-white px-3 py-1 rounded">
                                            {copiedIndex === 'detailed' ? '✓ Copied' : 'Copy Text'}
                                        </Button>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{results.detailed}</p>
                                </div>

                                {/* Variant 3 */}
                                <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-amber-400">3. Highly Conversational</h4>
                                        <Button onClick={() => handleCopy('conversational', results.conversational)} className="text-xs bg-amber-900 text-white px-3 py-1 rounded">
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
