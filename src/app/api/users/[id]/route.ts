import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    db.update(users).set({ name: body.name, email: body.email, avatarColor: body.avatarColor, role: body.role }).where(eq(users.id, params.id)).run();
    const user = db.select().from(users).where(eq(users.id, params.id)).get();
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    db.delete(users).where(eq(users.id, params.id)).run();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
