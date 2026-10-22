import { getSupabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params }) {
    const { code } = params;
    
    // We fetch the battle to show who created it and how many questions
    const supabase = getSupabase();
    const { data: battle } = await supabase
        .from('battlegrounds')
        .select(`
            id,
            question_count,
            creator_id
        `)
        .eq('invite_code', code)
        .single();
        
    if (!battle) return { title: 'Battleground Invite Not Found' };

    let creatorName = 'A student';
    let creatorLevel = 1;
    if (battle.creator_id) {
        const { data: creator } = await supabase
            .from('users')
            .select('name, level')
            .eq('id', battle.creator_id)
            .single();
        if (creator) {
            creatorName = creator.name || creatorName;
            creatorLevel = creator.level || creatorLevel;
        }
    }

    const title = `🏟️ ${creatorName} invited you to a Battleground Mega-Quiz!`;
    const description = `${creatorName} (Level ${creatorLevel}) is hosting a live ${battle.question_count || 10}-question NEET battle. Join the lobby now with code: ${code}. Space is limited!`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://aineetcoach.com/battleground/invite/${code}`,
            images: [
                {
                    url: '/og-image-battle.png',
                    width: 1200,
                    height: 630,
                    alt: 'NEET Battleground Lobby',
                },
            ],
            type: 'website',
        },
    };
}

export default function BattlegroundInvitePage({ params }) {
    // We immediately redirect them to the actual app where they can enter the code,
    // or we append it so the client handles auto-joining.
    const { code } = params;
    redirect(`/battleground?joinCode=${code}`);
}
