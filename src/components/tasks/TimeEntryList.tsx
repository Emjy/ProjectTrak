'use client';

import { TimeEntry } from '@/types';
import { formatTimeWithUnit } from '@/lib/time';
import { useApp } from '@/context/AppContext';

interface TimeEntryListProps {
  entries: TimeEntry[];
  onDelete?: (id: string) => void;
}

function formatEntryDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function TimeEntryList({ entries, onDelete }: TimeEntryListProps) {
  const { currentUser } = useApp();

  if (entries.length === 0) {
    return (
      <p className="text-xs text-slate-400 py-2 text-center">Aucune saisie de temps pour cette tâche.</p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map(entry => {
        const canDelete = onDelete && (currentUser?.id === entry.userId || currentUser?.role === 'admin');
        return (
          <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
            {/* Avatar */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: entry.user?.avatarColor ?? '#6366f1' }}
              title={entry.user?.name}
            >
              {entry.user?.name ? getInitials(entry.user.name) : '?'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  {formatTimeWithUnit(entry.duration, entry.unit)}
                </span>
                <span className="text-xs text-slate-400">{formatEntryDate(entry.date)}</span>
              </div>
              {entry.note && (
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{entry.note}</p>
              )}
            </div>

            {/* Name */}
            <span className="text-[11px] text-slate-400 flex-shrink-0 hidden sm:block">
              {entry.user?.name?.split(' ')[0] ?? ''}
            </span>

            {/* Delete */}
            {canDelete && (
              <button
                onClick={() => onDelete(entry.id)}
                className="p-1 rounded text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0"
                title="Supprimer"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
