import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/core/auth';
import { getUserEntitlement } from '@/lib/entitlement';

export async function GET(request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const entitlement = await getUserEntitlement(user.id);

        return NextResponse.json(entitlement);
    } catch (error) {
        console.error('Subscription Status Error:', error);
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}
