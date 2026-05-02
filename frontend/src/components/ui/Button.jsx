import React from 'react';
import useThemeMode from '../../hooks/useThemeMode';
import { motion } from 'framer-motion';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false,
  icon: Icon,
  ...props 
}) {
  void motion;
  const isDarkMode = useThemeMode();

  const variants = {
    primary: 'bg-gradient-primary text-white shadow-lg shadow-indigo-500/25 focus:ring-indigo-500',
    secondary: isDarkMode ? 'bg-[#1E293B] text-white border border-slate-700 shadow-md hover:bg-[#1E293B]' : 'bg-[#1E293B] text-white shadow-md hover:bg-slate-700 border border-slate-700',
    outline: isDarkMode ? 'bg-[#1E293B]/50 backdrop-blur-sm border-indigo-200/20 text-indigo-400 hover:bg-indigo-500/20 border focus:ring-indigo-500' : 'bg-white/50 backdrop-blur-sm border-indigo-200 text-indigo-600 hover:bg-indigo-500/10 border focus:ring-indigo-500',
    success: 'bg-emerald-500/100 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 focus:ring-emerald-500',
    danger: 'bg-rose-500/100 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 focus:ring-rose-500',
    ghost: isDarkMode ? 'bg-transparent text-slate-300 hover:bg-[#1E293B]' : 'bg-transparent text-slate-600 hover:bg-slate-100 backdrop-blur-xl',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-full',
    md: 'px-5 py-2.5 text-sm font-bold rounded-full',
    lg: 'px-6 py-3 text-base font-extrabold rounded-full',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"></span>
      )}
      {!loading && Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </motion.button>
  );
}
