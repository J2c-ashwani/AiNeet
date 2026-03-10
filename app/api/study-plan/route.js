import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { generateStudyPlan } from '@/lib/ai-engine';

export async function GET(request) {
    try {
        const supabase = getSupabase();
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        const { data: performance } = await supabase
            .from('user_performance')
            .select(`
                *,
                topics!inner(name, chapters!inner(name, subjects!inner(name)))
            `)
            .eq('user_id', decoded.id)
            .order('accuracy', { ascending: true });

        // Map the relational data to match the old shape expected by generateStudyPlan
        const mappedPerformance = (performance || []).map(p => ({
            ...p,
            topic_name: p.topics?.name,
            chapter_name: p.topics?.chapters?.name
        }));

        const plan = generateStudyPlan(mappedPerformance);
        return NextResponse.json({ plan });
    } catch (error) {
        console.error('Study plan error:', error);
        return NextResponse.json({ error: 'Failed to generate study plan' }, { status: 500 });
    }
}
