import { NextRequest, NextResponse } from 'next/server';
import { db, taskComments, tasks, projects, users } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  // Find all comments that mention this user
  const mention = `@{${userId}}`;
  const allComments = db.select().from(taskComments).orderBy(taskComments.createdAt).all();
  const mentioned = allComments.filter(c => c.content.includes(mention));

  if (mentioned.length === 0) return NextResponse.json([]);

  const allTasks = db.select().from(tasks).all();
  const allProjects = db.select().from(projects).all();
  const allUsers = db.select().from(users).all();

  const result = mentioned.map(c => {
    const task = allTasks.find(t => t.id === c.taskId);
    const project = task ? allProjects.find(p => p.id === task.projectId) : undefined;
    const author = allUsers.find(u => u.id === c.authorId);
    return {
      id: c.id,
      commentId: c.id,
      taskId: c.taskId,
      taskTitle: task?.title ?? '',
      projectId: project?.id ?? '',
      projectName: project?.name ?? '',
      authorId: c.authorId,
      authorName: author?.name ?? 'Inconnu',
      authorAvatarColor: author?.avatarColor ?? '#6366f1',
      content: c.content,
      createdAt: c.createdAt,
    };
  });

  return NextResponse.json(result);
}
