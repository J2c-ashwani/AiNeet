import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// ISR Settings: Revalidate at most once every 24 hours (86400s)
export const revalidate = 86400;

export async function generateMetadata({ params }) {
    const supabase = await createSupabaseServerClient();
    const { data: page } = await supabase.from('seo_pages')
        .select('title, meta_description')
        .eq('slug', params.slug)
        .single();

    if (!page) return {};
    return {
        title: `${page.title} | NEET Coach`,
        description: page.meta_description,
        openGraph: {
            title: page.title,
            description: page.meta_description,
            type: 'article',
        }
    };
}

export default async function DoubtSEOPage({ params }) {
    const supabase = await createSupabaseServerClient();
    const { data: page } = await supabase.from('seo_pages')
        .select('*')
        .eq('slug', params.slug)
        .single();

    if (!page) {
        notFound();
    }

    // Increment impressions in background
    supabase.rpc('increment_seo_impressions', { page_slug: params.slug }).then();

    return (
        <React.Fragment>
            {/* Inject JSON-LD QAPage Data For Google Rich Snippets */}
            {page.json_ld && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: page.json_ld }}
                />
            )}

            <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', minHeight: '100vh', color: '#f8fafc' }}>
                <header style={{ marginBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 24 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '4px 10px', borderRadius: 20, fontWeight: 700, letterSpacing: '0.05em' }}>
                            NEET MASTERCLASS
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Updated: {new Date(page.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
                        {page.title}
                    </h1>
                    
                    <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1.6 }}>
                        {page.meta_description}
                    </p>
                </header>

                <article className="prose prose-invert lg:prose-xl" style={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                    >
                        {page.content_markdown}
                    </ReactMarkdown>
                </article>

                {/* Call To Action (Distribution Loop) */}
                <div style={{ marginTop: 60, padding: 32, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', borderRadius: 16, border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }}>
                        Test yourself on similar NEET questions
                    </h3>
                    <p style={{ color: '#cbd5e1', marginBottom: 24, fontSize: '1rem' }}>
                        Join 3000+ students tracking their mistake heatmaps to crush the exact topics you struggle with.
                    </p>
                    <a href="/register?utm_source=seo&utm_medium=doubt_page&utm_campaign=programmatic_seo" style={{ display: 'inline-block', background: '#6366f1', color: '#fff', padding: '12px 28px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s', fontSize: '1.1rem' }}>
                        Start Free Mock Test 🚀
                    </a>
                </div>
            </main>
        </React.Fragment>
    );
}
