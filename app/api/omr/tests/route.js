import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

/**
 * OMR Test List API
 * 
 * Dynamically generates the list of available tests from the PYQ questions table.
 * Groups by year_asked so new PYQ uploads automatically appear in the OMR scanner.
 * No manual offline_tests table maintenance needed.
 */
export async function GET() {
    try {
        const supabase = await getDb();
        
        // Fetch distinct years from questions table
        const { data: questions, error } = await supabase
            .from('questions')
            .select('year_asked')
            .eq('is_pyq', 1)
            .not('year_asked', 'is', null);

        if (error) throw error;

        // Group and count by year
        const yearMap = {};
        (questions || []).forEach(q => {
            const year = q.year_asked?.trim();
            if (!year) return;
            yearMap[year] = (yearMap[year] || 0) + 1;
        });

        // Convert to test list, sorted newest first
        const tests = Object.entries(yearMap)
            .filter(([year, count]) => count >= 10) // Only show years with meaningful question count
            .sort((a, b) => {
                // Sort by year descending, handling "2015 Re" style entries
                const yearA = parseInt(a[0]);
                const yearB = parseInt(b[0]);
                return yearB - yearA;
            })
            .map(([year, count]) => ({
                id: `pyq_${year.replace(/\s+/g, '_').toLowerCase()}`,
                test_name: `NEET ${year} Official Paper`,
                provider: 'NEET PYQ',
                total_questions: count,
                year: year,
            }));

        // Also include any manually added offline tests (coaching institute papers etc.)
        const { data: manualTests } = await supabase
            .from('offline_tests')
            .select('id, test_name, provider, total_questions');

        const allTests = [...tests, ...(manualTests || [])];

        return NextResponse.json({ tests: allTests });
    } catch (error) {
        console.error('OMR test list error:', error);
        return NextResponse.json({ error: 'Failed to load tests' }, { status: 500 });
    }
}
