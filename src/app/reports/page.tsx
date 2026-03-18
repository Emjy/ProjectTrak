'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { TimeEntry } from '@/types';
import { timeToMinutes, formatTime } from '@/lib/time';

type Period = 'week' | 'month' | 'custom';
type ViewMode = 'by-person' | 'by-project';

function getWeekRange(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay(); // 0=sun
  const diff = (day === 0 ? -6 : 1) - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    from: mon.toISOString().split('T')[0],
    to: sun.toISOString().split('T')[0],
  };
}

function getMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { from, to };
}

function Bar({ pct, color }: { pct: number; color?: string }) {
  return (
    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color ?? '#6366f1' }} />
    </div>
  );
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getDayLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getWeekDays(from: string): string[] {
  const days: string[] = [];
  const start = new Date(from);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export default function ReportsPage() {
  const { currentUser, users, projects } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [period, setPeriod] = useState<Period>('week');
  const [viewMode, setViewMode] = useState<ViewMode>('by-person');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { from, to } = period === 'week' ? getWeekRange()
    : period === 'month' ? getMonthRange()
    : { from: customFrom, to: customTo };

  const fetchEntries = useCallback(async () => {
    if (period === 'custom' && (!customFrom || !customTo)) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/api/time-entries?${params}`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [from, to, period, customFrom, customTo]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalMinutes = entries.reduce((s, e) => s + timeToMinutes(e.duration, e.unit as Parameters<typeof timeToMinutes>[1]), 0);

  // — Vue "Par employé" —
  const byPerson = () => {
    const map = new Map<string, { user: TimeEntry['user'] & { id: string }; minutes: number; byProject: Map<string, { name: string; color: string; minutes: number }> }>();
    for (const e of entries) {
      const uid = e.userId;
      if (!map.has(uid)) map.set(uid, { user: { id: uid, name: e.user?.name ?? '?', avatarColor: e.user?.avatarColor ?? '#6366f1' }, minutes: 0, byProject: new Map() });
      const row = map.get(uid)!;
      const mins = timeToMinutes(e.duration, e.unit as Parameters<typeof timeToMinutes>[1]);
      row.minutes += mins;
      const pid = e.projectId;
      if (!row.byProject.has(pid)) row.byProject.set(pid, { name: e.projectName ?? pid, color: e.projectColor ?? '#6366f1', minutes: 0 });
      row.byProject.get(pid)!.minutes += mins;
    }
    return [...map.values()].sort((a, b) => b.minutes - a.minutes);
  };

  // — Vue "Par projet" —
  const byProject = () => {
    const map = new Map<string, { projectId: string; name: string; color: string; minutes: number; byUser: Map<string, { name: string; avatarColor: string; minutes: number }> }>();
    for (const e of entries) {
      const pid = e.projectId;
      if (!map.has(pid)) {
        const proj = projects.find(p => p.id === pid);
        map.set(pid, { projectId: pid, name: e.projectName ?? pid, color: proj?.color ?? e.projectColor ?? '#6366f1', minutes: 0, byUser: new Map() });
      }
      const row = map.get(pid)!;
      const mins = timeToMinutes(e.duration, e.unit as Parameters<typeof timeToMinutes>[1]);
      row.minutes += mins;
      const uid = e.userId;
      if (!row.byUser.has(uid)) row.byUser.set(uid, { name: e.user?.name ?? '?', avatarColor: e.user?.avatarColor ?? '#6366f1', minutes: 0 });
      row.byUser.get(uid)!.minutes += mins;
    }
    return [...map.values()].sort((a, b) => b.minutes - a.minutes);
  };

  // — Vue "Ma semaine" (membre) —
  const weekDays = period === 'week' ? getWeekDays(from) : [];
  const myWeek = () => {
    const byDay = new Map<string, TimeEntry[]>();
    for (const day of weekDays) byDay.set(day, []);
    for (const e of entries) {
      if (byDay.has(e.date)) byDay.get(e.date)!.push(e);
    }
    return byDay;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-900">Rapports</h1>
        {totalMinutes > 0 && (
          <div className="text-sm text-slate-500">
            Total période : <span className="font-semibold text-slate-800">{formatTime(totalMinutes)}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Period selector */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
          {(['week', 'month', 'custom'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${period === p ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>
              {p === 'week' ? 'Cette semaine' : p === 'month' ? 'Ce mois' : 'Personnalisé'}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            <span className="text-slate-400 text-xs">→</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
        )}

        {/* View toggle — admin only */}
        {isAdmin && (
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 ml-auto">
            {(['by-person', 'by-project'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === v ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>
                {v === 'by-person' ? 'Par employé' : 'Par projet'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date range indicator */}
      {from && to && (
        <p className="text-xs text-slate-400">
          {formatDateShort(from)} – {formatDateShort(to)}
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-10 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">Aucune saisie de temps sur cette période.</p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <>
          {/* Admin : Vue par employé */}
          {isAdmin && viewMode === 'by-person' && (
            <div className="space-y-3">
              {byPerson().map(row => {
                const isExp = expanded.has(row.user.id);
                const projects = [...row.byProject.values()].sort((a, b) => b.minutes - a.minutes);
                const maxMins = projects[0]?.minutes ?? 1;
                return (
                  <div key={row.user.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => toggleExpand(row.user.id)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: row.user.avatarColor }}>
                        {getInitials(row.user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{row.user.name}</p>
                        <p className="text-xs text-slate-400">{projects.length} projet{projects.length > 1 ? 's' : ''}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-700 tabular-nums">{formatTime(row.minutes)}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className={`text-slate-400 transition-transform flex-shrink-0 ${isExp ? 'rotate-180' : ''}`}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {isExp && (
                      <div className="border-t border-slate-50 px-4 pb-3 pt-2 space-y-2.5">
                        {projects.map(p => (
                          <div key={p.name} className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                            <span className="text-xs text-slate-600 w-32 truncate flex-shrink-0">{p.name}</span>
                            <Bar pct={(p.minutes / maxMins) * 100} color={p.color} />
                            <span className="text-xs font-semibold text-slate-700 tabular-nums w-16 text-right flex-shrink-0">{formatTime(p.minutes)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Admin : Vue par projet */}
          {isAdmin && viewMode === 'by-project' && (
            <div className="space-y-3">
              {byProject().map(row => {
                const isExp = expanded.has(row.projectId);
                const members = [...row.byUser.values()].sort((a, b) => b.minutes - a.minutes);
                const maxMins = members[0]?.minutes ?? 1;
                return (
                  <div key={row.projectId} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => toggleExpand(row.projectId)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{row.name}</p>
                        <p className="text-xs text-slate-400">{members.length} personne{members.length > 1 ? 's' : ''}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-700 tabular-nums">{formatTime(row.minutes)}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className={`text-slate-400 transition-transform flex-shrink-0 ${isExp ? 'rotate-180' : ''}`}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {isExp && (
                      <div className="border-t border-slate-50 px-4 pb-3 pt-2 space-y-2.5">
                        {members.map(m => (
                          <div key={m.name} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                              style={{ backgroundColor: m.avatarColor }}>
                              {getInitials(m.name)}
                            </div>
                            <span className="text-xs text-slate-600 w-28 truncate flex-shrink-0">{m.name}</span>
                            <Bar pct={(m.minutes / maxMins) * 100} color={row.color} />
                            <span className="text-xs font-semibold text-slate-700 tabular-nums w-16 text-right flex-shrink-0">{formatTime(m.minutes)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Membre : Ma semaine */}
          {!isAdmin && period === 'week' && (
            <div className="space-y-3">
              {weekDays.map(day => {
                const dayEntries = myWeek().get(day) ?? [];
                const dayMins = dayEntries.reduce((s, e) => s + timeToMinutes(e.duration, e.unit as Parameters<typeof timeToMinutes>[1]), 0);
                return (
                  <div key={day} className={`bg-white rounded-xl border overflow-hidden ${dayEntries.length > 0 ? 'border-slate-100' : 'border-slate-50'}`}>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className={`text-xs font-semibold capitalize ${dayEntries.length > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                        {getDayLabel(day)}
                      </span>
                      {dayMins > 0 && (
                        <span className="text-xs font-bold text-indigo-600 tabular-nums">{formatTime(dayMins)}</span>
                      )}
                    </div>
                    {dayEntries.length > 0 && (
                      <div className="border-t border-slate-50 divide-y divide-slate-50">
                        {dayEntries.map(e => (
                          <div key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.projectColor ?? '#6366f1' }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-700 truncate">{e.taskTitle}</p>
                              <p className="text-[11px] text-slate-400 truncate">{e.projectName}</p>
                            </div>
                            {e.note && <p className="text-[11px] text-slate-400 italic truncate max-w-[120px]">{e.note}</p>}
                            <span className="text-xs font-semibold text-slate-600 tabular-nums flex-shrink-0">
                              {formatTime(timeToMinutes(e.duration, e.unit as Parameters<typeof timeToMinutes>[1]))}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="text-right text-sm text-slate-500 pt-1">
                Total semaine : <span className="font-bold text-slate-800">{formatTime(totalMinutes)}</span>
              </div>
            </div>
          )}

          {/* Membre : autres périodes — liste simple */}
          {!isAdmin && period !== 'week' && (
            <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-50">
              {entries.map(e => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.projectColor ?? '#6366f1' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{e.taskTitle}</p>
                    <p className="text-[11px] text-slate-400">{e.projectName} · {formatDateShort(e.date)}</p>
                  </div>
                  {e.note && <p className="text-[11px] text-slate-400 italic hidden sm:block truncate max-w-[120px]">{e.note}</p>}
                  <span className="text-xs font-semibold text-slate-600 tabular-nums flex-shrink-0">
                    {formatTime(timeToMinutes(e.duration, e.unit as Parameters<typeof timeToMinutes>[1]))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
