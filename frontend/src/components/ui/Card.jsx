import React from 'react';
import useThemeMode from '../../hooks/useThemeMode';
import { motion } from 'framer-motion';

export function Card({ children, className = '', hover = false, ...props }) {
  const isDarkMode = useThemeMode();
  void motion;
  const baseClass = 'glass-card overflow-hidden relative';
  const hoverClass = hover ? 'hover-scale cursor-pointer' : '';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={`${baseClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '' }) {
  const isDarkMode = useThemeMode();
  return (
    <div className={`px-6 py-5 border-b /50 dark:border-slate-800/50 ${className} ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  const isDarkMode = useThemeMode();
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}
