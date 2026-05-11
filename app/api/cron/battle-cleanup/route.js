import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { logAcademicEvent } from '@/lib/core/academic-timeline';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const supabase = await getDb();
        
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find active battles older than 1 hour (abandoned)
        const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
        
        const { data: abandonedBattles } = await supabase
            .from('battlegrounds')
            .select('id')
            .eq('status', 'active')
            .lt('created_at', oneHourAgo);

        let cleaned = 0;

        if (abandonedBattles && abandonedBattles.length > 0) {
            for (const battle of abandonedBattles) {
                // Force end them
                await supabase
                    .from('battlegrounds')
                    .update({ status: 'completed' })
                    .eq('id', battle.id);
                
                await logAcademicEvent({
                    eventType: 'battle_abandoned',
                    userId: 'system',
                    payload: { battleId: battle.id },
                    sourceRoute: 'cron-battle-cleanup'
                });
                
                cleaned++;
            }
        }

        return NextResponse.json({ message: 'Battle cleanup complete', cleaned });

    } catch (error) {
        console.error('Battle Cleanup Error:', error);
        return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
    }
}
