import { getSupabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params }) {
    const { code } = params;
    
    // We fetch the battle to show who created it and how many questions
    const supabase = getSupabase();
    const { data: battle } = await supabase
        .from('battles')
        .select(`
            id,
            questionCount,
            users (name, level)
        `)
        .eq('invite_code', code)
        .single();
        
    if (!battle) return { title: 'Battleground Invite Not Found' };

    const creatorName = battle.users?.name || 'A student';
    const creatorLevel = battle.users?.level || 1;

    const title = `🏟️ ${creatorName} invited you to a Battleground Mega-Quiz!`;
    const description = `${creatorName} (Level ${creatorLevel}) is hosting a live ${battle.questionCount}-question NEET battle. Join the lobby now with code: ${code}. Space is limited!`;

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
