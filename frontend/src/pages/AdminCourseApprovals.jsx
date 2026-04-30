import React, { useEffect, useState, useCallback } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { 
  ClipboardCheck, Clock, CheckCircle2, 
  XSquare, Users, AlertCircle, FileText, BadgeInfo, Undo2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCourseApprovals() {
  const isDarkMode = useThemeMode();
  const [courses, setCourses] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [activeEnrollments, setActiveEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'active'

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
         const { data: coursesData } = await api.get('/admin/courses/pending');
         setCourses(coursesData.data);
         const { data: enrollmentsData } = await api.get('/admin/enrollments/pending');
         setPendingEnrollments(enrollmentsData.data);
      } else {
         const { data: activeData } = await api.get('/admin/enrollments/active');
         setActiveEnrollments(activeData.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (courseId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus === 'approved' ? 'approve and publish' : 'reject'} this course?`)) return;
    
    setProcessing(courseId);
    try {
      await api.put(`/admin/courses/${courseId}/status`, { status: newStatus });
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      console.error('Failed to update course status', err);
      alert('Failed to update course status');
    } finally {
      setProcessing(null);
    }
  };

  const handleEnrollmentStatusUpdate = async (enrollmentId, newStatus, isRollback = false) => {
    const actionText = newStatus === 'approved' || newStatus === 'active' ? 'approve' : (isRollback ? 'revoke/rollback' : 'reject');
    if (!window.confirm(`Are you sure you want to ${actionText} this enrollment?`)) return;

    setProcessing(enrollmentId);
    try {
      await api.put(`/admin/enrollments/${enrollmentId}/status`, { status: newStatus === 'approved' ? 'active' : newStatus });
      
      if (activeTab === 'pending') {
        setPendingEnrollments(pendingEnrollments.filter(en => en.id !== enrollmentId));
      } else {
        setActiveEnrollments(activeEnrollments.filter(en => en.id !== enrollmentId));
      }
    } catch (err) {
      console.error('Failed to update enrollment status', err);
      alert('Failed to update enrollment status');
    } finally {
      setProcessing(null);
    }
  };

  if (loading && courses.length === 0 && pendingEnrollments.length === 0 && activeEnrollments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#FFD700] rounded-full animate-spin shadow-[0_0_15px_rgba(255,215,0,0.4)]"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-6 pb-10 font-sans"
    >
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white/5 to-transparent border backdrop-blur-xl shadow-2xl relative overflow-hidden ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 via-transparent to-[#E30A17]/10 opacity-30 pointer-events-none"></div>
        <div className="relative z-10 mb-4 sm:mb-0">
          <h2 className={`text-3xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Approvals Management</h2>
          <p className={`mt-1 font-medium text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Review courses and administer student enrollment placements.</p>
        </div>
        <div className={`relative z-10 bg-[#11151F] flex rounded-xl border p-1 shadow-lg ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
           <button 
             onClick={() => setActiveTab('pending')}
             className={`px-6 py-2.5 rounded-lg text-xs font-black   transition-all ${activeTab === 'pending' ? 'bg-[#FFD700]/20 text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'text-slate-300 hover:text-white'}`}
           >
             Pending Queue
           </button>
           <button 
             onClick={() => setActiveTab('active')}
             className={`px-6 py-2.5 rounded-lg text-xs font-black   transition-all ${activeTab === 'active' ? 'bg-[#E67E22]/20 text-[#E67E22] shadow-[0_0_15px_rgba(0,138,50,0.2)]' : 'text-slate-300 hover:text-white'}`}
           >
             Active Enrollments
           </button>
        </div>
      </div>
      
      {activeTab === 'pending' && (courses.length === 0 && pendingEnrollments.length === 0) ? (
          <div className={`p-16 text-center rounded-3xl border shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 ${isDarkMode ? 'border-white/10 bg-[#0B0E14]/90' : 'border-slate-200 bg-white/95'}`}>
            <div className={`w-24 h-24 border rounded-full flex items-center justify-center mb-6 relative group border border-[#E67E22]/30 text-[#E67E22] ${isDarkMode ? 'bg-[#11151F]/5 text-slate-200 border-white/10' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <ClipboardCheck className="w-12 h-12" />
            </div>
            <h3 className={`text-2xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Queue Clear</h3>
            <p className={`max-w-sm mb-8 text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>There are no pending course or enrollment approvals waiting for your review.</p>
          </div>
      ) : activeTab === 'pending' ? (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {courses.length > 0 && (
              <div className={`rounded-3xl p-6 border backdrop-blur-xl shadow-2xl ${isDarkMode ? 'bg-[#11151F]/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <h3 className={`font-black text-lg mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><AlertCircle className="w-5 h-5 text-[#FFD700]"/> New Course Approvals ({courses.length})</h3>
                <div className="grid gap-6">
                  <AnimatePresence>
                  {courses.map(c => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={c.id} 
                      className={`rounded-2xl border shadow-inner overflow-hidden flex flex-col md:flex-row group transition-all ${isDarkMode ? 'border-white/10 bg-[#0B0E14]' : 'border-slate-200 bg-white'}`}
                    >
                      <div className="w-full md:w-64 h-56 md:h-auto shrink-0 relative bg-black/40">
                        <img 
                          src={c.thumbnail === 'default-course.jpg' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' : c.thumbnail} 
                          alt={c.title} 
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent opacity-80 md:opacity-50"></div>
                        <div className={`absolute top-4 left-4 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-black text-[#FFD700] shadow-sm border ${isDarkMode ? 'bg-[#0B0E14]/80 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                          {c.mainCategory || 'General'}
                        </div>
                      </div>
                      <div className={`flex flex-col flex-1 relative z-10 -mt-6 md:mt-0 md:bg-transparent rounded-t-3xl md:rounded-none ${isDarkMode ? 'bg-[#0B0E14]/90' : 'bg-white/95'}`}>
                        <div className="p-6 flex-1">
                          <h3 className={`text-xl font-black leading-snug break-words mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</h3>
                          <div className={`flex flex-wrap gap-4 mb-4 text-[10px] font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                             <span className={`flex items-center gap-1 border px-2 py-1 rounded ${isDarkMode ? 'border-white/5 bg-[#11151F]/5' : 'border-slate-100 bg-slate-50'}`}>Instructor: <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{c.instructor?.name || 'Unknown'}</span></span>
                             <span className={`flex items-center gap-1 border bg-[#FFD700]/10 text-[#FFD700] px-2 py-1 rounded ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Status: Pending</span>
                          </div>
                          <p className={`line-clamp-2 md:line-clamp-3 mb-0 text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{c.description}</p>
                        </div>
                        <div className={`p-5 border-t flex flex-col sm:flex-row justify-between items-center gap-5 ${isDarkMode ? 'border-white/5 bg-[#11151F]/50' : 'border-slate-100 bg-slate-100'}`}>
                          <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Submitted: <span className={isDarkMode ? 'text-slate-300' : 'text-slate-500'}>{new Date(c.createdAt || c.updatedAt).toLocaleDateString()}</span></span>
                          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <button 
                              disabled={processing === c.id}
                              onClick={() => handleStatusUpdate(c.id, 'rejected')} 
                              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-transparent text-[#E30A17] font-black text-xs   rounded-xl border border-[#E30A17]/30 hover:bg-[#E30A17]/10 transition-colors shadow-sm disabled:opacity-50"
                            >
                              <XSquare className="w-4 h-4" /> Reject
                            </button>
                            <button 
                              disabled={processing === c.id}
                              onClick={() => handleStatusUpdate(c.id, 'approved')} 
                              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#008A32] to-[#00A13B] font-black text-xs rounded-xl hover:shadow-[0_0_20px_rgba(0,138,50,0.4)] transition-all shadow-md disabled:opacity-50 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve & Publish
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {pendingEnrollments.length > 0 && (
              <div className={`rounded-3xl p-6 border backdrop-blur-xl shadow-2xl mt-4 ${isDarkMode ? 'bg-[#11151F]/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <h3 className={`font-black text-lg mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><Users className="w-5 h-5 text-[#FFD700]"/> Enrollment Requests ({pendingEnrollments.length})</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <AnimatePresence>
                  {pendingEnrollments.map(en => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={en.id} 
                      className={`rounded-2xl border p-5 flex flex-col justify-between hover:border-[#FFD700]/30 transition-colors group shadow-lg relative overflow-hidden ${isDarkMode ? 'border-white/10 bg-[#0B0E14]' : 'border-slate-200 bg-white'}`}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#FFD700]/10 transition-colors duration-500"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-2">
                           <h4 className={`font-black tracking-tight text-lg mb-1 break-words line-clamp-1 group-hover:text-[#FFD700] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{en.courseTitle}</h4>
                           <span className={`text-[9px] font-black border px-2 py-0.5 rounded whitespace-nowrap ${isDarkMode ? 'text-slate-300 bg-[#11151F]/5 border-white/10' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>ID: {en.id.slice(0,6)}</span>
                        </div>
                        
                        <div className={`bg-[#11151F] border p-3 rounded-xl mb-6 flex flex-col gap-1.5 mt-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                           <div className="flex items-center justify-between text-xs">
                             <span className={`font-black text-[10px] ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Student</span>
                             <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{en.studentName || 'System Unknown'}</span>
                           </div>
                           <div className="flex items-center justify-between text-xs">
                             <span className={`font-black text-[10px] ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Email</span>
                             <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{en.studentEmail || 'N/A'}</span>
                           </div>
                           <div className={`flex items-center justify-between text-xs border-t pt-1.5 mt-1.5 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                             <span className={`font-black text-[10px] ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Submitted On</span>
                             <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{new Date(en.requestedAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex gap-3 relative z-10 mt-auto">
                        <button
                          disabled={processing === en.id}
                          onClick={() => handleEnrollmentStatusUpdate(en.id, 'rejected')}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#E30A17]/30 bg-transparent text-[#E30A17] text-xs font-black   hover:bg-[#E30A17]/10 transition-colors disabled:opacity-50"
                        ><XSquare className="w-4 h-4"/> Reject</button>
                        <button
                          disabled={processing === en.id}
                          onClick={() => handleEnrollmentStatusUpdate(en.id, 'active')}
                          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#008A32] to-[#00A13B] text-xs font-black hover:shadow-[0_0_20px_rgba(0,138,50,0.4)] transition-all disabled:opacity-50 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                        ><CheckCircle2 className="w-4 h-4"/> Ensure Access</button>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
      ) : activeTab === 'active' && activeEnrollments.length === 0 ? (
          <div className={`p-16 text-center rounded-3xl border shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 ${isDarkMode ? 'border-white/10 bg-[#0B0E14]/90' : 'border-slate-200 bg-white/95'}`}>
            <div className={`w-24 h-24 border rounded-full flex items-center justify-center mb-6 relative group border border-blue-500/30 text-blue-500 ${isDarkMode ? 'bg-[#11151F]/5 text-slate-200 border-white/10' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <BadgeInfo className="w-12 h-12" />
            </div>
            <h3 className={`text-2xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No Active Enrollments</h3>
            <p className={`max-w-sm mb-8 text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>There are currently zero active students in the system.</p>
          </div>
      ) : (
          <div className={`rounded-3xl p-6 border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDarkMode ? 'bg-[#11151F]/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
            <h3 className={`font-black text-lg mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><CheckCircle2 className="w-5 h-5 text-[#E67E22]"/> Active Authorized Enrollments ({activeEnrollments.length})</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
              {activeEnrollments.map(en => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={en.id} 
                  className={`rounded-2xl border border-[#E67E22]/20 p-5 flex flex-col justify-between hover:border-[#E67E22]/50 transition-colors group shadow-lg relative overflow-hidden ${isDarkMode ? 'bg-[#0B0E14]' : 'bg-white'}`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#E67E22]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#E67E22]/10 transition-colors duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                       <h4 className={`font-black tracking-tight text-lg mb-1 break-words line-clamp-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{en.courseTitle}</h4>
                       <span className="text-[9px] font-black  text-[#E67E22] bg-[#E67E22]/10 border border-[#E67E22]/30 px-2 py-0.5 rounded  whitespace-nowrap">Active</span>
                    </div>
                    
                    <div className={`bg-[#11151F] border p-3 rounded-xl mb-6 flex flex-col gap-1.5 mt-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                       <div className="flex items-center justify-between text-xs">
                         <span className={`font-black text-[10px] ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Student</span>
                         <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{en.studentName || 'System Unknown'}</span>
                       </div>
                       <div className="flex items-center justify-between text-xs">
                         <span className={`font-black text-[10px] ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Email</span>
                         <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{en.studentEmail || 'N/A'}</span>
                       </div>
                       <div className={`flex items-center justify-between text-xs border-t pt-1.5 mt-1.5 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                         <span className={`font-black text-[10px] ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Verified On</span>
                         <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{new Date(en.requestedAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto">
                    <button
                      disabled={processing === en.id}
                      onClick={() => handleEnrollmentStatusUpdate(en.id, 'rejected', true)}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border bg-transparent hover:text-[#E30A17] hover:border-[#E30A17]/30 text-[10px] font-black hover:bg-[#E30A17]/10 transition-all disabled:opacity-50 ${isDarkMode ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-600'}`}
                    ><Undo2 className="w-3.5 h-3.5"/> Revoke Access / Rollback</button>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          </div>
      )}
    </motion.div>
  );
}

