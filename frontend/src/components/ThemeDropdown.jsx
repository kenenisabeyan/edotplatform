import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { Sun, Moon } from 'lucide-react';

export default function ThemeDropdown() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('edot-theme') === 'extra-dark';
  });

  useEffect(() => {
    const theme = isDarkMode ? 'extra-dark' : 'light';
    localStorage.setItem('edot-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    // Dispatch event so other components can sync
    window.dispatchEvent(new Event('theme-changed'));
  }, [isDarkMode]);

  useEffect(() => {
    const syncTheme = () => {
      const currentTheme = localStorage.getItem('edot-theme');
      setIsDarkMode(currentTheme === 'extra-dark');
    };
    window.addEventListener('theme-changed', syncTheme);
    return () => window.removeEventListener('theme-changed', syncTheme);
  }, []);

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={`p-2 rounded-full transition-colors border shadow-sm ${isDarkMode ? 'hover:bg-[#1E293B] bg-[#0B1120] border-white/10' : 'hover:bg-slate-100 bg-white border-slate-200'}`}
      aria-label="Toggle Theme"
    >
      {isDarkMode ? <Sun className="w-5 h-5 text-[#F97316]" /> : <Moon className="w-5 h-5 text-indigo-600" />}
    </button>
  );
}
