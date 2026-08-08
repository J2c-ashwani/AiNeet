import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    const supabase = await getDb();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || 'Invalid refresh token' }, { status: 401 });
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: data.user,
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
}
