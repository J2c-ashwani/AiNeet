'use client';
import { useEffect } from 'react';

export default function SplashHide() {
    useEffect(() => {
        const splash = document.getElementById('app-splash');
        if (splash) {
            splash.classList.add('hide');
            // DO NOT call splash.remove()! Removing DOM elements rendered by React
            // causes "NotFoundError: Failed to execute 'removeChild' on 'Node'"
            // when React attempts DOM reconciliation. Set display: none instead.
            setTimeout(() => {
                if (splash) {
                    splash.style.display = 'none';
                }
            }, 450);
        }
    }, []);
    return null;
}
