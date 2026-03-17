import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { hashPassword, makeSessionCookieHeader } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET: verify token is valid, return user name
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
  const user = db.select().from(users).where(eq(users.inviteToken, token)).get();
  if (!user) return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 });
  return NextResponse.json({ name: user.name, email: user.email });
}

// POST: activate account with password
export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Mot de passe trop court' }, { status: 400 });

  const user = db.select().from(users).where(eq(users.inviteToken, token)).get();
  if (!user) return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 });

  db.update(users)
    .set({ passwordHash: hashPassword(password), inviteToken: null, mustChangePassword: false })
    .where(eq(users.id, user.id))
    .run();

  const res = NextResponse.json({ ok: true });
  res.headers.append('Set-Cookie', makeSessionCookieHeader({ userId: user.id, orgId: user.orgId!, role: user.role as 'admin' | 'member' }));
  return res;
}
