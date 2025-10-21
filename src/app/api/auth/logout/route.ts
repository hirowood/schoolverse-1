import { NextResponse } from 'next/server';

// Stateless JWT: client deletes token. This endpoint returns 200 for symmetry.
export async function POST() {
  return NextResponse.json({ ok: true });
}
