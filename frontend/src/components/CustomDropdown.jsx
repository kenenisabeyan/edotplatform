import React, { useState, useRef, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function CustomDropdown({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select an option...', 
  className = '',
  searchable = false
}) {
  const isDarkMode = useThemeMode();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos(prev => {
        const newTop = rect.bottom + 8;
        if (prev.top === newTop && prev.left === rect.left && prev.width === rect.width) {
          return prev;
        }
        return {
          top: newTop,
          left: rect.left,
          width: rect.width
        };
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (buttonRef.current && !buttonRef.current.contains(event.target)) &&
        (dropdownRef.current && !dropdownRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const isGrouped = options.length > 0 && 'category' in options[0];

  const isSelected = (optValue) => {
    if (Array.isArray(value) && Array.isArray(optValue)) {
      return value.length === optValue.length && value.every((v, i) => v === optValue[i]);
    }
    return value === optValue;
  };

  const getSelectedLabel = () => {
    if (value === undefined || value === null || value === '') return placeholder;
    
    if (isGrouped) {
      for (const group of options) {
        const found = group.options.find(opt => isSelected(opt.value));
        if (found) return found.label;
      }
    } else {
      const found = options.find(opt => isSelected(opt.value));
      if (found) return found.label;
    }
    return placeholder;
  };

  const getFilteredOptions = () => {
    if (!searchQuery) return options;
    const lowerQuery = searchQuery.toLowerCase();

    if (isGrouped) {
      return options.map(group => ({
        ...group,
        options: group.options.filter(opt => opt.label.toLowerCase().includes(lowerQuery))
      })).filter(group => group.options.length > 0);
    } else {
      return options.filter(opt => opt.label.toLowerCase().includes(lowerQuery));
    }
  };

  const filteredOptions = getFilteredOptions();

  return (
    <div className={`relative w-full ${className}`} ref={buttonRef}>
      <button
        type="button"
        onClick={() => {
          if (!isOpen) setSearchQuery('');
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-black/40 border rounded-xl text-sm focus:outline-none focus:border-[#FFD700]/50 focus:ring-1 focus:ring-[#FFD700]/30 transition-all shadow-sm hover:border-white/20 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
      >
        <span className={`truncate ${!value || value === '' ? 'text-slate-200' : 'text-white font-medium'}`}>
          {getSelectedLabel()}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`} />
      </button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: 'fixed',
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
                zIndex: 99999
              }}
              className={`bg-[#11151F]/95 backdrop-blur-2xl border rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-72 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}
            >
            {searchable && (
              <div className={`p-2 border-b shrink-0 bg-black/20 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="relative">
                  <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className={`w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs placeholder-slate-500 focus:outline-none focus:border-[#FFD700]/50 ${isDarkMode ? 'bg-[#11151F]/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
              </div>
            )}
            
            <div className="overflow-y-auto custom-scrollbar p-1 flex-1">
              {filteredOptions.length === 0 ? (
                <div className={`p-3 text-center text-xs italic ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No options found</div>
              ) : isGrouped ? (
                filteredOptions.map((group, gIdx) => (
                  <div key={gIdx} className="mb-1 last:mb-0">
                    {group.category && (
                      <div className={`px-3 py-1.5 text-[10px] font-black sticky top-0 z-10 backdrop-blur-md ${isDarkMode ? 'text-slate-300 bg-[#11151F]/5' : 'text-slate-500 bg-slate-50'}`}>
                        {group.category}
                      </div>
                    )}
                    <div className="p-1">
                      {group.options.map((opt, oIdx) => {
                        const selected = isSelected(opt.value);
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => {
                              onChange(opt.value);
                              setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all text-left ${
                              selected 
                              ? 'bg-[#FFD700]/10 text-[#FFD700] font-bold shadow-[0_0_10px_rgba(255,215,0,0.1)]' 
                              : 'text-slate-300 hover:bg-[#11151F]/10 hover:text-white font-medium'
                            }`}
                          >
                            <span className="truncate flex items-center gap-2">
                              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                              {opt.render ? opt.render : opt.label}
                            </span>
                            {selected && <Check className="w-4 h-4 ml-2 shrink-0 text-[#FFD700]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                filteredOptions.map((opt, idx) => {
                  const selected = isSelected(opt.value);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all text-left ${
                        selected 
                        ? 'bg-[#FFD700]/10 text-[#FFD700] font-bold shadow-[0_0_10px_rgba(255,215,0,0.1)]' 
                        : 'text-slate-300 hover:bg-[#11151F]/10 hover:text-white font-medium'
                      }`}
                    >
                      <span className="truncate flex items-center gap-2 w-full">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        {opt.render ? opt.render : opt.label}
                      </span>
                      {selected && <Check className="w-4 h-4 ml-2 shrink-0 text-[#FFD700]" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </div>
  );
}
