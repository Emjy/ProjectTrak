"use client";

import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useMobileMenu } from "@/context/MobileMenuContext";
import NotificationBell from "@/components/ui/NotificationBell";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname === "/projects") return "Projets";
  if (pathname.startsWith("/projects/")) return "Projet";
  if (pathname === "/team") return "Équipe";
  return "ProjectTrak";
}

export default function Header() {
  const pathname = usePathname();
  const { currentUser } = useApp();
  const { toggle } = useMobileMenu();

  const initials = currentUser?.name?.slice(0, 1) ?? 'U';

  return (
    <header className="sticky top-0 z-20 bg-[#f5f6f8]/80 backdrop-blur-md border-b border-slate-200/60 px-5 md:px-8 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-[15px] font-semibold text-slate-800">{getPageTitle(pathname)}</h1>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold cursor-pointer flex-shrink-0 ring-2 ring-white"
          style={{ backgroundColor: currentUser?.avatarColor ?? '#6366f1' }}
          title={currentUser?.name}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
