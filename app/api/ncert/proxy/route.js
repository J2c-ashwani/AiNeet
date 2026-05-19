import { NextResponse } from 'next/server';
import { checkedFetch } from '@/lib/http';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url || !url.startsWith('https://ncert.nic.in/textbook/pdf/')) {
            return NextResponse.json({ error: 'Invalid or missing NCERT URL' }, { status: 400 });
        }

        // Fetch the PDF from NCERT servers
        const response = await checkedFetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NEETCoach/1.0)',
                'Accept': 'application/pdf',
                'Referer': 'https://ncert.nic.in/'
            }
        }, {
            timeoutMs: 12_000,
            maxBytes: 25 * 1024 * 1024,
            errorMessage: 'Failed to fetch PDF from NCERT',
        });

        // Return the PDF buffer with appropriate content type and CORS headers
        const pdfBuffer = await response.arrayBuffer();
        if (pdfBuffer.byteLength > 25 * 1024 * 1024) {
            return NextResponse.json({ error: 'NCERT PDF is too large to proxy safely' }, { status: 413 });
        }

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Length': pdfBuffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=86400', // Cache for 1 day
                'Access-Control-Allow-Origin': '*',
                'Content-Disposition': 'inline',
            }
        });

    } catch (error) {
        console.error('PDF Proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error fetching PDF' }, { status: 500 });
    }
}
