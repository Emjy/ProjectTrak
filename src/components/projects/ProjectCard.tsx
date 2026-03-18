'use client';

import Link from 'next/link';
import { ProjectWithTasks } from '@/types';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Card from '@/components/ui/Card';
import { formatTimeWithUnit, formatTime, calculateRatio, getStatusLabel, timeToMinutes } from '@/lib/time';

interface ProjectCardProps {
  project: ProjectWithTasks;
  onEdit?: () => void;
  onDelete?: () => void;
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const tasks = project.tasks ?? [];
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const isOverdue = project.status !== 'completed' && project.dueDate && new Date(project.dueDate) < new Date();

  // Time tracking
  const totalActualMinutes = tasks.reduce((sum, t) => {
    if (t.status === 'done' && t.actualTime && t.actualTimeUnit)
      return sum + timeToMinutes(t.actualTime, t.actualTimeUnit);
    return sum;
  }, 0);
  const hasEstimate = !!project.estimatedTime && !!project.estimatedTimeUnit;
  const estimatedMinutes = hasEstimate ? timeToMinutes(project.estimatedTime!, project.estimatedTimeUnit!) : 0;
  const timeUsagePct = hasEstimate && estimatedMinutes > 0 ? Math.min(Math.round((totalActualMinutes / estimatedMinutes) * 100), 150) : 0;
  const { status: timeStatus } = hasEstimate
    ? calculateRatio(project.estimatedTime, project.estimatedTimeUnit, totalActualMinutes || undefined, totalActualMinutes ? 'minutes' : undefined)
    : { status: 'on-track' as const };
  const timeStatusColors = { ahead: 'bg-emerald-50 text-emerald-700', 'on-track': 'bg-sky-50 text-sky-700', behind: 'bg-rose-50 text-rose-700' };

  return (
    <Card hoverable className="p-5 flex flex-col gap-4 group/card">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/projects/${project.id}`} className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
          <h3 className="font-semibold text-slate-900 text-sm truncate hover:text-indigo-600 transition-colors">
            {project.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge variant={project.status} />
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
              {onEdit && (
                <button onClick={(e) => { e.preventDefault(); onEdit(); }} className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Modifier">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button onClick={(e) => { e.preventDefault(); onDelete(); }} className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Supprimer">
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
      </div>

      <Link href={`/projects/${project.id}`}>
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{project.description}</p>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">Progression</span>
            <span className="text-xs font-semibold text-slate-700 tabular-nums">{progress}%</span>
          </div>
          <ProgressBar value={progress} color={project.color} />

          {hasEstimate && (
            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-slate-400">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="font-medium text-slate-700">{formatTimeWithUnit(project.estimatedTime, project.estimatedTimeUnit)}</span>
                {totalActualMinutes > 0 && (
                  <>
                    <span className="text-slate-300">→</span>
                    <span className={`font-medium ${timeStatus === 'ahead' ? 'text-emerald-600' : timeStatus === 'behind' ? 'text-rose-600' : 'text-sky-600'}`}>
                      {formatTime(totalActualMinutes)}
                    </span>
                  </>
                )}
              </div>
              {totalActualMinutes > 0 && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${timeStatusColors[timeStatus]}`}>
                  {getStatusLabel(timeStatus)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TaskIcon />
            <span>{doneTasks}/{tasks.length} tâches</span>
          </div>
          {project.dueDate ? (
            <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
              <CalendarIcon />
              <span>{formatDate(project.dueDate)}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-300">Pas d&apos;échéance</span>
          )}
        </div>
      </Link>
    </Card>
  );
}
