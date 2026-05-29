
"use client";
import { Button } from '@/components/ui';
import Link from 'next/link';

export default function AdBanner({ slotId = "default" }) {
    return (
        <div className="w-full space_my_6 bg-[#0f0f0f] border line_gray_800 radius_lg space_pa_4 flex items-center justify-center relative overflow-hidden group">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-500 to-transparent"></div>

            <div className="z-10 text-center">
                <p className="text-xs tone_gray_500 uppercase tracking-widest space_mb_1">Upgrade</p>
                <h4 className="tone_gray_300 font-medium">Remove ads and unlock premium practice tools.</h4>
                <p className="tone_gray_500 text-sm space_mt_1">NEET Pro starts at ₹199/month.</p>
                <Link href="/pricing">
                    <Button variant="secondary" size="sm" className="space_mt_2 text-xs surface_gray_800 hover_surface_gray_700 tone_white space_px_3 space_py_1 rounded border line_gray_700 transition-colors">
                        View Plans
                    </Button>
                </Link>
            </div>

            {/* "Remove Ads" Link */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href="/pricing" className="text-[10px] tone_gray_600 cursor-pointer hover_tone_blue_400">Remove Ads</Link>
            </div>
        </div>
    );
}
