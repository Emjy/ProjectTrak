import { NextRequest, NextResponse } from 'next/server';
import { db, tasks, taskAssignees } from '@/db';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    db.update(tasks).set({
      title: body.title,
      description: body.description ?? '',
      status: body.status,
      priority: body.priority,
      teamId: body.teamId ?? null,
      dueDate: body.dueDate ?? null,
    }).where(eq(tasks.id, id)).run();

    // Replace assignees
    if (Array.isArray(body.assigneeIds)) {
      db.delete(taskAssignees).where(eq(taskAssignees.taskId, id)).run();
      for (const userId of body.assigneeIds as string[]) {
        const aid = `ta_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        db.insert(taskAssignees).values({ id: aid, taskId: id, userId }).run();
      }
    }

    const task = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const assignees = db.select().from(taskAssignees).where(eq(taskAssignees.taskId, id)).all();
    return NextResponse.json({
      ...task,
      dueDate: task.dueDate ?? undefined,
      teamId: task.teamId ?? undefined,
      assigneeIds: assignees.map(a => a.userId),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    db.delete(tasks).where(eq(tasks.id, id)).run();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
