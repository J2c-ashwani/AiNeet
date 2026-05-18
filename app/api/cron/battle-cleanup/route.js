import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';
import { safeUpdate } from '@/lib/core/db-safe';
import { logAcademicEvent } from '@/lib/core/academic-timeline';
import { requireBearerSecret } from '@/lib/server-secrets';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const authError = requireBearerSecret(request, 'CRON_SECRET');
        if (authError) return authError;

        const supabase = await getDb();

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
                await safeUpdate('battlegrounds', { id: battle.id }, { status: 'completed' }, {
                    route: '/api/cron/battle-cleanup',
                    userId: 'system',
                });
                
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
