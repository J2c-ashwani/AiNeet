import './globals.css';

export const metadata = {
    title: 'AI NEET Coach — Personalized NEET Preparation',
    description: 'India\'s most intelligent AI-powered NEET preparation platform. Get personalized tests, AI doubt solving, study plans, rank prediction, and more.',
    manifest: '/manifest.json',
};

export const viewport = {
    themeColor: '#0a0e1a',
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
