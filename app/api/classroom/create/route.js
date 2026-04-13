import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const name = formData.get('name');

        const supabase = await getDb();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const { data: userProfile } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (!userProfile || userProfile.role !== 'teacher') {
            return new NextResponse('Unauthorized: Teachers only', { status: 403 });
        }

        if (!name || name.trim().length < 3) {
            return new NextResponse('Invalid classroom name', { status: 400 });
        }

        // Generate brutalist 6-char explicit join code 
        // We use uppercase alphanumerics, avoiding confusing chars like O/0/I/1
        const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let joinCode = "";
        for (let i = 0; i < 6; i++) {
            joinCode += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        const { error: insertError } = await supabase.from('classrooms').insert({
            teacher_id: user.id,
            name: name.trim(),
            join_code: joinCode
        });

        if (insertError) {
            console.error('Class creation error:', insertError);
            return new NextResponse('Internal Error', { status: 500 });
        }

        // Redirect back to educator dashboard
        return NextResponse.redirect(new URL('/educator', request.url));

    } catch (error) {
        console.error('Classroom Creation Error:', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
