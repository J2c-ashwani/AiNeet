import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        
        // MD Mandate 3: Keepalive MUST Touch DB. Just fetching 'id' limits memory load.
        const { data, error } = await supabase.from('users').select('id').limit(1);
        
        if (error) {
            console.error('Keepalive DB Error:', error);
            // Even an error technically wakes the DB, but we want status 500 to detect real outages
            return NextResponse.json({ status: 'waking', details: error.message }, { status: 500 });
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
