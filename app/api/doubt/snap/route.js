
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { analyzeImageDoubt } from '@/lib/vision_engine';
import { initializeDatabase } from '@/lib/schema';
import { getDb } from '@/lib/db';

export async function POST(request) {
    try {
        // 1. Auth Check
        const decoded = getUserFromRequest(request);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 2. Parse Form Data (File Upload)
        const formData = await request.formData();
        const file = formData.get('image');

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image too large. Maximum size is 5MB.' }, { status: 400 });
        }

        // 3. Check Subscription Tier from DB (Ensure fresh status)
        await initializeDatabase();
        const db = getDb();
        const user = await db.get("SELECT subscription_tier FROM users WHERE id = ?", [decoded.id]);

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // 4. Process Image
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const solution = await analyzeImageDoubt(
            decoded.id,
            user.subscription_tier,
            buffer,
            file.type
        );

        return NextResponse.json({ success: true, solution });

    } catch (error) {
        console.error('Snap API Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to analyze image'
        }, { status: 500 });
    }
}
