
"use client";
import { useState, useRef } from 'react';
import { isInsideNativeApp } from '@/lib/platform';
import { Button, FileInput } from '@/components/ui';

export default function SnapSolver({ onSolutionReceived, userTier }) {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const captureMode = isInsideNativeApp() ? undefined : 'environment';

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
        <div className="bg-[#1a1a1a] border line_gray_800 radius_xl space_pa_4 space_mb_6">
            <div className="flex items-center justify-between space_mb_4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">📸</span>
                    <h3 className="font-bold tone_white">Snap & Solve</h3>
                    {!isPremium && <span className="text-[10px] surface_purple_600 tone_white space_px_2 space_py_0_5 radius_full">PREMIUM</span>}
                </div>
            </div>

            {error && <div className="tone_red_400 text-sm space_mb_3 surface_red_900_20 space_pa_2 rounded">{error}</div>}

            {!preview ? (
                <div
                    onClick={() => isPremium ? fileInputRef.current?.click() : setError("🔒 Upgrade to Premium to use this feature.")}
                    className={`border-2 border-dashed border-gray-700 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors ${isPremium ? 'hover:border-blue-500 hover:bg-gray-800' : 'opacity-50'}`}
                >
                    <span className="text-3xl space_mb_2">📷</span>
                    <p className="tone_gray_400 text-sm">Tap to take a photo of your doubt</p>
                    <FileInput
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        capture={captureMode}
                        onChange={handleFileChange}
                    />
                </div>
            ) : (
                <div className="relative">
                    <img src={preview.url} alt="Preview" className="w-full h-48 object-contain surface_black radius_lg space_mb_4" />

                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setPreview(null)}
                            className="flex-1 surface_gray_700 hover_surface_gray_600 tone_white space_py_2 radius_lg"
                        >
                            Retake
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex-1 surface_blue_600 hover_surface_blue_500 tone_white space_py_2 radius_lg font-bold flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 line_white border-t-transparent radius_full"></div>
                                    Analyzing...
                                </>
                            ) : 'Solve Question'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
