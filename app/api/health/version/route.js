import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: process.env.npm_package_version || '1.0.0',
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    origin: process.env.NEET_API_ORIGIN || 'unknown',
  });
}
