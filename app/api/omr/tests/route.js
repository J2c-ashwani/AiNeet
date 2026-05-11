import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

/**
 * OMR Test List API
 * 
 * Dynamically generates the list of available tests from the PYQ questions table.
 * Groups by year_asked, includes subject-wise breakdown for trust/clarity.
 * Auto-updates when new PYQs are uploaded — zero manual maintenance.
 */
export async function GET() {
    try {
        const supabase = await getDb();
        
        // Fetch year + subject for each PYQ question
        let allQuestions = [];
        let page = 0;
        while (true) {
            const { data, error } = await supabase
                .from('questions')
                .select('year_asked, subjects!inner(name)')
                .eq('is_pyq', 1)
                .not('year_asked', 'is', null)
                .range(page * 1000, (page + 1) * 1000 - 1);
            
            if (error) throw error;
            if (!data || data.length === 0) break;
            allQuestions = allQuestions.concat(data);
            page++;
        }

        // Group by year with subject breakdown
        const yearMap = {};
        allQuestions.forEach(q => {
            const year = q.year_asked?.trim();
            if (!year) return;
            
            if (!yearMap[year]) {
                yearMap[year] = { total: 0, subjects: {} };
            }
            yearMap[year].total++;
            
            const subjectName = q.subjects?.name || 'Other';
            yearMap[year].subjects[subjectName] = (yearMap[year].subjects[subjectName] || 0) + 1;
        });

        // Convert to test list, sorted newest first
        const tests = Object.entries(yearMap)
            .filter(([, data]) => data.total >= 10)
            .sort((a, b) => {
                const yearA = parseInt(a[0]);
                const yearB = parseInt(b[0]);
                return yearB - yearA;
            })
            .map(([year, data]) => {
                // Build subject breakdown string
                const subjectParts = [];
                ['Physics', 'Chemistry', 'Biology'].forEach(sub => {
                    if (data.subjects[sub]) {
                        subjectParts.push(`${sub}: ${data.subjects[sub]}`);
                    }
                });

                return {
                    id: `pyq_${year.replace(/\s+/g, '_').toLowerCase()}`,
                    test_name: `NEET ${year} Official Paper`,
                    provider: 'NEET PYQ',
                    total_questions: data.total,
                    year: year,
                    subject_breakdown: subjectParts.join(' • '),
                    subjects: data.subjects,
                };
            });

        // Also include any manually added offline tests
        const { data: manualTests } = await supabase
            .from('offline_tests')
            .select('id, test_name, provider, total_questions');

        const allTests = [
            ...tests, 
            ...(manualTests || []).map(t => ({ ...t, subject_breakdown: '', subjects: {} }))
        ];

        return NextResponse.json({ tests: allTests });
    } catch (error) {
        console.error('OMR test list error:', error);
        return NextResponse.json({ error: 'Failed to load tests' }, { status: 500 });
    }
}
