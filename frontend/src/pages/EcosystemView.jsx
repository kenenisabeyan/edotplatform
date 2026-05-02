import React from 'react';
import EcosystemNexus from '../components/EcosystemNexus';
import useThemeMode from '../hooks/useThemeMode';

export default function EcosystemView() {
  const isDarkMode = useThemeMode();
  
  return (
    <div className={`p-2 font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      <EcosystemNexus />
    </div>
  );
}
