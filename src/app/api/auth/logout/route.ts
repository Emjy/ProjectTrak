import { NextResponse } from 'next/server';
import { makeClearCookieHeader } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.append('Set-Cookie', makeClearCookieHeader());
  return res;
}
