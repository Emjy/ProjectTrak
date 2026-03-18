'use client';

import { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { useApp } from '@/context/AppContext';
import ActualTimeModal from '@/components/tasks/ActualTimeModal';
import { formatTimeWithUnit } from '@/lib/time';

interface TaskItemProps {
  task: Task;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function CircleIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-slate-400 transition-colors">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

const statusCycle: Record<TaskStatus, TaskStatus> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
}

export default function TaskItem({ task, onView, onEdit, onDelete }: TaskItemProps) {
  const { updateTask, users } = useApp();
  const assignees = (task.assigneeIds ?? []).map(id => users.find(u => u.id === id)).filter(Boolean) as typeof users;
  const [showActualTimeModal, setShowActualTimeModal] = useState(false);

  const handleToggle = () => {
    // If transitioning to 'done', show the actual time modal
    if (statusCycle[task.status] === 'done') {
      setShowActualTimeModal(true);
    } else {
      updateTask(task.id, { status: statusCycle[task.status] });
    }
  };

  const handleActualTimeSave = (actualTime: number, actualTimeUnit: typeof task.actualTimeUnit) => {
    setShowActualTimeModal(false);
    updateTask(task.id, {
      status: 'done',
      actualTime,
      actualTimeUnit,
    });
  };

  const handleActualTimeSkip = () => {
    setShowActualTimeModal(false);
    updateTask(task.id, { status: 'done' });
  };

  const isDone = task.status === 'done';
  const isOverdue = task.status !== 'done' && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 group ${isDone ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}>
      <button onClick={handleToggle} className="flex-shrink-0 focus:outline-none" title={`Passer à: ${statusCycle[task.status]}`}>
        <CircleIcon checked={isDone} />
      </button>

      <div className="flex-1 min-w-0">
        <button
          onClick={onView}
          className={`text-sm font-medium text-left hover:underline ${isDone ? 'line-through text-slate-400' : 'text-slate-700 hover:text-indigo-600'}`}
        >
          {task.title}
        </button>
        {task.description && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
        <Badge variant={task.priority} />
        <Badge variant={task.status} className="hidden sm:flex" />
        {task.estimatedTime && (
          <span className="text-xs text-slate-400 hidden md:inline">
            {formatTimeWithUnit(task.estimatedTime, task.estimatedTimeUnit)}
          </span>
        )}
        {task.dueDate && (
          <span className={`text-xs ${isOverdue ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
            {formatDate(task.dueDate)}
          </span>
        )}
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

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button onClick={onEdit} className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Modifier">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Supprimer">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {showActualTimeModal && (
        <ActualTimeModal
          taskTitle={task.title}
          onSave={handleActualTimeSave}
          onSkip={handleActualTimeSkip}
        />
      )}
    </div>
  );
}
