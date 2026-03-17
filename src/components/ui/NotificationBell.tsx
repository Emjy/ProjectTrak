'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Notification, User } from '@/types';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

interface NotificationBellProps {
  userId: string;
}

const LS_KEY = (uid: string) => `notif_last_seen_${uid}`;

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

function renderContent(content: string, users: User[]): string {
  return content
    .replace(/@\{([^}]+)\}/g, (_, id) => {
      const user = users.find(u => u.id === id);
      return user ? `@${user.name.split(' ')[0]}` : '@…';
    })
    .slice(0, 80);
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const { users } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastSeen, setLastSeen] = useState<string>(() =>
    typeof window !== 'undefined' ? (localStorage.getItem(LS_KEY(userId)) ?? '1970-01-01') : '1970-01-01'
  );
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (res.ok) setNotifications(await res.json());
    } catch { /* ignore */ }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // Poll every 30s
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unread = notifications.filter(n => n.createdAt > lastSeen);

  const markAllRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem(LS_KEY(userId), now);
    setLastSeen(now);
  };

  const handleOpen = () => {
    setOpen(o => !o);
  };

  const handleMarkRead = () => {
    markAllRead();
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unread.length > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">
              Notifications
              {unread.length > 0 && (
                <span className="ml-2 text-xs font-normal text-rose-500">{unread.length} nouvelles</span>
              )}
            </span>
            {unread.length > 0 && (
              <button onClick={handleMarkRead} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                Tout marquer lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">Aucune mention pour l&apos;instant.</div>
            )}
            {notifications.map(n => {
              const isNew = n.createdAt > lastSeen;
              return (
                <Link
                  key={n.id}
                  href={`/projects/${n.projectId}`}
                  onClick={() => setOpen(false)}
                  className={`flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${isNew ? 'bg-indigo-50/60' : ''}`}
                >
                  {/* Avatar dot */}
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
                    style={{ backgroundColor: n.authorAvatarColor }}
                  >
                    {n.authorName.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold">{n.authorName}</span>
                      {' vous a mentionné dans '}
                      <span className="font-medium text-slate-800">{n.taskTitle}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{renderContent(n.content, users)}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{n.projectName} · {formatRelative(n.createdAt)}</p>
                  </div>
                  {isNew && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
