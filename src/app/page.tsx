'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatTimeWithUnit, calculateRatio, getStatusLabel, timeToMinutes, formatTime } from '@/lib/time';
import { useState, useEffect } from 'react';
import { TimeEntry } from '@/types';

function StatCard({ label, value, icon, color, sublabel }: { label: string; value: number; icon: React.ReactNode; color: string; sublabel?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
    </Card>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { from: mon.toISOString().split('T')[0], to: sun.toISOString().split('T')[0] };
}

export default function DashboardPage() {
  const { projects, loading, currentUser } = useApp();
  const [myEntries, setMyEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const { from, to } = getWeekRange();
    fetch(`/api/time-entries?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(data => setMyEntries(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [currentUser]);

  const allTasks = projects.flatMap((p) => p.tasks ?? []);
  const totalProjects = projects.length;
  const doneTasks = allTasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = allTasks.filter((t) => t.status === 'in-progress').length;
  const now = new Date();
  const overdueTasks = allTasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now).length;

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-sm">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="Projets"
          value={totalProjects}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>}
          color="bg-indigo-50 text-indigo-600"
          sublabel={`${projects.filter((p) => p.status === 'active').length} actifs`}
        />
        <StatCard
          label="Tâches terminées"
          value={doneTasks}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
          color="bg-emerald-50 text-emerald-600"
          sublabel={`${allTasks.length} au total`}
        />
        <StatCard
          label="En cours"
          value={inProgressTasks}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          color="bg-violet-50 text-violet-600"
          sublabel="tâches actives"
        />
        <StatCard
          label="En retard"
          value={overdueTasks}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
          color={overdueTasks > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}
          sublabel="à traiter"
        />
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Projets récents</h2>
            <p className="text-sm text-slate-500 mt-0.5">Dernière activité</p>
          </div>
          <Link href="/projects" className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            Voir tout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <Card className="p-10">
            <div className="text-center text-slate-400">
              <p className="text-sm">Aucun projet pour l&apos;instant.</p>
              <Link href="/projects" className="inline-block mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Créer un projet →
              </Link>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-slate-50">
              {recentProjects.map((project, idx) => {
                const tasks = project.tasks ?? [];
                const done = tasks.filter((t) => t.status === 'done').length;
                const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
                const totalActualMinutes = tasks.reduce((sum, t) => {
                  if (t.status === 'done' && t.actualTime && t.actualTimeUnit)
                    return sum + timeToMinutes(t.actualTime, t.actualTimeUnit);
                  return sum;
                }, 0);
                const hasEstimate = !!project.estimatedTime && !!project.estimatedTimeUnit;
                const { status: timeStatus } = hasEstimate && totalActualMinutes > 0
                  ? calculateRatio(project.estimatedTime, project.estimatedTimeUnit, totalActualMinutes || undefined, 'minutes')
                  : { status: 'on-track' as const };
                const timeStatusColors = { ahead: 'bg-emerald-50 text-emerald-700', 'on-track': 'bg-sky-50 text-sky-700', behind: 'bg-rose-50 text-rose-700' };
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${idx === 0 ? 'rounded-t-2xl' : ''} ${idx === recentProjects.length - 1 ? 'rounded-b-2xl' : ''}`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{project.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-slate-400 truncate">{project.description}</p>
                        {hasEstimate && (
                          <span className="text-[10px] text-slate-400 flex-shrink-0 hidden sm:inline">
                            ⏱ {formatTimeWithUnit(project.estimatedTime, project.estimatedTimeUnit)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-32 hidden sm:block">
                      <ProgressBar value={progress} color={project.color} showLabel />
                    </div>
                    <div className="text-xs text-slate-500 w-20 text-right hidden md:block">
                      {done}/{tasks.length} tâches
                    </div>
                    {hasEstimate && totalActualMinutes > 0 ? (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 hidden lg:inline ${timeStatusColors[timeStatus]}`}>
                        {getStatusLabel(timeStatus)}
                      </span>
                    ) : <span className="w-16 hidden lg:block" />}
                    <Badge variant={project.status} />
                    {project.dueDate && (
                      <div className="text-xs text-slate-400 w-28 text-right hidden lg:block">
                        {formatDate(project.dueDate)}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Task summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Tâches en retard</h3>
          {allTasks.filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 text-emerald-300">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-sm">Aucune tâche en retard</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allTasks
                .filter((t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now)
                .slice(0, 4)
                .map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  return (
                    <div key={task.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project?.color ?? '#94a3b8' }} />
                        <span className="text-sm text-slate-700 truncate">{task.title}</span>
                      </div>
                      <Badge variant={task.priority} className="flex-shrink-0 ml-2" />
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">En cours</h3>
          {allTasks.filter((t) => t.status === 'in-progress').length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <p className="text-sm">Aucune tâche en cours</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allTasks
                .filter((t) => t.status === 'in-progress')
                .slice(0, 4)
                .map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  return (
                    <div key={task.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project?.color ?? '#94a3b8' }} />
                        <span className="text-sm text-slate-700 truncate">{task.title}</span>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{project?.name}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>
      </div>

      {/* Mon temps cette semaine */}
      {myEntries.length > 0 && (() => {
        const totalMins = myEntries.reduce((s, e) => s + timeToMinutes(e.duration, e.unit as Parameters<typeof timeToMinutes>[1]), 0);
        const byProject = new Map<string, { name: string; color: string; minutes: number }>();
        for (const e of myEntries) {
          if (!byProject.has(e.projectId)) byProject.set(e.projectId, { name: e.projectName ?? e.projectId, color: e.projectColor ?? '#6366f1', minutes: 0 });
          byProject.get(e.projectId)!.minutes += timeToMinutes(e.duration, e.unit as Parameters<typeof timeToMinutes>[1]);
        }
        const sorted = [...byProject.values()].sort((a, b) => b.minutes - a.minutes);
        return (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Mon temps cette semaine</h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-indigo-600 tabular-nums">{formatTime(totalMins)}</span>
                <Link href="/reports" className="text-xs text-slate-400 hover:text-indigo-600 transition-colors">Voir tout →</Link>
              </div>
            </div>
            <div className="space-y-2.5">
              {sorted.slice(0, 4).map(p => {
                const pct = Math.round((p.minutes / totalMins) * 100);
                return (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-xs text-slate-600 w-36 truncate flex-shrink-0">{p.name}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 tabular-nums w-12 text-right flex-shrink-0">{formatTime(p.minutes)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })()}
    </div>
  );
}
