import crypto from 'crypto';
import { NextResponse } from 'next/server';

const PLACEHOLDER_PATTERN = /^(changeme|change-me|dummy|mock|placeholder|redacted|undefined|null)$/i;

export function getRequiredServerSecret(name) {
    const value = process.env[name]?.trim();
    if (!value || PLACEHOLDER_PATTERN.test(value) || value.includes('*****')) {
        return null;
    }
    return value;
}

export function timingSafeEqual(left, right) {
    const leftBuffer = Buffer.from(String(left || ''));
    const rightBuffer = Buffer.from(String(right || ''));
    return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function requireRequestSecret(request, { envName, bearer = false, headers = [], query = [] }) {
    const secret = getRequiredServerSecret(envName);
    if (!secret) {
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const candidates = [];
    if (bearer) {
        candidates.push({ value: request.headers.get('authorization') || '', type: 'bearer' });
    }
    for (const headerName of headers) {
        candidates.push({ value: request.headers.get(headerName) || '', type: 'raw' });
    }
    if (query.length > 0) {
        const url = new URL(request.url);
        for (const queryName of query) {
            candidates.push({ value: url.searchParams.get(queryName) || '', type: 'raw' });
        }
    }

    const isAuthorized = candidates.some(({ value, type }) => {
        if (type === 'bearer') {
            return timingSafeEqual(value, `Bearer ${secret}`);
        }
        return timingSafeEqual(value, secret);
    });

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}

export function requireBearerSecret(request, envName) {
    return requireRequestSecret(request, { envName, bearer: true });
}
