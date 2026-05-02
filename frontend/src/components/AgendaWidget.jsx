import React, { useState, useEffect } from 'react';
import { getRecentPublicUsers } from '../utils/api';
import { MoreHorizontal, Calendar, Bell, BookOpen, AlertCircle, HeartHandshake, Users, X, CheckCircle, Presentation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeMode from '../hooks/useThemeMode';

export default function AgendaWidget({ events, userRole, isAdmin, onDelete, onCreateClick }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState('10k+');
  const isDarkMode = useThemeMode();

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getRecentPublicUsers();
      if (data && data.success) {
        setRecentUsers(data.users || []);
        if (data.totalCount > 10000) {
           setTotalUsers('10k+');
        } else if (data.totalCount > 0) {
           setTotalUsers(data.totalCount.toString());
        }
      }
    };
    fetchUsers();
  }, []);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath || avatarPath === 'default-avatar.png') return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `http://localhost:5000${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
  };

  const getEventParticipants = (evt) => {
    let participants = recentUsers;
    if (!evt.targetAudiences?.includes('all')) {
       participants = recentUsers.filter(u => {
           const target = evt.targetAudiences || [];
           if (target.includes(u.role)) return true;
           if (target.includes('my_students') && u.role === 'student') return true;
           return false;
       });
    }
    return participants;
  };

  const renderAvatarStack = (evt, isModal = false) => {
    const participants = getEventParticipants(evt);
    return (
      <div className="flex -space-x-1.5 relative z-10">
        {participants.length > 0 ? (
          participants.slice(0, 3).map((u, i) => {
            const colors = ['bg-blue-500/100', 'bg-emerald-500/100', 'bg-rose-500/100'];
            const zIndexes = ['z-30', 'z-20', 'z-10'];
            const avatar = getAvatarUrl(u.avatar);
            return (
              <div key={u.id || i} className={`${isModal ? 'w-8 h-8 border-2' : 'w-5 h-5 border'} rounded-full border-[#0B1120] ${colors[i % colors.length]} overflow-hidden flex items-center justify-center shrink-0 relative ${zIndexes[i]}`}>
                {avatar ? (
                  <img src={avatar} alt={u.name || "User Avatar"} className="w-full h-full object-cover" />
                ) : (
                  <span className={`font-bold ${isModal ? 'text-xs' : 'text-[10px]'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{u.name ? u.name[0].toUpperCase() : 'U'}</span>
                )}
              </div>
            );
          })
        ) : (
          <>
            <div className={`${isModal ? 'w-8 h-8 border-2' : 'w-5 h-5 border'} rounded-full border-[#0B1120] bg-blue-500/100 overflow-hidden flex items-center justify-center shrink-0 relative z-30`}><span className={`font-bold ${isModal ? 'text-xs' : 'text-[10px]'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>K</span></div>
            <div className={`${isModal ? 'w-8 h-8 border-2' : 'w-5 h-5 border'} rounded-full border-[#0B1120] bg-emerald-500/100 overflow-hidden flex items-center justify-center shrink-0 relative z-20`}><span className={`font-bold ${isModal ? 'text-xs' : 'text-[10px]'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>N</span></div>
            <div className={`${isModal ? 'w-8 h-8 border-2' : 'w-5 h-5 border'} rounded-full border-[#0B1120] bg-rose-500/100 overflow-hidden flex items-center justify-center shrink-0 relative z-10`}><span className={`font-bold ${isModal ? 'text-xs' : 'text-[10px]'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>A</span></div>
          </>
        )}
        <div className={`${isModal ? 'w-8 h-8 border-2' : 'w-5 h-5 border'} rounded-full border-[#0B1120] bg-gradient-to-br from-[#00D4FF] to-[#0099CC] flex items-center justify-center z-0 font-black shrink-0 relative ${isModal ? 'text-[8px]' : 'text-[7px]'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {totalUsers}
        </div>
      </div>
    );
  };

  const getCategoryIcon = (type) => {
    switch(type) {
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'exam': return <BookOpen className="w-4 h-4" />;
      case 'announcement': return <Bell className="w-4 h-4" />;
      case 'advice': return <AlertCircle className="w-4 h-4" />;
      case 'support': return <HeartHandshake className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (type) => {
    switch(type) {
      case 'meeting': return 'bg-blue-500/100/20 text-blue-400 border-blue-500/30';
      case 'exam': return 'bg-rose-500/100/20 text-rose-400 border-rose-500/30';
      case 'announcement': return 'bg-indigo-500/100/20 text-indigo-400 border-indigo-500/30';
      case 'advice': return 'bg-amber-500/100/20 text-amber-400 border-amber-500/30';
      case 'support': return 'bg-emerald-500/100/20 text-emerald-400 border-emerald-500/30';
      default: return isDarkMode ? 'bg-[#1E293B]/40 backdrop-blur-xl text-slate-200 border-slate-500/30' : 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const filteredEvents = events.filter(evt => {
    if (isAdmin) return true;
    if (evt.targetAudiences?.includes('all')) return true;
    if (evt.targetAudiences?.includes(userRole)) return true;
    if (userRole === 'student' && evt.targetAudiences?.includes('my_students')) return true;
    if (userRole === 'instructor' && evt.targetAudiences?.includes('my_students')) return true;
    if (userRole === 'instructor' && evt.createdBy === 'self' /* pseudo logic for creators */) return true;
    return false;
  });

  return (
    <>
      <div className={`flex flex-col h-full backdrop-blur-xl border rounded-2xl p-5 shadow-lg relative min-h-[350px] ${isDarkMode ? 'bg-[#1E293B]/40 border-white/5' : 'bg-white/90 border-slate-200'}`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-5 shrink-0">
          <div>
            <h3 className={`font-semibold text-lg font-display tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Agenda Details</h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>{filteredEvents.length} items scheduled</p>
          </div>
          <MoreHorizontal className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`} />
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 pb-2 max-h-[260px]">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50 py-10">
              <Calendar className={`w-10 h-10 mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`} />
              <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>No agenda items at the moment.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const isInstructorPost = evt.targetAudiences?.includes('my_students');
              return (
                 <div 
                   key={evt.id} 
                   onClick={() => setSelectedEvent(evt)}
                   className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 relative overflow-hidden ${isDarkMode ? 'bg-[#1E293B]/60 border-white/5 hover:border-white/10 hover:bg-[#1E293B]/80' : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 shadow-sm'}`}
                 >
                   <div className="flex justify-between items-start gap-3">
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getCategoryColor(evt.type)}`}>
                            {evt.type || 'Announcement'}
                          </span>
                          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>
                            {new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          {isInstructorPost && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-500/100/20 text-purple-500 border border-purple-500/30 flex items-center gap-1 font-bold">
                               <Presentation className="w-2.5 h-2.5" /> Instructor Post
                            </span>
                          )}
                       </div>
                       <h4 className={`text-sm font-bold group-hover:text-[#F97316] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{evt.title}</h4>
                       
                       <div className="flex items-center gap-1.5 mt-2">
                         {renderAvatarStack(evt)}
                         <span className={`text-[10px] font-medium ml-1 flex items-center gap-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>
                            involving {(evt.targetAudiences || []).join(', ')}
                         </span>
                       </div>
                     </div>
                     
                     <div className="flex flex-col items-end gap-1">
                       {/* Admin Delete Action */}
                       {(isAdmin || evt.createdBy === 'self' || evt.canDelete) && onDelete && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); onDelete(evt.id); }} 
                           className="text-[10px] bg-rose-500/100/10 text-rose-400 px-2 py-1 rounded hover:bg-rose-500/100/20 hover:text-rose-300 transition-colors opacity-0 group-hover:opacity-100"
                         >
                           Delete
                         </button>
                       )}
                     </div>
                   </div>
                 </div>
              )
            })
          )}
        </div>

        {/* Footer Action */}
        {(isAdmin || userRole === 'instructor') && onCreateClick && (
          <div className={`shrink-0 pt-4 mt-1 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
            <button 
              onClick={onCreateClick} 
              className={`w-full py-2.5 text-sm font-semibold rounded-xl border transition-all hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border-[#00D4FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            >
              + Create Agenda Event
            </button>
          </div>
        )}
      </div>

      {/* Glassmorphic Details Popup Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg backdrop-blur-2xl border shadow-2xl rounded-3xl overflow-hidden ${isDarkMode ? 'bg-[#1E293B]/90 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'bg-white/95 border-slate-200'}`}
            >
               {/* Modal Header */}
               <div className={`px-6 py-5 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5 bg-[#1E293B]/50' : 'border-slate-200 bg-slate-50/80'}`}>
                 <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-inner ${getCategoryColor(selectedEvent.type)}`}>
                       {getCategoryIcon(selectedEvent.type)}
                    </div>
                    <div>
                      <h4 className={`font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedEvent.title}</h4>
                      <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>{new Date(selectedEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {selectedEvent.time || '12:00 PM'}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedEvent(null)} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'bg-[#1E293B]/5 text-slate-200 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                   <X className="w-4 h-4" />
                 </button>
               </div>
               
               {/* Modal Content */}
               <div className="p-6">
                 <div className="min-h-[100px]">
                    <h5 className={`text-xs font-bold mb-3 border-b pb-2 ${isDarkMode ? 'text-slate-300 border-white/5' : 'text-slate-600 border-slate-200'}`}>Full Details</h5>
                    <p className={`text-sm leading-relaxed whitespace-pre-line ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {selectedEvent.description || "No specific details or instructions provided for this event."}
                    </p>
                 </div>
                 
                 <div className={`mt-8 flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                   {renderAvatarStack(selectedEvent, true)}
                   <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Targeting {(selectedEvent.targetAudiences || []).join(', ')}</span>
                 </div>
               </div>

               {/* Modal Footer / Acknowledge */}
               <div className={`p-5 border-t flex justify-end ${isDarkMode ? 'border-white/5 bg-[#1E293B]/40' : 'border-slate-200 bg-slate-50/80'}`}>
                 <button 
                   onClick={() => setSelectedEvent(null)}
                   className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/100/10 text-emerald-400 font-bold rounded-xl border border-emerald-500/20 hover:bg-emerald-500/100 hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                 >
                   <CheckCircle className="w-4 h-4" /> Acknowledge & Close
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
