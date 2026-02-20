import './globals.css';

const APP_NAME = 'AI NEET Coach';
const APP_DESCRIPTION = 'India\'s #1 AI-powered NEET preparation platform. Get personalized mock tests, instant AI doubt solving, adaptive study plans, rank prediction, spaced repetition, and detailed performance analytics — all powered by Gemini AI. Free forever plan available.';
const APP_URL = 'https://aineetcoach.com';

export const metadata = {
    metadataBase: new URL(APP_URL),
    title: {
        default: 'AI NEET Coach — #1 AI-Powered NEET 2026 Preparation Platform',
        template: '%s | AI NEET Coach',
    },
    description: APP_DESCRIPTION,
    manifest: '/manifest.json',
    keywords: [
        'NEET preparation', 'NEET 2026', 'AI NEET coach', 'NEET mock test',
        'NEET online test', 'NEET AI tutor', 'NEET doubt solver',
        'NEET study plan', 'NEET rank predictor', 'NEET question bank',
        'NEET biology', 'NEET physics', 'NEET chemistry',
        'NEET preparation app', 'best NEET app', 'free NEET preparation',
        'NEET previous year questions', 'NEET PYQ', 'NCERT for NEET',
        'NEET 2026 preparation', 'medical entrance exam', 'MBBS entrance',
    ],
    authors: [{ name: 'AI NEET Coach' }],
    creator: 'AI NEET Coach',
    publisher: 'AI NEET Coach',
    applicationName: APP_NAME,
    category: 'education',
    classification: 'Education, AI, Medical Entrance Exam',

    // Open Graph
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: APP_URL,
        siteName: APP_NAME,
        title: 'AI NEET Coach — Crack NEET 2026 with Artificial Intelligence',
        description: APP_DESCRIPTION,
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'AI NEET Coach — Personalized NEET Preparation Platform',
            },
        ],
    },

    // Twitter Card
    twitter: {
        card: 'summary_large_image',
        title: 'AI NEET Coach — #1 AI-Powered NEET 2026 Preparation',
        description: APP_DESCRIPTION,
        images: ['/og-image.png'],
    },

    // Robots
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },

    // Verification (add your actual codes later)
    // verification: {
    //     google: 'your-google-verification-code',
    // },

    // Alternate languages
    alternates: {
        canonical: APP_URL,
    },
};

export const viewport = {
    themeColor: '#0a0e1a',
    width: 'device-width',
    initialScale: 1,
};

// JSON-LD Structured Data
function JsonLd() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: APP_NAME,
        url: APP_URL,
        description: APP_DESCRIPTION,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web, Android',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
            description: 'Free forever plan available',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1200',
            bestRating: '5',
        },
        featureList: [
            'AI-Powered Personalized Mock Tests',
            'Instant AI Doubt Solving with Image Upload',
            'Adaptive Study Plans',
            'NEET Rank Prediction',
            'Spaced Repetition System',
            'Detailed Performance Analytics',
            'NCERT Chapter Reader',
            'Previous Year Question Bank',
            'Gamification with XP and Leaderboards',
        ],
    };

    const faqData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Is AI NEET Coach free to use?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes! AI NEET Coach offers a free forever plan that includes AI-powered test generation, doubt solving, and performance analytics. Premium plans are available for advanced features like unlimited AI doubts and detailed rank predictions.',
                },
            },
            {
                '@type': 'Question',
                name: 'How does AI NEET Coach generate personalized tests?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Our AI engine analyzes your performance history, weak areas, and target topics to generate custom NEET-format tests. Each test adapts to your preparation level, ensuring you practice the right questions at the right difficulty.',
                },
            },
            {
                '@type': 'Question',
                name: 'Can I use AI NEET Coach on my mobile phone?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Absolutely! AI NEET Coach is available as a responsive web app, installable PWA, and a native Android app on the Google Play Store. Your progress syncs seamlessly across all devices.',
                },
            },
            {
                '@type': 'Question',
                name: 'Does AI NEET Coach cover all NEET subjects?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, AI NEET Coach covers all three NEET subjects — Physics, Chemistry, and Biology (Botany & Zoology) — with chapter-wise questions aligned to the NCERT syllabus and previous year patterns.',
                },
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
            />
        </>
    );
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/icon-192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="google-play-app" content="app-id=com.aineetcoach.app" />
                <JsonLd />
            </head>
            <body suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
