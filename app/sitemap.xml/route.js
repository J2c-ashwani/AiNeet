import { getDb } from '@/lib/db';
import { initializeDatabase } from '@/lib/schema';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent static caching

export async function GET() {
    try {
        await initializeDatabase();
        const db = getDb();

        const baseUrl = process.env.BASE_URL || 'https://aineetcoach.com';

        // 1. Static Pages
        const staticPages = [
            '',
            '/pricing',
            '/about', // Add if exists
            '/contact', // Add if exists
            '/login',
            '/register',
        ];

        // 2. Fetch all Question IDs for the pSEO pages
        console.log("Sitemap Generation - Postgres Mode:", !!process.env.DATABASE_URL);

        // Select only the ID to keep the query fast. 
        const questions = await db.all(`SELECT id FROM questions LIMIT 10000`);
        console.log("Questions found for sitemap:", questions.length);

        // 3. Build the XML String
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add static routes
        for (const page of staticPages) {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}${page}</loc>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
            xml += `  </url>\n`;
        }

        // Add dynamic question routes (pSEO)
        // Set priority slightly lower (0.5) so core pages rank higher internally
        for (const q of questions) {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}/q/${q.id}</loc>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>0.5</priority>\n`;
            xml += `  </url>\n`;
        }

        xml += '</urlset>';

        // Return with appropriate XML content type
        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate'
            },
        });

    } catch (error) {
        console.error('Error generating sitemap:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
