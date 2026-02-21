import { NextResponse } from 'next/server';
import { NEET_BLUEPRINT } from '@/lib/ncert-data';
import { CHAPTER_WISE_BLUEPRINT } from '@/lib/blueprint-chapter-data';

/**
 * GET /api/blueprint — NEET Exam Blueprint Data
 * Returns year-wise chapter/topic question distribution
 * Accepts ?subject=biology&viewType=chapter
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const subject = searchParams.get('subject'); // physics, chemistry, biology
        const viewType = searchParams.get('viewType') || 'topic'; // 'topic' or 'chapter'

        const DATA_SOURCE = viewType === 'chapter' ? CHAPTER_WISE_BLUEPRINT : NEET_BLUEPRINT;
        let years = [2021, 2022, 2023, 2024]; // default topic years

        if (viewType === 'chapter') {
            // Dynamically get all years/phases from the first entry of biology data
            const sampleChapter = Object.keys(CHAPTER_WISE_BLUEPRINT.biology || {})[0];
            if (sampleChapter) {
                years = Object.keys(CHAPTER_WISE_BLUEPRINT.biology[sampleChapter]);
            }
        }

        if (subject && DATA_SOURCE[subject]) {
            return NextResponse.json({
                subject,
                viewType,
                data: DATA_SOURCE[subject],
                years,
            });
        }

        // Return all available subjects
        return NextResponse.json({
            subjects: Object.keys(DATA_SOURCE),
            viewType,
            data: DATA_SOURCE,
            years,
            meta: {
                totalQuestions: { physics: 45, chemistry: 45, biology: 90 },
                totalMarks: 720,
                marksPerQuestion: 4,
                negativeMarking: -1,
            }
        });
    } catch (error) {
        console.error('Blueprint API error:', error);
        return NextResponse.json({ error: 'Failed to fetch blueprint data' }, { status: 500 });
    }
}
