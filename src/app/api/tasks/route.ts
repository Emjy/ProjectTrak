import { NextRequest, NextResponse } from 'next/server';
import { db, tasks, taskAssignees } from '@/db';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    db.insert(tasks).values({
      id,
      projectId: body.projectId,
      title: body.title,
      description: body.description ?? '',
      status: body.status ?? 'todo',
      priority: body.priority ?? 'medium',
      teamId: body.teamId ?? null,
      dueDate: body.dueDate ?? null,
    }).run();

    // Insert assignees
    const assigneeIds: string[] = body.assigneeIds ?? [];
    for (const userId of assigneeIds) {
      const aid = `ta_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      db.insert(taskAssignees).values({ id: aid, taskId: id, userId }).run();
    }

    const inserted = db.select().from(tasks).where(eq(tasks.id, id)).get();
    return NextResponse.json({
      ...inserted,
      dueDate: inserted?.dueDate ?? undefined,
      teamId: inserted?.teamId ?? undefined,
      assigneeIds,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
