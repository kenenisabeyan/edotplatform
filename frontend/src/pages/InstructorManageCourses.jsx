import React, { useEffect, useState, useCallback, useMemo } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  FolderOpen, Edit3, Clock, CheckCircle2, 
  XSquare, PlayCircle, Send, Users, Sparkles, X, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstructorManageCourses() {
  const isDarkMode = useThemeMode();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalType, setModalType] = useState(null); // 'lessons' | 'students' | null
  const [activeCourse, setActiveCourse] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const isAdmin = user?.role === 'admin';

  const fetchCourses = useCallback(async () => {
    try {
      const endpoint = isAdmin ? '/admin/courses' : '/instructor/courses';
      const { data } = await api.get(endpoint);
      setCourses(data.data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  }, [isAdmin]);

  useEffect(() => {
    let isMounted = true;
    const loadCourses = async () => {
      try {
        await fetchCourses();
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadCourses();
    return () => { isMounted = false; };
  }, [fetchCourses]);

  const coursesByCategory = useMemo(() => {
    const grouped = {};
    courses.forEach(course => {
      const category = course.mainCategory || course.category || 'General Overview';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(course);
    });
    return grouped;
  }, [courses]);

  const openLessons = (course) => {
    setActiveCourse(course);
    setModalType('lessons');
  };

  const openStudents = async (course) => {
    setActiveCourse(course);
    setModalType('students');
    setLoadingStudents(true);
    try {
      const { data } = await api.get(`/courses/${course.id}/students`);
      if (data.success) {
         setCourseStudents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmitReview = async (courseId) => {
    if (isAdmin) return;
    try {
      await api.put(`/instructor/courses/${courseId}/submit`);
      fetchCourses();
    } catch (err) {
      console.error('Failed to submit for review', err);
    }
  };

  if (loading) {
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
      className="max-w-7xl mx-auto space-y-8 pb-10"
    >
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white/5 to-transparent border backdrop-blur-xl shadow-2xl relative overflow-hidden ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#008A32]/10 via-transparent to-[#FFD700]/10 opacity-30 pointer-events-none"></div>
        <div className="relative z-10 mb-4 sm:mb-0">
          <h2 className={`text-3xl font-display font-bold mb-2 tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <LayoutGrid className="w-7 h-7 text-[#FFD700]" /> Manage Courses
          </h2>
          <p className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Build, edit, and orchestrate top-tier learning experiences across domains.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/builder')} 
          className="relative z-10 inline-flex items-center gap-2 px-6 py-3 bg-[#FFD700] text-[#0f172a] font-bold rounded-xl hover:bg-[#EAB308] hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]"
        >
          <Sparkles className="w-5 h-5" /> 
          <span>Create New Course</span>
        </button>
      </div>
      
      {courses.length === 0 ? (
          <div className={`p-16 text-center rounded-3xl border shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center relative overflow-hidden group ${isDarkMode ? 'border-white/10 bg-[#0B0E14]/90' : 'border-slate-200 bg-white/95'}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#008A32]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className={`w-24 h-24 border rounded-full flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500 group-hover:border-[#E67E22]/30 group-hover:text-[#E67E22] ${isDarkMode ? 'bg-[#11151F]/5 text-slate-200 border-white/10' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              <FolderOpen className="w-12 h-12" />
            </div>
            <h3 className={`text-2xl font-display font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Your Digital Vault is Empty</h3>
            <p className={`max-w-sm mb-8 text-lg ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>You have not created or managed any courses yet.</p>
            <button 
              onClick={() => navigate('/dashboard/builder')} 
              className={`px-8 py-3.5 bg-gradient-to-r from-[#008A32] to-[#006622] font-bold rounded-xl hover:shadow-[0_0_25px_rgba(0,138,50,0.4)] transition-all hover:-translate-y-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            >
              Start Creating Now
            </button>
          </div>
      ) : (
          <div className="space-y-12">
            {Object.keys(coursesByCategory).sort().map((category) => (
               <div key={category}>
                 <div className="flex items-center gap-4 mb-6">
                   <h3 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                     <FolderOpen className="w-6 h-6 text-[#FFD700]" />
                     {category}
                   </h3>
                   <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                   {coursesByCategory[category].map(c => (
                     <motion.div 
                       whileHover={{ y: -6 }}
                       transition={{ duration: 0.2 }}
                       key={c.id} 
                       className={`rounded-3xl border shadow-2xl backdrop-blur-xl flex flex-col group transition-all h-full relative ${isDarkMode ? 'border-white/10 bg-[#0B0E14]/90' : 'border-slate-200 bg-white/95'}`}
                     >
                       <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700] opacity-5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                       
                       <div className="w-full h-48 relative overflow-hidden bg-[#11151F] rounded-t-3xl">
                           <img 
                             src={c.thumbnail === 'default-course.jpg' || !c.thumbnail ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' : c.thumbnail} 
                             alt={c.title} 
                             className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent opacity-90"></div>
                           
                           <div className="absolute top-4 right-4">
                             <span className={`inline-flex items-center px-3 py-1 rounded-md text-[9px] font-black   border ${
                               c.status === 'approved' ? 'bg-[#E67E22]/20 text-[#E67E22] border-[#E67E22]/30 shadow-[0_0_15px_rgba(0,138,50,0.2)]' : 
                               (c.status === 'pending' ? 'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 
                               (c.status === 'rejected' ? 'bg-[#E30A17]/20 text-[#E30A17] border-[#E30A17]/30 shadow-[0_0_15px_rgba(227,10,23,0.2)]' : 
                               'bg-[#11151F]/5 text-slate-300 border-white/10'))
                             }`}>
                               {c.status}
                             </span>
                           </div>
                       </div>
                       
                       <div className="flex flex-col flex-1 relative z-10 -mt-8 px-6 pb-6">
                         <h3 className={`text-xl font-bold leading-snug mb-4 line-clamp-2 drop-shadow-md group-hover:text-[#FFD700] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</h3>
                         
                         <div className={`flex flex-wrap items-center gap-3 text-xs font-semibold mb-5 p-3 rounded-xl border shadow-inner ${isDarkMode ? 'text-slate-300 bg-[#11151F]/5 border-white/10' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                           {(() => {
                             const totalMins = c.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0;
                             const hasLessons = Array.isArray(c.lessons) && c.lessons.length > 0;
                             const displayTime = hasLessons && totalMins > 0 
                               ? (totalMins >= 60 ? `${Math.floor(totalMins/60)}h ${totalMins%60}m` : `${totalMins}m`) 
                               : `${c.duration || 0}h`;
                             
                             return (
                               <>
                                 <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#FFD700]" /> {displayTime}</span>
                                 <div className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-[#11151F]/20' : 'bg-slate-100'}`}></div>
                                 
                                 <button onClick={() => openLessons(c)} className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group/btn">
                                   <PlayCircle className="w-3.5 h-3.5 text-[#E67E22] group-hover/btn:scale-110 transition-transform" /> {c.lessons?.length || 0} lessons
                                 </button>
                                 <div className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-[#11151F]/20' : 'bg-slate-100'}`}></div>
                                 
                                 <button onClick={() => openStudents(c)} className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group/btn">
                                   <Users className="w-3.5 h-3.5 text-indigo-400 group-hover/btn:scale-110 transition-transform" /> {c.totalStudents || 0} students
                                 </button>
                               </>
                             );
                           })()}
                         </div>

                         <div className={`mt-auto flex flex-col gap-3 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                           {!isAdmin && (c.status === 'draft' || c.status === 'rejected') && (
                             <button 
                               onClick={() => handleSubmitReview(c.id)} 
                               className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#008A32] to-[#006622] font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,138,50,0.4)] transition-all text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                             >
                               <Send className="w-3.5 h-3.5" /> Submit for Review
                             </button>
                           )}
                           
                           {c.status !== 'pending' && (
                             <button 
                               onClick={() => navigate('/dashboard/builder/' + c.id)} 
                               className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 font-bold rounded-xl border hover:bg-[#FFD700] hover:text-[#0B0E14] hover:border-[#FFD700] transition-colors shadow-sm text-xs ${isDarkMode ? 'bg-[#11151F]/5 text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'}`}
                             >
                               <Edit3 className="w-3.5 h-3.5" /> Edit Content
                             </button>
                           )}
                           
                           <button 
                             onClick={() => navigate('/dashboard/library', { state: { courseId: c.id } })} 
                             className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-cyan-400 font-bold rounded-xl border hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-colors shadow-sm text-xs ${isDarkMode ? 'bg-[#11151F]/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                           >
                              <FolderOpen className="w-3.5 h-3.5" /> Course Resources
                           </button>
                         </div>
                       </div>
                     </motion.div>
                   ))}
                 </div>
               </div>
            ))}
          </div>
      )}

      {/* Modals remain mostly unchanged but fit aesthetic */}
      <AnimatePresence>
        {modalType && activeCourse && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 ${isDarkMode ? 'bg-[#0B0E14]/80' : 'bg-white/90'}`}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-2xl border border-[#FFD700]/20 rounded-3xl p-6 shadow-[0_0_50px_rgba(255,215,0,0.1)] relative overflow-hidden flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-[#0B0E14]' : 'bg-white'}`}
            >
              <div className={`flex justify-between items-center mb-6 border-b pb-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                <div>
                  <h3 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {modalType === 'lessons' ? <PlayCircle className="w-7 h-7 text-[#E67E22]" /> : <Users className="w-7 h-7 text-indigo-400" />}
                    {modalType === 'lessons' ? 'Course Lessons' : 'Enrolled Students'}
                  </h3>
                  <p className="text-sm text-[#FFD700] font-semibold mt-1">{activeCourse.title}</p>
                </div>
                <button onClick={() => setModalType(null)} className={`p-2 hover:bg-[#E30A17]/20 hover:text-[#E30A17] rounded-xl transition-colors ${isDarkMode ? 'bg-[#11151F]/5 text-slate-200' : 'bg-slate-50 text-slate-600'}`}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto overflow-x-hidden pr-2 space-y-3 custom-scrollbar flex-1">
                {modalType === 'lessons' && (
                  activeCourse.lessons?.length === 0 ? (
                    <div className={`text-center p-8 italic rounded-2xl border ${isDarkMode ? 'text-slate-200 bg-[#11151F]/5 border-white/5' : 'text-slate-600 bg-slate-50 border-slate-100'}`}>No lessons have been added to this course yet.</div>
                  ) : (
                    activeCourse.lessons.map((l, index) => (
                      <div key={l.id || index} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border hover:border-[#FFD700]/30 transition-colors group ${isDarkMode ? 'bg-[#11151F]/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="w-10 h-10 rounded-xl bg-[#E67E22]/20 text-[#E67E22] flex items-center justify-center font-bold font-display shrink-0 group-hover:scale-110 transition-transform">{index + 1}</div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{l.title}</h4>
                          <p className={`text-xs flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}><Clock className="w-3.5 h-3.5" /> {l.duration} min</p>
                        </div>
                        <div className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-bold bg-black/40 border ${isDarkMode ? 'text-slate-300 border-white/10' : 'text-slate-500 border-slate-200'}`}>
                          {l.lesson_exam ? 'Has Quiz' : 'Video Only'}
                        </div>
                      </div>
                    ))
                  )
                )}

                {modalType === 'students' && (
                  loadingStudents ? (
                    <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-white/20 border-t-[#FFD700] rounded-full animate-spin"></div></div>
                  ) : courseStudents.length === 0 ? (
                    <div className={`text-center p-8 italic rounded-2xl border ${isDarkMode ? 'text-slate-200 bg-[#11151F]/5 border-white/5' : 'text-slate-600 bg-slate-50 border-slate-100'}`}>No students are currently enrolled in this course.</div>
                  ) : (
                    courseStudents.map((stu) => (
                      <div key={stu.id} className={`flex items-center gap-4 p-4 rounded-2xl border hover:border-indigo-500/30 transition-colors group ${isDarkMode ? 'bg-[#11151F]/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="w-12 h-12 rounded-full bg-indigo-500/100/20 text-indigo-400 flex items-center justify-center font-bold text-lg  shadow-inner border border-indigo-500/20 group-hover:scale-110 transition-transform shrink-0">
                          {stu.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stu.name}</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{stu.email}</p>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
