
"use client";
import { useState, useRef } from 'react';

export default function SnapSolver({ onSolutionReceived, userTier }) {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const isPremium = userTier === 'premium';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!isPremium) {
            setError("🔒 This feature is locked. Upgrade to Premium to Snap & Solve.");
            return;
        }

        const url = URL.createObjectURL(file);
        setPreview({ url, file });
        setError('');
    };

    const handleUpload = async () => {
        if (!preview?.file) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', preview.file);

            const res = await fetch('/api/doubt/snap', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            onSolutionReceived(data.solution); // Pass text back to parent
            setPreview(null); // Clear preview

        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">📸</span>
                    <h3 className="font-bold text-white">Snap & Solve</h3>
                    {!isPremium && <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full">PREMIUM</span>}
                </div>
            </div>

            {error && <div className="text-red-400 text-sm mb-3 bg-red-900/20 p-2 rounded">{error}</div>}

            {!preview ? (
                <div
                    onClick={() => isPremium ? fileInputRef.current?.click() : setError("🔒 Upgrade to Premium to use this feature.")}
                    className={`border-2 border-dashed border-gray-700 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors ${isPremium ? 'hover:border-blue-500 hover:bg-gray-800' : 'opacity-50'}`}
                >
                    <span className="text-3xl mb-2">📷</span>
                    <p className="text-gray-400 text-sm">Tap to take a photo of your doubt</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                    />
                </div>
            ) : (
                <div className="relative">
                    <img src={preview.url} alt="Preview" className="w-full h-48 object-contain bg-black rounded-lg mb-4" />

                    <div className="flex gap-2">
                        <button
                            onClick={() => setPreview(null)}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
                        >
                            Retake
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Analyzing...
                                </>
                            ) : 'Solve Question'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
