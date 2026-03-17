import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const all = db.select().from(users).all();
    return NextResponse.json(all.map(u => ({ ...u, avatarColor: u.avatarColor })));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = new Date().toISOString();
    db.insert(users).values({ id, name: body.name, email: body.email, avatarColor: body.avatarColor ?? '#6366f1', role: body.role ?? 'member', createdAt }).run();
    const user = db.select().from(users).where(eq(users.id, id)).get();
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
