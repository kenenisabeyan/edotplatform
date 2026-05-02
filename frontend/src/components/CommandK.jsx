import React, { useEffect, useState, useRef } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, BookOpen, BellRing, Settings, LayoutDashboard, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function CommandK() {
  const isDarkMode = useThemeMode();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (isOpen) {
        if (e.key === 'Escape') setIsOpen(false);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        }
        if (e.key === 'Enter' && results.length > 0) {
          e.preventDefault();
          navigate(results[selectedIndex].path);
          setIsOpen(false);
          setQuery('');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, query, selectedIndex, navigate, results]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
      setSelectedIndex(0);
    }, 100);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const baseNavigationLinks = [
      { type: 'Page', title: 'Dashboard Home', icon: LayoutDashboard, path: '/dashboard' },
      { type: 'Page', title: 'Platform Settings', icon: Settings, path: '/dashboard/settings' },
      { type: 'Page', title: 'Course Library', icon: BookOpen, path: '/dashboard/library' }
    ];

    if (query.trim().length === 0) {
      setResults(baseNavigationLinks);
      return;
    }

    const fetchSearchResults = async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get(`/search/global?q=${query}`);
        let apiResults = data.data || [];
        
        apiResults = apiResults.map(res => {
          let icon = User;
          if (res.type === 'Course') icon = BookOpen;
          if (res.type === 'Notice') icon = BellRing;
          return { ...res, icon };
        });

        const merged = [...baseNavigationLinks.filter(item => item.title.toLowerCase().includes(query.toLowerCase())), ...apiResults];
        setResults(merged);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceId = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceId);
  }, [query, isOpen]);

  const groupResults = (list) => {
    return list.reduce((acc, item) => {
      const type = item.type || 'Platform';
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {});
  };

  const grouped = groupResults(results);
  let globalIndex = 0; // Maintain continuous keyboard index mapping across groups

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 top-[12vh] mx-auto z-[201] w-full max-w-3xl px-4 sm:px-0"
          >
            <div className="overflow-hidden rounded-3xl bg-[#1E293B]/95 shadow-2xl shadow-[#F97316]/10 border border-[#F97316]/30 backdrop-blur-2xl">
              
              {/* Search Header */}
              <div className={`relative flex items-center px-5 py-4 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                <Search className={`w-6 h-6 transition-colors ${isSearching ? 'text-[#F97316] animate-pulse' : 'text-[#F97316]'}`} />
                <input
                  ref={inputRef}
                  className={`w-full bg-transparent border-0 focus:ring-0 px-5 placeholder-slate-500 outline-none text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                  placeholder="Query courses, students, parents, or instructors..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  spellCheck="false"
                />
                {isSearching ? <Loader2 className="w-5 h-5 text-[#F97316] animate-spin" /> : (
                <button
                  onClick={() => setIsOpen(false)}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg border hover:text-white transition-colors ${isDarkMode ? 'text-slate-200 bg-[#1E293B]/5 border-white/10' : 'text-slate-600 bg-slate-50 border-slate-200'}`}
                >
                  ESC
                </button>
                )}
              </div>

              {/* Categorised Results List */}
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3">
                {results.length === 0 && !isSearching ? (
                  <div className={`px-4 py-16 text-center text-sm flex flex-col items-center ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    <Search className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`} />
                    <p>No platform entries found for <span className="font-bold text-[#F97316]">"{query}"</span></p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(grouped).map(([category, items]) => (
                      <div key={category}>
                        <div className="px-3 pb-2 pt-1 flex items-center gap-2">
                           <h3 className={`text-[10px] font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{category}</h3>
                           <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                        </div>
                        <ul className="space-y-1">
                          {items.map((item) => {
                            const Icon = item.icon;
                            const isSelected = globalIndex === selectedIndex;
                            const currentIndex = globalIndex;
                            globalIndex++;
                            
                            return (
                              <li key={`${item.type}-${item.id || item.title}`}>
                                <button
                                  onClick={() => {
                                    navigate(item.path);
                                    setIsOpen(false);
                                    setQuery('');
                                  }}
                                  onMouseEnter={() => setSelectedIndex(currentIndex)}
                                  className={`flex w-full items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
                                    isSelected 
                                      ? 'bg-[#F97316]/10 border border-[#F97316]/20 text-white shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                                      : 'border border-transparent text-slate-200 hover:bg-[#1E293B]/5'
                                  }`}
                                >
                                  <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-[#F97316] text-[#0B0E14]' : 'bg-[#1E293B]/5 '} ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                                     <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col items-start flex-1 overflow-hidden">
                                    <span className="font-bold text-sm tracking-tight truncate w-full text-left">{item.title}</span>
                                    {item.subtitle && <span className={`text-[11px] font-semibold truncate w-full text-left mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{item.subtitle}</span>}
                                  </div>
                                  
                                  {isSelected && <ArrowRight className="w-4 h-4 ml-auto text-[#F97316] shrink-0 pointer-events-none" />}
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer Tooltip */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-[#F97316]/20 bg-black/40 backdrop-blur-md shrink-0">
                <span className={`text-[10px] flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  Navigate <span className={`px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-[#1E293B]/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>&uarr;</span> <span className={`px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-[#1E293B]/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>&darr;</span>
                </span>
                <span className="text-[10px] text-[#F97316]/70 flex items-center gap-1.5 font-bold  ">
                  Open Selected <span className="px-2 py-0.5 rounded bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316]">Enter</span>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
