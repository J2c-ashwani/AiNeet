import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { requireBearerSecret } from '@/lib/server-secrets';

export async function GET(request) {
    const unauthorized = requireBearerSecret(request, 'CRON_SECRET');
    if (unauthorized) return unauthorized;

    try {
        const supabase = await getDb();
        
        const { error } = await supabase.from('feature_flags').select('id').limit(1);
        
        if (error) {
            console.error('Keepalive DB Error:', error);
            return NextResponse.json({ status: 'degraded' }, { status: 500 });
        }
        
        return NextResponse.json({ 
            status: 'awake', 
            database_ping: 'successful',
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.error('Keepalive Exception:', e);
        return NextResponse.json({ status: 'cold_start_or_error' }, { status: 500 });
    }
}
