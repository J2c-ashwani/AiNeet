import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeInsert } from '@/lib/core/db-safe';
import { getUserFromRequest } from '@/lib/core/auth';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const decoded = await getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

        let body;
        try { body = await request.json(); } catch (err) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const { testId, answers, timeRemainingSeconds } = body;

        if (!testId || typeof timeRemainingSeconds !== 'number' || !Array.isArray(answers)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await getDb();

        // 1. Verify test exists and is not completed
        const { data: test } = await supabase
            .from('tests')
            .select('completed_at, expires_at')
            .eq('id', testId)
            .eq('user_id', decoded.id)
            .single();

        if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        if (test.completed_at) return NextResponse.json({ error: 'Test already completed' }, { status: 400 });

        if (test.expires_at && new Date() > new Date(test.expires_at)) {
            return NextResponse.json({ error: 'Test expired' }, { status: 403 });
        }

        // 2. Generate Checksum
        const payloadStr = JSON.stringify(answers);
        const hash = crypto.createHash('sha256').update(payloadStr).digest('hex');

        // 3. Get latest version
        const { data: latestSave } = await supabase
            .from('test_autosaves')
            .select('version_number')
            .eq('test_id', testId)
            .order('version_number', { ascending: false })
            .limit(1)
            .maybeSingle();

        const newVersion = (latestSave?.version_number || 0) + 1;

        // 4. Insert new autosave
        await safeInsert('test_autosaves', {
            test_id: testId,
            user_id: decoded.id,
            version_number: newVersion,
            answers: answers,
            time_remaining_seconds: timeRemainingSeconds,
            hash: hash
        }, { route: '/api/tests/save', userId: decoded.id });

        // 5. Cleanup older versions (keep only latest and previous)
        if (newVersion > 2) {
            // Non-blocking cleanup
            supabase.from('test_autosaves')
                .delete()
                .eq('test_id', testId)
                .lt('version_number', newVersion - 1)
                .then(() => {})
                .catch(err => console.error('Cleanup error:', err.message));
        }

        return NextResponse.json({ success: true, version: newVersion });

    } catch (error) {
        console.error('Autosave error:', error);
        return NextResponse.json({ error: 'Failed to autosave' }, { status: 500 });
    }
}
