import NCERTLibraryClient from './NCERTLibraryClient';
import { Suspense } from 'react';

export const metadata = {
    title: 'NCERT Smart Library for NEET 2026',
    description: 'Read chapter-wise PDFs from official NCERT. Solve chapter-wise previous year questions (PYQs) aligned with NEET syllabus.',
};

export const dynamic = 'force-dynamic';

export default function Page() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60, minHeight: '50vh', alignItems: 'center' }}>
                <div className="spinner" style={{ width: 40, height: 40 }}></div>
            </div>
        }>
            <NCERTLibraryClient />
        </Suspense>
    );
}
