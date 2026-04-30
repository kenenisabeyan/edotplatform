import { useState, useEffect } from 'react';

export default function useThemeMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('edot-theme') === 'extra-dark';
  });

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkMode(localStorage.getItem('edot-theme') === 'extra-dark');
    };

    window.addEventListener('theme-changed', syncTheme);
    return () => window.removeEventListener('theme-changed', syncTheme);
  }, []);

  return isDarkMode;
}
