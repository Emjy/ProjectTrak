"use client";

import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import NotificationBell from "@/components/ui/NotificationBell";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname === "/projects") return "Projets";
  if (pathname.startsWith("/projects/")) return "Détail projet";
  if (pathname === "/team") return "Équipe";
  return "ProjectTrak";
}

function getPageSubtitle(pathname: string): string {
  if (pathname === "/") return "Vue d'ensemble de vos projets et tâches";
  if (pathname === "/projects") return "Gérez et suivez tous vos projets";
  if (pathname.startsWith("/projects/")) return "Tâches et informations du projet";
  if (pathname === "/team") return "Gérez vos équipes et membres";
  return "";
}

export default function Header() {
  const pathname = usePathname();
  const { users } = useApp();
  const currentUser = users.find(u => u.role === 'admin') ?? users[0];

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{getPageTitle(pathname)}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{getPageSubtitle(pathname)}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 text-slate-400">
            <SearchIcon />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-36"
            />
          </div>

          {/* Notifications */}
          {currentUser && <NotificationBell userId={currentUser.id} />}

          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer"
            style={{ backgroundColor: currentUser?.avatarColor ?? '#6366f1' }}
            title={currentUser?.name}
          >
            {currentUser?.name?.slice(0, 1) ?? 'E'}
          </div>
        </div>
      </div>
    </header>
  );
}
