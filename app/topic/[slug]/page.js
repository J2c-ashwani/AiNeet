import { topics } from '../data';
import Link from 'next/link';
import { getDb } from '@/lib/core/db'; // Ensure dynamic functions if needed, but this is static

export async function generateStaticParams() {
    return topics.map((topic) => ({
        slug: topic.slug,
    }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const topic = topics.find((t) => t.slug === slug);
    
    if (!topic) return { title: 'Topic Not Found' };
    
    return {
        title: topic.title,
        description: topic.description,
        openGraph: {
            title: topic.title,
            description: topic.description,
            type: 'article',
        }
    };
}

export default async function TopicPage({ params }) {
    const { slug } = await params;
    const topic = topics.find((t) => t.slug === slug);

    if (!topic) {
        return <div className="text-center space_py_20 tone_white">Topic not found</div>;
    }

    return (
        <div className="min-h-screen bg-[#0a0e1a] tone_white space_pt_24 space_pb_20 space_px_6">
            <div className="max-w-4xl mx-auto">
                <nav className="text-sm tone_gray_400 space_mb_8">
                    <a href="/" className="hover_tone_indigo_400">Home</a>
                    <span className="space_mx_2">/</span>
                    <span className="tone_gray_300">Topics</span>
                    <span className="space_mx_2">/</span>
                    <span className="tone_indigo_300">{topic.slug}</span>
                </nav>
                
                <h1 className="text-4xl md:text-5xl font-extrabold space_mb_6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    {topic.title}
                </h1>
                
                <p className="text-xl tone_gray_300 space_mb_10 leading-relaxed font-light">
                    {topic.description}
                </p>
                
                <article className="prose prose-invert prose-lg max-w-none surface_white_5 space_pa_8 radius_2xl border line_white_10 space_mb_12">
                    <p className="tone_gray_200 leading-8">
                        {topic.content}
                    </p>
                </article>
                
                <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 radius_2xl space_pa_8 border line_white_10 text-center">
                    <h2 className="text-2xl font-bold space_mb_4">Ready to accelerate your NEET prep?</h2>
                    <p className="tone_gray_300 space_mb_6">Join thousands of students using AI to boost their scores.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/register" className="space_px_8 space_py_4 surface_indigo_600 hover_surface_indigo_500 radius_xl font-bold transition-all shadow-lg shadow-indigo-500/20">
                            Start Free Trial
                        </a>
                        <a href="/test/configure" className="space_px_8 space_py_4 surface_white_10 hover_surface_white_20 radius_xl font-bold border line_white_10 transition-all">
                            Take a Mock Test
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
