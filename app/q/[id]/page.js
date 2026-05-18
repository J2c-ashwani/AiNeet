import { Icon } from '@/components/ui/Icon';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';
import MathRenderer from '@/components/MathRenderer';
import { TrustBadge } from '@/components/trust/TrustBadge';

// --- SEO Helpers ---
function cleanQuestionText(text) {
    if (!text) return 'NEET Question';
    // Remove markdown, equations, and generic fluff to isolate intent
    let clean = text.replace(/[#*_~`>$]/g, '').trim();
    clean = clean.replace(/^(Calculate the|Find the|What is the|Identify the|Which of the following)\s+/i, '');
    return clean.substring(0, 70) + (clean.length > 70 ? '...' : '');
}

function getTitleTemplate(id, cleanText, year, difficulty) {
    // Simple deterministic hash based on question ID to rotate templates safely
    const hash = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const yr = year ? `(NEET ${year})` : 'NEET PYQ';
    
    // 3 safe, curiosity-driven, variation templates
    const templates = [
        `${cleanText} ${yr} – Solution & Explanation`,
        `${yr} Question – Most Students Struggle With This`,
        `${cleanText} – ${yr} Faster Way to Solve`
    ];
    return templates[hash % templates.length];
}

export async function generateMetadata({ params }) {
    const supabase = getSupabase();
    const { data: question } = await supabase
        .from('questions')
        .select(`*, topics(name), chapters(name)`)
        .eq('id', params.id)
        .single();

    if (!question) return { title: 'Question Not Found | AI NEET Coach' };

    const cleanText = cleanQuestionText(question.text);
    const title = getTitleTemplate(question.id, cleanText, question.year_asked, question.difficulty);
    const diffText = (question.difficulty || 'medium').toLowerCase();
    
    // Curiosity gap meta description
    const description = `Are you preparing for NEET? 8 out of 10 students fail to answer this ${diffText} question from ${question.year_asked || 'past exams'}. Click to see the step-by-step explanation and master ${question.topics?.name || 'this concept'}.`;

    return {
        title,
        description,
        keywords: ['NEET', 'PYQ', question.topics?.name, question.chapters?.name, 'Explanation', 'Solution'],
        openGraph: { title, description, type: 'article' }
    };
}

export default async function QuestionPage({ params }) {
    const supabase = getSupabase();

    // 1. Fetch main question
    const { data: question } = await supabase
        .from('questions')
        .select(`*, topics(name), chapters(name), subjects(name)`)
        .eq('id', params.id)
        .single();

    if (!question) {
        return <div className="page text-center space_pb_20 space_pt_20"><h1>Not Found</h1></div>;
    }

    // Parse Options
    let options = [];
    try {
        if (question.options) options = JSON.parse(question.options);
        else if (question.option_a) options = [question.option_a, question.option_b, question.option_c, question.option_d].filter(Boolean);
    } catch (e) { }

    const correctAnswerText = options[question.correct_option - 1] || "Option " + question.correct_option;

    // 2. Fetch Strategic Related Questions (Semantic Progression instead of random)
    const { data: relatedData } = await supabase
        .from('questions')
        .select(`id, text, difficulty, year_asked, is_pyq, topic_id`)
        .eq('chapter_id', question.chapter_id)
        .neq('id', question.id)
        .limit(15); // fetch a pool to filter from
        
    const relatedLinks = [];
    if (relatedData && relatedData.length > 0) {
        // Try to find semantic matches
        const easier = relatedData.find(q => q.topic_id === question.topic_id && q.difficulty === 'easy');
        const harder = relatedData.find(q => q.topic_id === question.topic_id && q.difficulty === 'hard');
        const pastYear = relatedData.find(q => q.year_asked === (question.year_asked - 1));
        const sibling = relatedData.find(q => q.topic_id !== question.topic_id);
        
        if (easier) relatedLinks.push({ label: 'Practice Easier Version', q: easier });
        if (harder && harder.id !== easier?.id) relatedLinks.push({ label: 'Practice Harder Version', q: harder });
        if (pastYear && pastYear.id !== easier?.id && pastYear.id !== harder?.id) relatedLinks.push({ label: `See NEET ${pastYear.year_asked} Variation`, q: pastYear });
        if (sibling && sibling.id !== easier?.id && sibling.id !== harder?.id && sibling.id !== pastYear?.id) relatedLinks.push({ label: 'Review Related Concept', q: sibling });
        
        // Fill remaining up to 4 if needed
        let i = 0;
        while(relatedLinks.length < 4 && i < relatedData.length) {
            if (!relatedLinks.some(r => r.q.id === relatedData[i].id)) {
                relatedLinks.push({ label: 'Related Chapter Question', q: relatedData[i] });
            }
            i++;
        }
    }

    // 3. Generate Schema (QAPage + FAQPage + Educational)
    const schemas = [
        {
            "@context": "https://schema.org",
            "@type": "QAPage",
            "mainEntity": {
                "@type": "Question",
                "name": cleanQuestionText(question.text),
                "text": question.text,
                "answerCount": 1,
                "about": {
                    "@type": "Thing",
                    "name": question.topics?.name || 'NEET Syllabus'
                },
                "educationalAlignment": [
                    {
                        "@type": "AlignmentObject",
                        "alignmentType": "educationalSubject",
                        "targetName": question.subjects?.name || 'Science'
                    },
                    {
                        "@type": "AlignmentObject",
                        "alignmentType": "educationalLevel",
                        "targetName": "NEET Exam Difficulty: " + (question.difficulty || 'Medium').toUpperCase()
                    }
                ],
                "timeRequired": `PT${question.difficulty === 'hard' ? '90' : question.difficulty === 'easy' ? '30' : '60'}S`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${correctAnswerText}. ${question.explanation || ''}`
                }
            }
        }
    ];

    if (question.explanation) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
                "@type": "Question",
                "name": `How to solve: ${cleanQuestionText(question.text)}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": question.explanation
                }
            }]
        });
    }

    return (
        <div>
            {schemas.map((s, i) => (
                <script key={`schema-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
            ))}

            <div className="page" style={{ maxWidth: 800 }}>
                {/* SEO Breadcrumbs */}
                <nav className="text-sm text-secondary space_mb_6 flex items-center gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    <a href="/" className="hover_tone_white">Home</a>
                    <span>›</span>
                    <span className="text-muted">{question.subjects?.name || 'Subject'}</span>
                    <span>›</span>
                    <span className="text-muted hidden sm:inline">{question.chapters?.name || 'Chapter'}</span>
                    <span className="hidden sm:inline">›</span>
                    <span className="font-medium text-primary">{question.topics?.name || 'Topic'}</span>
                </nav>

                <main className="card space_pa_8 relative overflow-hidden space_mb_8 border-t-4" style={{borderTopColor: 'var(--accent-primary)'}}>
                    {/* Stat Badges for CTR / Engagement */}
                    <div className="flex gap-3 space_mb_6 flex-wrap">
                        <span className={`difficulty-badge ${question.difficulty || 'medium'}`}>
                            Difficulty: {(question.difficulty || 'medium').toUpperCase()}
                        </span>
                        <span className="difficulty-badge" >
                            <Icon name="Clock" /> Avg Time: {question.difficulty === 'hard' ? '90s' : question.difficulty === 'easy' ? '30s' : '60s'}
                        </span>
                        {question.year_asked && (
                            <div className="flex items-center gap-2">
                                <TrustBadge type="verified-pyq" />
                                <span className="difficulty-badge" >
                                    <Icon name="CalendarDays" /> NEET {question.year_asked}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Question */}
                    <h1 className="text-xl sm:text-2xl font-bold leading-relaxed space_mb_8 tone_white">
                        <MathRenderer>{question.text}</MathRenderer>
                    </h1>

                    {/* Options List ("Answer First" UI - Correct Answer Highlighted Immediately) */}
                    <div className="flex flex-col gap-3 space_mb_8">
                        {options.map((opt, idx) => {
                            const isCorrect = (idx + 1) === question.correct_option;
                            return (
                            <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${isCorrect ? 'bg-green-900/20 border-green-500/50' : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${isCorrect ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-gray-800 text-gray-400'}`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <div className={`pt-1 ${isCorrect ? 'text-green-50 font-medium' : 'text-gray-300'}`}>
                                    <MathRenderer>{opt}</MathRenderer>
                                </div>
                                {isCorrect && <div className="ml-auto tone_green_400 text-xs sm:text-sm font-bold surface_green_900_40 border line_green_500_30 space_px_3 space_py_1 radius_full whitespace-nowrap"><Icon name="Star" size={16} /> Correct Answer</div>}
                            </div>
                        )})}
                    </div>

                    {/* Answer First & Explanation (Helpful Content exposed to Googlebot) */}
                    <div className="space_mt_8 space_pt_8 border-t line_gray_800 relative">
                        <div className="flex items-center justify-between space_mb_4">
                            <h3 className="text-xl font-bold tone_white flex items-center gap-2 space_ma_0">
                                <span className="text-2xl"><Icon name="Star" size={16} /></span> Step-by-Step Explanation
                            </h3>
                            {(question.is_ai_generated === 1 || question.ai_confidence) && (
                                <TrustBadge type="ai-confidence" meta={{ score: question.ai_confidence || 0.95 }} />
                            )}
                        </div>
                        
                        {question.explanation ? (
                            <div className="prose prose-invert max-w-none tone_gray_300 leading-relaxed">
                                <MathRenderer>{question.explanation}</MathRenderer>
                                
                                {/* Monetization / Engagement Hook below free SEO content */}
                                <div className="space_mt_10 space_pa_6 radius_xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border line_indigo_500_20 text-center">
                                    <h4 className="tone_white font-bold space_mb_2">Mastered this concept?</h4>
                                    <p className="tone_indigo_200 text-sm space_mb_4">Generate a dynamic mock test focusing strictly on your weak areas to boost your NEET score.</p>
                                    <a href="/test/configure" className="btn btn-primary text-sm space_px_6 space_py_2 inline-block">
                                        Start Custom Mock Test
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="surface_gray_800_50 space_pa_6 radius_xl text-center border line_gray_700 border-dashed">
                                <p className="tone_gray_400 space_mb_4">The AI is currently processing the detailed explanation for this specific question.</p>
                                <a href={`/login?redirect=/q/${params.id}`} className="btn btn-secondary text-sm inline-block">
                                    Login to Request Instant AI Sync
                                </a>
                            </div>
                        )}
                    </div>
                </main>

                {/* Strategic Internal Linking Clusters (Semantic Progression) */}
                {relatedLinks.length > 0 && (
                    <div className="space_mb_20">
                        <h3 className="text-lg font-bold tone_white space_mb_4 flex items-center gap-2">
                            <span className="tone_indigo_400"><Icon name="Zap" /></span> Next Steps: Master this Concept
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {relatedLinks.map((link, idx) => (
                                <a href={`/q/${link.q.id}`} key={idx} className="block space_pa_5 radius_xl bg-[#111827] border line_gray_800 hover_line_indigo_500_50 hover_surface_gray_800_50 transition-all group">
                                    <div className="text-xs font-bold tone_indigo_400 space_mb_2 tracking-wider uppercase flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 radius_full surface_indigo_500"></div>
                                        {link.label}
                                    </div>
                                    <h4 className="tone_gray_300 text-sm line-clamp-2 leading-relaxed group-hover_tone_white transition-colors">
                                        {cleanQuestionText(link.q.text)}
                                    </h4>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
