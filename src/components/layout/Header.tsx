"use client";

import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useMobileMenu } from "@/context/MobileMenuContext";
import NotificationBell from "@/components/ui/NotificationBell";

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
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
  const { toggle } = useMobileMenu();
  const currentUser = users.find(u => u.role === 'admin') ?? users[0];

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-3 md:py-4">
      <div className="flex items-center justify-between gap-3">
        {/* Left: hamburger (mobile) + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggle}
            className="md:hidden flex-shrink-0 p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <HamburgerIcon />
          </button>
          <div className="min-w-0">
            <h1 className="text-base md:text-xl font-bold text-slate-900 truncate">{getPageTitle(pathname)}</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0 md:mt-0.5 hidden sm:block">{getPageSubtitle(pathname)}</p>
          </div>
        </div>

        {/* Right: notifications + avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {currentUser && <NotificationBell userId={currentUser.id} />}
          <div
            className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer flex-shrink-0"
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
