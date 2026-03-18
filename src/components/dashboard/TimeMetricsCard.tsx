'use client';

import { ProjectWithTasks } from '@/types';
import { formatTimeWithUnit, calculateRatio, getStatusColor, getStatusLabel, timeToMinutes } from '@/lib/time';

interface TimeMetricsCardProps {
  project: ProjectWithTasks;
}

export default function TimeMetricsCard({ project }: TimeMetricsCardProps) {
  if (!project.estimatedTime) return null;

  // Calculate total actual time from tasks
  const totalActualMinutes = project.tasks.reduce((sum, task) => {
    if (task.actualTime && task.actualTimeUnit) {
      return sum + timeToMinutes(task.actualTime, task.actualTimeUnit);
    }
    return sum;
  }, 0);

  const estimatedMinutes = timeToMinutes(project.estimatedTime, project.estimatedTimeUnit!);
  const usagePercentage = Math.min(Math.round((totalActualMinutes / estimatedMinutes) * 100), 100);

  // Calculate ratio only if there's actual time logged
  const ratio = totalActualMinutes > 0 ? totalActualMinutes / estimatedMinutes : null;
  const status = ratio ? (ratio < 0.8 ? 'ahead' : ratio > 1.2 ? 'behind' : 'on-track') : 'on-track';

  return (
    <div className="bg-white border border-slate-100 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">{project.name}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {formatTimeWithUnit(project.estimatedTime, project.estimatedTimeUnit)}
            {totalActualMinutes > 0 && (
              <>
                {' '} / {Math.round(totalActualMinutes / 60)}h réels
              </>
            )}
          </p>
        </div>
        {ratio && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            status === 'ahead'
              ? 'bg-green-50 text-green-700'
              : status === 'behind'
              ? 'bg-red-50 text-red-700'
              : 'bg-blue-50 text-blue-700'
          }`}>
            {getStatusLabel(status)}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              status === 'ahead'
                ? 'bg-green-500'
                : status === 'behind'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {usagePercentage}% du temps estimé utilisé
          {ratio && ` (${Math.round(ratio * 100)}%)`}
        </p>
      </div>

      {/* Task count */}
      <div className="text-xs text-slate-600 border-t border-slate-100 pt-2">
        <span className="font-medium">{project.tasks.filter(t => t.status === 'done').length}</span>
        {' '} / {project.tasks.length} tâches complétées
      </div>
    </div>
  );
}
