import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeMode from '../hooks/useThemeMode';

export default function PremiumModal({ isOpen, onClose, children, maxWidth = 'max-w-lg', ariaLabelledBy = 'modal-title' }) {
  const isDarkMode = useThemeMode();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0B1120]/70 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div 
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`relative w-full ${maxWidth} overflow-hidden rounded-[32px] border shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-[#0B1D3A] border-slate-700/50' : 'bg-white border-slate-200/80'}`}
          >
            {/* Brand Background Decorative Elements */}
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#00D4FF]/10 to-transparent pointer-events-none z-0"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/20 blur-[80px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/20 blur-[80px] pointer-events-none z-0"></div>

            <div className="relative z-10 flex flex-col h-full w-full">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
