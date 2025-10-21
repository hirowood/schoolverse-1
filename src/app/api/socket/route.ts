import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001' });
}

