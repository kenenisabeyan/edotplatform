import React from 'react';
import useThemeMode from '../hooks/useThemeMode';

export default function UserAvatar({ user, className = "w-8 h-8 md:w-9 md:h-9 text-xs md:text-sm" }) {
  const isDarkMode = useThemeMode();
  if (!user) return null;

  const hasAvatar = user.avatar && user.avatar !== 'default-avatar.png';

  if (hasAvatar) {
    const avatarUrl = user.avatar.startsWith('http') 
        ? user.avatar 
        : `http://localhost:5000${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`;
    
    return (
      <div className={`rounded-full overflow-hidden shrink-0 border dark:border-slate-700 shadow-sm ${className} ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <img 
          src={avatarUrl} 
          alt={`${user.name}'s avatar`} 
          className="w-full h-full object-cover"
          onError={(e) => {
             e.target.style.display = 'none';
             e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Hidden fallback div that only shows when img errors */}
        <div className="w-full h-full hidden items-center justify-center font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-500/100/20 dark:text-indigo-400 ">
           {user.name ? user.name.charAt(0) : '?'}
        </div>
      </div>
    );
  }

  const roleColors = {
      admin: 'bg-rose-100 text-rose-600 dark:bg-rose-500/100/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
      instructor: 'bg-purple-100 text-purple-600 dark:bg-purple-500/100/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
      student: 'bg-blue-100 text-blue-600 dark:bg-blue-500/100/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
      parent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/100/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
  };

  const bgStyle = roleColors[user.role] || 'bg-[#0B1120]/5 backdrop-blur-xl text-slate-300 dark:bg-[#0B1120] dark:text-slate-300 border-white/10 dark:border-slate-700';

  return (
    <div className={`rounded-full shrink-0 flex items-center justify-center font-bold  border shadow-sm ${bgStyle} ${className}`}>
      {user.name ? user.name.charAt(0) : '?'}
    </div>
  );
}
