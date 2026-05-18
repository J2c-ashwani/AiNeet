
"use client";
import { Button } from '@/components/ui';

export default function AdBanner({ slotId = "default" }) {
    // In a real app, integrate Google AdMob / AdSense script here.
    // For now, we show a placeholder that looks like an ad.

    return (
        <div className="w-full space_my_6 bg-[#0f0f0f] border line_gray_800 radius_lg space_pa_4 flex items-center justify-center relative overflow-hidden group">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-500 to-transparent"></div>

            <div className="z-10 text-center">
                <p className="text-xs tone_gray_500 uppercase tracking-widest space_mb_1">Sponsored</p>
                <h4 className="tone_gray_300 font-medium">Master Physics with Visual Learning!</h4>
                <p className="tone_gray_500 text-sm space_mt_1">Download the Generic Learning App today.</p>
                <Button variant="secondary" size="sm" className="space_mt_2 text-xs surface_gray_800 hover_surface_gray_700 tone_white space_px_3 space_py_1 rounded border line_gray_700 transition-colors">
                    Learn More
                </Button>
            </div>

            {/* "Remove Ads" Link */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] tone_gray_600 cursor-pointer hover_tone_blue_400">Remove Ads</span>
            </div>
        </div>
    );
}
