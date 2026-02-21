import { NextResponse } from 'next/server';
import { NEET_BLUEPRINT } from '@/lib/ncert-data';

/**
 * GET /api/blueprint — NEET Exam Blueprint Data
 * Returns year-wise chapter question distribution for all subjects
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const subject = searchParams.get('subject'); // physics, chemistry, biology

        if (subject && NEET_BLUEPRINT[subject]) {
            return NextResponse.json({
                subject,
                data: NEET_BLUEPRINT[subject],
                years: [2021, 2022, 2023, 2024],
            });
        }

        // Return all subjects
        return NextResponse.json({
            subjects: ['physics', 'chemistry', 'biology'],
            data: NEET_BLUEPRINT,
            years: [2021, 2022, 2023, 2024],
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
