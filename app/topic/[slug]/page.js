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
        return <div className="text-center py-20 text-white">Topic not found</div>;
    }

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-white pt-24 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <nav className="text-sm text-gray-400 mb-8">
                    <a href="/" className="hover:text-indigo-400">Home</a>
                    <span className="mx-2">/</span>
                    <span className="text-gray-300">Topics</span>
                    <span className="mx-2">/</span>
                    <span className="text-indigo-300">{topic.slug}</span>
                </nav>
                
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    {topic.title}
                </h1>
                
                <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light">
                    {topic.description}
                </p>
                
                <article className="prose prose-invert prose-lg max-w-none bg-white/5 p-8 rounded-2xl border border-white/10 mb-12">
                    <p className="text-gray-200 leading-8">
                        {topic.content}
                    </p>
                </article>
                
                <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-8 border border-white/10 text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to accelerate your NEET prep?</h2>
                    <p className="text-gray-300 mb-6">Join thousands of students using AI to boost their scores.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/register" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">
                            Start Free Trial
                        </a>
                        <a href="/test/configure" className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold border border-white/10 transition-all">
                            Take a Mock Test
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
