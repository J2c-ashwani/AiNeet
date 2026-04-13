import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { getUserFromRequest } from '@/lib/core/auth';
import { uploadFile } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeString } from '@/lib/validate';

// Helper for RBAC
async function requireAdmin(request) {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') return null;
    return user;
}

export async function POST(request) {
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const subjectId = formData.get('subjectId');
        const chapterId = formData.get('chapterId');
        const rawTitle = formData.get('title');

        if (!file || !subjectId || !chapterId || !rawTitle) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const title = sanitizeString(rawTitle, 500);
        if (!title) return NextResponse.json({ error: 'Invalid title' }, { status: 400 });

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/x-pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
        }
        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${uuidv4()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;

        // Upload to Supabase Storage
        const { url, path: storagePath } = await uploadFile(buffer, fileName, file.type || 'application/pdf');

        // Save to DB
        const supabase = await getDb();
        const id = uuidv4();

        const { error: dbError } = await supabase.from('ncert_books').insert({
            id,
            subject_id: subjectId,
            chapter_id: chapterId,
            title,
            file_path: url,
            created_at: new Date().toISOString()
        });

        if (dbError) throw dbError;

        return NextResponse.json({ success: true, message: 'Book uploaded to cloud storage', bookId: id, url });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
