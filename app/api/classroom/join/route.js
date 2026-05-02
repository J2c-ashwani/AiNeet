import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
    try {
        const supabase = await getDb();
        let _body;
        try { _body = await request.json(); } catch (parseErr) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        const { code } = _body;

        // 1. JWT Assurance
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
        }

        // 2. MD Mandate: Prevent Join Guessing Attack
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limitPos = await rateLimit(`${ip}:classroom_join`, 3, 60000, 'open'); // 3 tries per minute
        if (!limitPos.success) {
            return NextResponse.json({ 
                error: 'Too many attempts. Please wait 60 seconds.',
                code: 'RATE_LIMITED' 
            }, { status: 429 });
        }

        const joinCode = code?.trim().toUpperCase();
        if (!joinCode || joinCode.length < 5) {
            return NextResponse.json({ error: 'Invalid join code format', code: 'INVALID_FORMAT' }, { status: 400 });
        }

        // 3. Locate Classroom
        const { data: classroom } = await supabase
            .from('classrooms')
            .select('id, name, teacher_id')
            .eq('join_code', joinCode)
            .eq('is_active', true)
            .single();

        if (!classroom) {
            return NextResponse.json({ error: 'Classroom not found or inactive', code: 'NOT_FOUND' }, { status: 404 });
        }

        // 4. Concurrency Enforcements (Max Size & Pre-Existing)
        const { count: studentCount } = await supabase
            .from('classroom_students')
            .select('*', { count: 'exact', head: true })
            .eq('classroom_id', classroom.id);
            
        if (studentCount >= 200) {
            return NextResponse.json({ error: 'This classroom is full (Max 200).', code: 'CLASS_FULL' }, { status: 403 });
        }

        const { data: existingJoin } = await supabase
            .from('classroom_students')
            .select('*')
            .eq('classroom_id', classroom.id)
            .eq('student_id', user.id)
            .single();

        if (existingJoin) {
            return NextResponse.json({ error: 'You are already in this classroom.', code: 'ALREADY_JOINED' }, { status: 400 });
        }

        // 5. Establish Relational Link
        const { error: joinError } = await supabase
            .from('classroom_students')
            .insert({
                classroom_id: classroom.id,
                student_id: user.id,
                joined_via_code: joinCode
            });

        if (joinError) {
            console.error('Join Insertion Error', joinError);
            return NextResponse.json({ error: 'Failed to join classroom.. Please try again in a moment.', code: 'SYSTEM_ERROR' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully joined ${classroom.name}`,
            classroomName: classroom.name
        });

    } catch (error) {
        console.error('Classroom Join error:', error);
        return NextResponse.json({ error: 'Classroom operation failed. Please try again.' }, { status: 500 });
    }
}
