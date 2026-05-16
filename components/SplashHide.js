'use client';
import { useEffect } from 'react';
export default function SplashHide() {
    useEffect(() => {
        const splash = document.getElementById('app-splash');
        if (splash) {
            splash.classList.add('hide');
            setTimeout(() => splash.remove(), 500);
        }
    }, []);
    return null;
}
