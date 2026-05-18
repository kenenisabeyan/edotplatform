import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Activity } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import AgendaCreationModal from '../components/AgendaCreationModal';
import useThemeMode from '../hooks/useThemeMode';

export default function CalendarView() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchEvents = async () => {
    try {
      const [{ data: calendarData }, { data: liveData }] = await Promise.all([
        api.get('/calendar').catch(() => ({ data: { data: [] } })),
        api.get('/live-classes').catch(() => ({ data: { data: [] } }))
      ]);

      let allEvents = [];
      if (calendarData?.data) {
         allEvents = [...calendarData.data];
      }
      
      if (liveData?.data) {
         const liveEvents = liveData.data.map(lc => ({
            id: lc.id,
            title: `🔴 ${lc.title || 'Live Session'}`,
            date: new Date(lc.startTime).toISOString().split('T')[0],
            time: new Date(lc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: 'bg-[#00D4FF]/10 text-orange-400 border-[#00D4FF]/30'
         }));
         allEvents = [...allEvents, ...liveEvents];
      }

      setEvents(allEvents);
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePrevMonth = () => {
     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
     setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
     setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const calendarGrids = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
      if (i < firstDay) return null; 
      return i - firstDay + 1; 
  });

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Header Matrix */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
             <CalendarIcon className="w-8 h-8 text-[#00D4FF]" />
             Calendar
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Manage events, live sessions, and schedules.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'instructor') && (
          <button 
            onClick={() => setShowModal(true)}
            className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00D4FF] to-[#0099CC] font-black text-[11px] rounded-xl hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 transition-all shadow-sm w-full md:w-auto outline-none focus:ring-2 focus:ring-[#00D4FF]/50 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
          >
            <Plus className="w-4 h-4" /> Add New Event
          </button>
        )}
      </div>

      <div className={`rounded-3xl border backdrop-blur-3xl shadow-2xl overflow-hidden flex-1 flex flex-col relative z-10 ${isDarkMode ? 'bg-[#0B1120]/80 border-white/10' : 'bg-white/95 border-slate-200'}`}>
         <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#00D4FF]/5 to-[#00D4FF]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
         
         {/* Command Bar */}
         <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-center backdrop-blur-md gap-4 ${isDarkMode ? 'border-white/10 bg-[#0B1120]/40' : 'border-slate-200 bg-slate-50/80'}`}>
           <div className="flex items-center gap-6">
             <h2 className={`text-2xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {monthNames[currentDate.getMonth()]} <span className={isDarkMode ? 'text-[#00D4FF]' : 'text-indigo-600'}>{currentDate.getFullYear()}</span>
             </h2>
             <div className={`hidden md:flex items-center rounded-xl border overflow-hidden shadow-inner flex-shrink-0 ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-300'}`}>
               <button onClick={handlePrevMonth} className={`p-2.5 border-r transition-colors text-sm ${isDarkMode ? 'text-slate-300 hover:bg-white/5/5 hover:text-[#00D4FF] border-white/10' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600 border-slate-300'}`}><ChevronLeft className="w-5 h-5" /></button>
               <button onClick={handleToday} className={`px-5 py-2.5 text-[10px] font-medium transition-colors ${isDarkMode ? 'text-slate-200 hover:bg-white/5/5 hover:text-[#00D4FF]' : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-600'}`}>Jump to Today</button>
               <button onClick={handleNextMonth} className={`p-2.5 border-l transition-colors text-sm ${isDarkMode ? 'text-slate-300 hover:bg-white/5/5 hover:text-[#00D4FF] border-white/10' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600 border-slate-300'}`}><ChevronRight className="w-5 h-5" /></button>
             </div>
           </div>
           
           <div className={`flex gap-2 p-1.5 rounded-xl border shadow-inner ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'}`}>
              <button className={`px-5 py-2 font-semibold rounded-full bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Month</button>
              <button className={`px-5 py-2 text-[10px] font-medium rounded-full transition-colors text-sm ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Week</button>
           </div>
         </div>

         {/* Chrono Grid */}
         <div className="flex-1 p-6 relative">
            <div className="grid grid-cols-7 gap-4 mb-4">
               {daysOfWeek.map(day => (
                 <div key={day} className={`text-center font-black text-[10px] ${isDarkMode ? 'text-slate-300/70' : 'text-slate-500'}`}>
                   {day}
                 </div>
               ))}
            </div>
            
            <div className="grid grid-cols-7 gap-3 sm:gap-4 h-[calc(100%-2rem)]">
              {calendarGrids.map((displayDate, index) => {
                const isCurrentMonth = displayDate !== null;
                const isToday = isCurrentMonth && 
                                displayDate === today.getDate() && 
                                currentDate.getMonth() === today.getMonth() && 
                                currentDate.getFullYear() === today.getFullYear();

                const dayEvents = isCurrentMonth ? events.filter(e => {
                   if (!e.date) return false;
                   const evtDate = new Date(e.date);
                   return evtDate.getDate() === displayDate && 
                          evtDate.getMonth() === currentDate.getMonth() && 
                          evtDate.getFullYear() === currentDate.getFullYear();
                }) : [];

                return (
                  <div key={index} className={`min-h-[120px] p-2.5 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                      isCurrentMonth 
                      ? (isDarkMode ? 'bg-[#0B1120]/40 border-white/5 hover:border-[#00D4FF]/30 hover:bg-white/5/80 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 hover:shadow-md') 
                      : 'bg-transparent border-transparent'
                  }`}>
                     {isCurrentMonth && (
                       <>
                         <div className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl mb-3 transition-colors ${
                           isToday 
                           ? (isDarkMode ? 'bg-[#00D4FF] text-[#0B1120] shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-indigo-600 text-white shadow-md') 
                           : (isDarkMode ? 'bg-[#0B1120] text-white border border-white/5 group-hover:border-[#00D4FF]/30 group-hover:text-[#00D4FF]' : 'bg-white text-slate-700 border border-slate-200 group-hover:border-indigo-300 group-hover:text-indigo-600 shadow-sm')
                         }`}>
                           {displayDate}
                         </div>
                         
                         <div className="space-y-2 overflow-y-auto max-h-[80px] custom-scrollbar pr-1">
                           {dayEvents.map((evt, i) => (
                             <div key={i} className={`flex items-start gap-1.5 p-2 rounded-lg border backdrop-blur-md shadow-sm ${
                                evt.color || 'bg-blue-500/100/10 text-blue-400 border-blue-500/20'
                             }`}>
                               <Activity className="w-3 h-3 shrink-0 mt-0.5" />
                               <div className="flex-1 min-w-0">
                                 <p className="text-[10px] font-black   truncate leading-tight mb-0.5">{evt.title}</p>
                                 <p className="text-[9px] font-bold opacity-70 truncate">{evt.time || 'All Day'}</p>
                               </div>
                             </div>
                           ))}
                         </div>

                         {(user?.role === 'admin' || user?.role === 'instructor') && (
                           <button 
                             onClick={() => setShowModal(true)} 
                             className={`absolute top-2 right-2 w-7 h-7 rounded-lg border items-center justify-center opacity-0 group-hover:opacity-100 transition-all hidden md:flex shadow-inner ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-slate-200 hover:bg-[#00D4FF]/20 hover:text-[#00D4FF] hover:border-[#00D4FF]/30' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 hover:border-slate-300'}`}
                           >
                             <Plus className="w-4 h-4" />
                           </button>
                         )}
                       </>
                     )}
                  </div>
                );
              })}
            </div>
          </div>
       </div>

       <AgendaCreationModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          onAgendaCreated={(evt) => {
             setEvents([...events, evt]);
             fetchEvents();
          }}
       />
    </div>
  );
}
