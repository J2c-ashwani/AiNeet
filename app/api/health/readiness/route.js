import { NextResponse } from 'next/server';
import { getDb } from '@/lib/core/db';

export async function GET() {
  try {
    const supabase = await getDb();
    // Minimal DB probe
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    return NextResponse.json({ ready: true, database: 'reachable' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ready: false, database: 'error', error: err?.message }, { status: 503 });
  }
}
