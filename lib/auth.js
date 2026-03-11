// Authentication is now fully managed by Supabase SSR
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function getUserFromRequest(request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        // Fetch remaining public profile data
        const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

        if (profile) {
            return {
                id: user.id,
                email: user.email,
                name: profile.name,
                role: profile.role || 'student',
                ...profile
            }
        }

        return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || 'User',
            role: 'student'
        }
    } catch (error) {
        console.error('Supabase get user error:', error);
        return null;
    }
}
