import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url || !url.startsWith('https://ncert.nic.in/textbook/pdf/')) {
            return NextResponse.json({ error: 'Invalid or missing NCERT URL' }, { status: 400 });
        }

        // Fetch the PDF from NCERT servers
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NEETCoach/1.0)',
                'Accept': 'application/pdf',
                'Referer': 'https://ncert.nic.in/'
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch from NCERT: ${response.status} ${response.statusText}`);
            return NextResponse.json({ error: 'Failed to fetch PDF from NCERT' }, { status: response.status });
        }

        // Return the PDF buffer with appropriate content type and CORS headers
        const pdfBuffer = await response.arrayBuffer();

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
