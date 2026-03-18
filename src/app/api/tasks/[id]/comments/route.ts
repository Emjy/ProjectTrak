import { NextRequest, NextResponse } from 'next/server';
import { db, taskComments, users, eq } from '@/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: taskId } = await params;
  const rows = await db.select({
    id: taskComments.id,
    taskId: taskComments.taskId,
    authorId: taskComments.authorId,
    content: taskComments.content,
    createdAt: taskComments.createdAt,
    authorName: users.name,
    authorAvatarColor: users.avatarColor,
    authorEmail: users.email,
    authorRole: users.role,
    authorCreatedAt: users.createdAt,
  })
    .from(taskComments)
    .leftJoin(users, eq(taskComments.authorId, users.id))
    .where(eq(taskComments.taskId, taskId))
    .orderBy(taskComments.createdAt);

  const comments = rows.map(r => ({
    id: r.id,
    taskId: r.taskId,
    authorId: r.authorId,
    content: r.content,
    createdAt: r.createdAt,
    author: r.authorName ? {
      id: r.authorId,
      name: r.authorName,
      email: r.authorEmail ?? '',
      avatarColor: r.authorAvatarColor ?? '#6366f1',
      role: (r.authorRole ?? 'member') as 'admin' | 'member',
      createdAt: r.authorCreatedAt ?? '',
    } : undefined,
  }));

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: taskId } = await params;
  const body = await req.json();
  const { authorId, content } = body as { authorId: string; content: string };

  if (!authorId || !content?.trim()) {
    return NextResponse.json({ error: 'authorId and content required' }, { status: 400 });
  }

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  await db.insert(taskComments).values({ id, taskId, authorId, content: content.trim(), createdAt });

  const author = (await db.select().from(users).where(eq(users.id, authorId)))[0];

  return NextResponse.json({
    id, taskId, authorId, content: content.trim(), createdAt,
    author: author ?? undefined,
  });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body as { id: string };
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await db.delete(taskComments).where(eq(taskComments.id, id));
  return NextResponse.json({ ok: true });
}
