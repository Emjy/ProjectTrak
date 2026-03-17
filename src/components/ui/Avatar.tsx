'use client';

import { User } from '@/types';

interface AvatarProps {
  user: User;
  size?: 'xs' | 'sm' | 'md';
  showTooltip?: boolean;
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Avatar({ user, size = 'sm', showTooltip = false }: AvatarProps) {
  const sizeClass = { xs: 'w-5 h-5 text-[10px]', sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm' }[size];
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 relative group`}
      style={{ backgroundColor: user.avatarColor }}
      title={showTooltip ? user.name : undefined}
    >
      {getInitials(user.name)}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {user.name}
        </div>
      )}
    </div>
  );
}
