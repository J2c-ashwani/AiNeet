
"use client";

export default function AdBanner({ slotId = "default" }) {
    // In a real app, integrate Google AdMob / AdSense script here.
    // For now, we show a placeholder that looks like an ad.

    return (
        <div className="w-full my-6 bg-[#0f0f0f] border border-gray-800 rounded-lg p-4 flex items-center justify-center relative overflow-hidden group">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-500 to-transparent"></div>

            <div className="z-10 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Sponsored</p>
                <h4 className="text-gray-300 font-medium">Master Physics with Visual Learning!</h4>
                <p className="text-gray-500 text-sm mt-1">Download the Generic Learning App today.</p>
                <button className="mt-2 text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded border border-gray-700 transition-colors">
                    Learn More
                </button>
            </div>

            {/* "Remove Ads" Link */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-gray-600 cursor-pointer hover:text-blue-400">Remove Ads</span>
            </div>
        </div>
    );
}
