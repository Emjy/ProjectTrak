'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, User, Team } from '@/types';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

interface KanbanCardProps {
  task: Task;
  users: User[];
  teams: Team[];
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function KanbanCard({ task, users, teams, onView, onEdit, onDelete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const assignees = (task.assigneeIds ?? []).map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
  const team = task.teamId ? teams.find(t => t.id === task.teamId) : null;
  const isOverdue = task.status !== 'done' && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-xl border border-slate-200 p-3 shadow-sm cursor-grab active:cursor-grabbing group ${
        isDragging ? 'shadow-lg ring-2 ring-indigo-300' : 'hover:shadow-md hover:border-slate-300'
      } transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={e => { e.stopPropagation(); onView(); }}
            onPointerDown={e => e.stopPropagation()}
            className={`text-sm font-medium leading-snug text-left hover:underline ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800 hover:text-indigo-600'}`}
          >
            {task.title}
          </button>
          {task.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={e => { e.stopPropagation(); onEdit(); }} onPointerDown={e => e.stopPropagation()}
            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} onPointerDown={e => e.stopPropagation()}
            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Team badge */}
      {team && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium text-white"
            style={{ backgroundColor: team.color + 'cc' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            {team.name}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <Badge variant={task.priority} />
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`text-xs ${isOverdue ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
              {formatDate(task.dueDate)}
            </span>
          )}
          {/* Multiple assignee avatars */}
          {assignees.length > 0 && (
            <div className="flex -space-x-1.5">
              {assignees.slice(0, 3).map(u => <Avatar key={u.id} user={u} size="xs" showTooltip />)}
              {assignees.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[9px] font-medium text-slate-600">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
