import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

// Dynamically generate SEO metadata for each question page
export async function generateMetadata({ params }) {
    await initializeDatabase();
    const db = getDb();
    const question = await db.get(`
        SELECT q.text, t.name as topic_name, c.name as chapter_name
        FROM questions q
        JOIN topics t ON q.topic_id = t.id
        JOIN chapters c ON t.chapter_id = c.id
        WHERE q.id = ?
    `, [params.id]);

    if (!question) {
        return { title: 'Question Not Found | AI NEET Coach' };
    }

    // Clean text by removing markdown or excessive whitespace for the meta description
    const cleanText = question.text.replace(/[#*_~`>]/g, '').trim();
    const shortDesc = cleanText.length > 150 ? cleanText.substring(0, 147) + '...' : cleanText;

    return {
        title: `${cleanText.substring(0, 60)}${cleanText.length > 60 ? '...' : ''} | NEET PYQ`,
        description: `Practice this NEET Past Year Question on ${question.topic_name} (${question.chapter_name}). ${shortDesc}`,
        keywords: ['NEET', 'PYQ', question.topic_name, question.chapter_name, 'MCQ'],
        openGraph: {
            title: 'NEET Practice Question',
            description: shortDesc,
            type: 'website',
        }
    };
}

export default async function QuestionPage({ params }) {
    await initializeDatabase();
    const db = getDb();

    // Fetch question and its options
    const question = await db.get(`
        SELECT q.*, t.name as topic_name, c.name as chapter_name, s.name as subject_name
        FROM questions q
        JOIN topics t ON q.topic_id = t.id
        JOIN chapters c ON t.chapter_id = c.id
        JOIN subjects s ON c.subject_id = s.id
        WHERE q.id = ?
    `, [params.id]);

    if (!question) {
        return (
            <div>
                <Navbar />
                <div className="page text-center pb-20 pt-20">
                    <h1 className="text-2xl font-bold">Question not found</h1>
                    <Link href="/" className="text-secondary mt-4 block">Return Home</Link>
                </div>
            </div>
        );
    }

    let options = [];
    try {
        options = JSON.parse(question.options);
    } catch (e) { }

    // Generate JSON-LD Schema for rich snippets
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Quiz",
        "name": `NEET Question on ${question.topic_name}`,
        "description": "Practice NEET Past Year Questions (PYQs) online.",
        "hasPart": [
            {
                "@type": "Question",
                "name": question.text,
                "text": question.text,
                "suggestedAnswer": options.map(opt => ({
                    "@type": "Answer",
                    "text": opt
                })),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": options[question.correct_option - 1] || "Hidden"
                }
            }
        ]
    };

    return (
        <div>
            <Navbar />

            {/* Inject JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="page" style={{ maxWidth: 800 }}>
                {/* SEO Breadcrumbs */}
                <nav className="text-sm text-secondary mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    <Link href="/" className="hover:text-white">Home</Link>
                    <span>›</span>
                    <span className="text-muted">{question.subject_name}</span>
                    <span>›</span>
                    <span className="text-muted hidden sm:inline">{question.chapter_name}</span>
                    <span className="hidden sm:inline">›</span>
                    <span className="font-medium text-primary">{question.topic_name}</span>
                </nav>

                <main className="card !p-8 relative overflow-hidden mb-8">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none select-none">
                        {question.subject_name === 'Physics' ? '⚡' : question.subject_name === 'Chemistry' ? '🧪' : '🧬'}
                    </div>

                    <div className="relative z-10">
                        {/* Tags */}
                        <div className="flex gap-2 mb-6 flex-wrap">
                            <span className={`difficulty-badge ${question.difficulty || 'medium'}`}>
                                {(question.difficulty || 'medium').charAt(0).toUpperCase() + (question.difficulty || 'medium').slice(1)}
                            </span>
                            {question.year && (
                                <span className="difficulty-badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', borderColor: 'rgba(99,102,241,0.2)' }}>
                                    NEET {question.year}
                                </span>
                            )}
                        </div>

                        {/* H1 Question Text for SEO */}
                        <h1 className="text-xl sm:text-2xl font-bold leading-relaxed mb-8 text-white">
                            {question.text}
                        </h1>

                        {/* Options List */}
                        <div className="flex flex-col gap-3 mb-8">
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-gray-700 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400 shrink-0">
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <div className="pt-1 text-gray-300">
                                        {opt}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Call To Action / Unlock Box */}
                        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-6 rounded-xl text-center backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>

                            <h3 className="text-lg font-bold text-white mb-2 relative z-10">Want to see the solution & AI Explanation?</h3>
                            <p className="text-indigo-200/80 mb-6 text-sm max-w-lg mx-auto relative z-10">
                                Join thousands of NEET aspirants tracking their weak areas, taking custom mock tests, and mastering concepts with AI.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
                                <Link href={`/login?redirect=/q/${params.id}`} className="btn btn-primary" style={{ minWidth: 200, padding: '14px 24px' }}>
                                    Unlock Answer
                                </Link>
                                <span className="text-secondary text-sm">or</span>
                                <Link href="/test/configure" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm underline underline-offset-4">
                                    Generate Full Mock Test
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Related Questions Hook (Placeholder for future iteration, linking to topic page or similar) */}
                <div className="text-center pb-20">
                    <p className="text-secondary mb-4">Mastering <strong className="text-white">{question.topic_name}</strong> is crucial for NEET.</p>
                    <Link href={`/test/configure?type=topic`} className="btn btn-secondary">
                        Practice More Questions Like This
                    </Link>
                </div>
            </div>
        </div>
    );
}
