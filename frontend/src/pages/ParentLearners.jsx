import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { Users, BookOpen, Award, ChevronRight, Clock, Activity, CalendarDays, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ParentLearners() {
  const isDarkMode = useThemeMode();
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState({}); // Stores active tab per learner ID
  void motion;

  const [connectEmail, setConnectEmail] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectMsg, setConnectMsg] = useState('');

  const fetchLearners = async () => {
    try {
      const { data } = await api.get('/parent/learners');
      setLearners(data.data || []);
      
      const initialTabs = {};
      (data.data || []).forEach(l => {
        initialTabs[l.id] = 'overview';
      });
      setActiveTab(initialTabs);
    } catch (err) {
      console.error('Failed to fetch learners data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  const handleConnectLearner = async () => {
    if (!connectEmail) return;
    try {
      setConnecting(true);
      setConnectMsg('');
      const res = await api.post('/users/connect', { email: connectEmail });
      if (res.data.success) {
        setConnectMsg('Learner connected successfully!');
        setConnectEmail('');
        await fetchLearners();
        setTimeout(() => setConnectMsg(''), 3000);
      } else {
        setConnectMsg(res.data.message || 'Failed to connect.');
        setTimeout(() => setConnectMsg(''), 3000);
      }
    } catch (err) {
      setConnectMsg(err.response?.data?.message || 'Error connecting.');
      setTimeout(() => setConnectMsg(''), 3000);
    } finally {
      setConnecting(false);
    }
  };

  const setTab = (learnerId, tab) => {
    setActiveTab(prev => ({ ...prev, [learnerId]: tab }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full min-h-[60vh] ${isDarkMode ? 'bg-[#0B0E14]' : 'bg-white'}`}>
        <div className="relative w-16 h-16">
           <div className="absolute inset-0 rounded-full border-t-2 border-[#FFD700] animate-spin"></div>
           <div className="absolute inset-2 rounded-full border-r-2 border-[#E67E22] animate-[spin_1.5s_linear_infinite_reverse]"></div>
        </div>
      </div>
    );
  }

  if (learners.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl border max-w-2xl mx-auto mt-12 relative overflow-hidden ${isDarkMode ? 'bg-[#0B0E14]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
        <div className="absolute inset-0 bg-[#FFD700]/5 opacity-20 pointer-events-none blur-3xl"></div>
        <div className="w-24 h-24 bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
          <Users className="w-12 h-12" />
        </div>
        <h2 className={`text-2xl md:text-3xl font-bold mb-3 relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No Learners Linked</h2>
        <p className="text-sm font-normal text-gray-500 max-w-md mx-auto mb-8 relative z-10">
          Your account is not currently linked to any student profiles. Please enter your child's email address below to connect.
        </p>
        
        <div className="max-w-md mx-auto mb-4 relative z-10 text-left">
          <input 
            type="email"
            value={connectEmail}
            onChange={(e) => setConnectEmail(e.target.value)}
            placeholder="Student's registered email"
            className={`w-full pl-5 pr-32 py-4 bg-[#11151F] border placeholder-slate-500 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-shadow shadow-inner ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
          />
          <button 
            onClick={handleConnectLearner}
            disabled={connecting || !connectEmail}
            className={`absolute right-2 top-2 bottom-2 font-semibold text-sm px-6 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
          >
            {connecting ? 'Linking...' : 'Connect'}
          </button>
        </div>
        {connectMsg && (
          <p className={`text-sm font-bold   relative z-10 max-w-md mx-auto ${(connectMsg.includes('Failed') || connectMsg.includes('Error') || connectMsg.includes('not found') || connectMsg.includes('Only') || connectMsg.includes('Already')) ? 'text-[#E30A17]' : 'text-[#E67E22]'}`}>
            {connectMsg}
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-10 min-h-screen">
      <motion.div variants={itemVariants} className={`bg-gradient-to-br from-white/5 to-transparent border rounded-3xl p-8 lg:p-10 relative overflow-hidden shadow-2xl backdrop-blur-xl ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/10 via-transparent to-[#F97316]/10 opacity-30 pointer-events-none"></div>
        <div className="relative z-10 lg:flex lg:justify-between lg:items-center">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Learner Profiles</h1>
            <p className="text-sm font-normal text-gray-500 max-w-xl">Deep dive into your assigned learners' academic portfolios, progress, and recent activity.</p>
          </div>
          <div className="mt-6 lg:mt-0 lg:ml-6 max-w-sm w-full relative group">
            <input 
              type="email"
              value={connectEmail}
              onChange={(e) => setConnectEmail(e.target.value)}
              placeholder="Connect another learner email..."
              className={`w-full pl-5 pr-28 py-3.5 bg-black/40 border placeholder-slate-500 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#FFD700] transition-all shadow-inner backdrop-blur-md ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
            />
            <button 
              onClick={handleConnectLearner}
              disabled={connecting || !connectEmail}
              className={`absolute right-2 top-2 bottom-2 text-sm font-semibold px-4 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            >
              {connecting ? '...' : 'Add'}
            </button>
            {connectMsg && (
              <div className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-xl text-xs font-bold shadow-2xl z-50 border ${connectMsg.includes('successfully') ? 'bg-[#E67E22]/90 border-[#E67E22] backdrop-blur-md' : 'bg-[#E30A17]/90 border-[#E30A17] backdrop-blur-md'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {connectMsg}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-10">
        {learners.map((learner) => {
          const tab = activeTab[learner.id] || 'overview';
          const totalEnrollments = learner.enrolledCourses?.length || 0;
          const completedCourses = learner.enrolledCourses?.filter(c => c.passedFinalExam).length || 0;
          
          return (
            <motion.div variants={itemVariants} key={learner.id} className={`backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col xl:flex-row hover:border-white/20 transition-all duration-300 relative group ${isDarkMode ? 'bg-[#0B0E14]/80 border-white/10' : 'bg-white/90 border-slate-200'}`}>
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#FFD700]/5 rounded-br-full pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

              {/* Sidebar Profile Panel */}
              <div className={`xl:w-[340px] bg-[#11151F]/80 backdrop-blur-md p-8 border-b xl:border-b-0 xl:border-r flex flex-col relative shrink-0 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex flex-col items-center text-center relative z-10 mb-8 mt-4">
                  <motion.div whileHover={{ scale: 1.05 }} className={`w-28 h-28 rounded-full border-2 shadow-2xl mb-5 overflow-hidden ring-4 ring-black/40 ${isDarkMode ? 'bg-[#11151F]/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <img 
                      src={`http://localhost:5000/uploads/avatars/${learner.avatar || 'default-avatar.png'}`} 
                      alt={learner.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(learner.name) + '&background=11151F&color=FFD700&size=200';
                      }}
                    />
                  </motion.div>
                  <h2 className={`text-2xl font-display font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{learner.name}</h2>
                  <p className="text-[#FFD700] font-bold text-xs   mt-2">{learner.email}</p>
                </div>
                
                {/* Navigation Tabs */}
                <div className="flex flex-col gap-3 mt-auto relative z-10">
                   <button 
                     onClick={() => setTab(learner.id, 'overview')}
                     className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${tab === 'overview' ? 'bg-[#FFD700] text-[#0f172a] shadow-[0_0_20px_rgba(255,215,0,0.3)]' : 'bg-[#11151F]/5 hover:text-white border hover:bg-[#11151F]/10'} ${isDarkMode ? 'text-slate-200 border-white/10' : 'text-slate-600 border-slate-200'}`}
                   >
                     <BarChart2 className="w-4 h-4" /> Overview
                   </button>
                   <button 
                     onClick={() => setTab(learner.id, 'courses')}
                     className={`flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${tab === 'courses' ? 'bg-[#FFD700] text-[#0f172a] shadow-[0_0_20px_rgba(255,215,0,0.3)]' : 'bg-[#11151F]/5 hover:text-white border hover:bg-[#11151F]/10'} ${isDarkMode ? 'text-slate-200 border-white/10' : 'text-slate-600 border-slate-200'}`}
                   >
                     <div className="flex items-center gap-3"><BookOpen className="w-4 h-4" /> Enrolled</div>
                     <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${tab === 'courses' ? 'bg-[#0f172a]/20 text-[#0f172a]' : 'bg-[#11151F]/10 '} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalEnrollments}</span>
                   </button>
                   <button 
                     onClick={() => setTab(learner.id, 'activity')}
                     className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden group ${tab === 'activity' ? 'bg-[#E30A17]/10 border border-[#E30A17]/50 shadow-[0_0_20px_rgba(227,10,23,0.2)]' : 'bg-[#11151F]/5 hover: border border-rose-500/10 hover:border-rose-500/30'} ${isDarkMode ? 'text-white text-slate-200' : 'text-slate-900 text-slate-600'}`}
                   >
                     {/* Pulsing indicator specifically for Insights */}
                     <div className={`absolute left-0 top-0 bottom-0 w-1 ${tab === 'activity' ? 'bg-[#E30A17] shadow-[0_0_10px_#E30A17]' : 'bg-transparent group-hover:bg-[#E30A17]/50'}`}></div>
                     <Activity className={`w-4 h-4 ${tab === 'activity' ? 'text-[#E30A17]' : ''}`} /> 
                     Actionable Insights
                   </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-8 xl:p-10 min-w-0 bg-transparent relative">
                 <AnimatePresence mode="wait">
                    
                    {/* TAB: OVERVIEW */}
                    {tab === 'overview' && (
                      <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-8 h-full flex flex-col">
                        <div>
                          <h3 className={`text-2xl font-display font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Academic Overview</h3>
                          <p className={`font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Quick glance at current trajectory and totals.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-[#11151F] to-[#0B0E14] border border-[#FFD700]/20 rounded-3xl p-8 relative overflow-hidden group hover:border-[#FFD700]/50 transition-colors shadow-xl">
                                <div className="absolute -right-6 -top-6 text-[#FFD700]/10 group-hover:text-[#FFD700]/20 transition-colors duration-500">
                                   <BookOpen className="w-36 h-36 transform -rotate-12 group-hover:scale-110 transition-transform" />
                                </div>
                                <p className="text-sm font-medium text-gray-500 mb-2 relative z-10">Total Enrolled</p>
                                <div className="flex items-baseline gap-2 relative z-10">
                                   <span className={`text-2xl md:text-3xl font-bold drop-shadow-md ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalEnrollments}</span>
                                   <span className="text-xs text-gray-400">courses</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-[#11151F] to-[#0B0E14] border border-[#E67E22]/20 rounded-3xl p-8 relative overflow-hidden group hover:border-[#E67E22]/50 transition-colors shadow-xl">
                                <div className="absolute -right-6 -top-6 text-[#E67E22]/10 group-hover:text-[#E67E22]/20 transition-colors duration-500">
                                   <Award className="w-36 h-36 transform -rotate-12 group-hover:scale-110 transition-transform" />
                                </div>
                                <p className="text-sm font-medium text-gray-500 mb-2 relative z-10">Certifications</p>
                                <div className="flex items-baseline gap-2 relative z-10">
                                   <span className={`text-2xl md:text-3xl font-bold drop-shadow-md ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{completedCourses}</span>
                                   <span className="text-xs text-gray-400">completed</span>
                                </div>
                            </div>
                        </div>

                        <div className={`flex-1 rounded-3xl border p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group ${isDarkMode ? 'bg-[#11151F]/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                           <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                           <CalendarDays className={`w-12 h-12 mb-4 group-hover:scale-110 transition-transform ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                           <h4 className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Detailed Analytics Locked</h4>
                           <p className={`max-w-sm text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Deeper timeline analytics and predictive grading are available in the expanded premium parent tier coming soon.</p>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB: COURSES */}
                    {tab === 'courses' && (
                      <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className={`text-2xl font-display font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Enrolled Courses</h3>
                        </div>
                        
                        {learner.enrolledCourses?.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {learner.enrolledCourses.map((enrollment, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                key={idx} 
                                className={`group bg-[#11151F] border p-6 rounded-3xl hover:border-[#FFD700]/30 hover:shadow-[0_10px_30px_rgba(255,215,0,0.05)] transition-all duration-300 relative overflow-hidden ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}
                              >
                                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none group-hover:bg-[#FFD700]/10 transition-colors ${isDarkMode ? 'bg-[#11151F]/5' : 'bg-slate-50'}`}></div>
                                <div className="flex items-start gap-5 mb-6 relative z-10">
                                  <div className="w-16 h-16 rounded-2xl bg-black overflow-hidden shrink-0 shadow-lg relative group-hover:ring-2 ring-[#FFD700] ring-offset-2 ring-offset-[#11151F] transition-all">
                                    <img 
                                      src={`http://localhost:5000${enrollment.course?.thumbnail || '/default.jpg'}`} 
                                      alt={enrollment.course?.title}
                                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80'; }}
                                    />
                                    {enrollment.passedFinalExam && (
                                       <div className="absolute inset-0 bg-[#E67E22]/50 backdrop-blur-sm flex items-center justify-center">
                                          <CheckCircle className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
                                       </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-lg leading-tight mb-2 truncate group-hover:text-[#FFD700] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                      {enrollment.course?.title || 'Unknown Course'}
                                    </h4>
                                    <p className="text-[10px] font-black   text-[#FFD700] flex items-center gap-2 line-clamp-1 bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 py-1 rounded-md w-fit">
                                       {enrollment.course?.category || 'General'}
                                    </p>
                                  </div>
                                </div>

                                <div className="relative z-10">
                                  <div className="flex justify-between items-end mb-3">
                                     <span className={`text-[10px] font-black   ${enrollment.progress === 100 ? 'text-[#E67E22]' : 'text-slate-200'}`}>
                                       {enrollment.progress === 100 ? 'Certified' : 'Progress Status'}
                                     </span>
                                     <span className={`text-2xl font-display font-black tabular-nums tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {enrollment.progress || 0}<span className={`text-sm ml-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>%</span>
                                     </span>
                                  </div>
                                  <div className={`h-1.5 w-full bg-black rounded-full overflow-hidden shadow-inner border ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${enrollment.progress || 0}%` }}
                                      transition={{ duration: 1, delay: 0.2 + (idx * 0.1), ease: "easeOut" }}
                                      className={`h-full rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)] ${enrollment.progress === 100 ? 'bg-gradient-to-r from-[#00D4FF] to-[#00b3ff]' : 'bg-gradient-to-r from-[#F97316] to-[#EAB308]'}`}
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className={`h-64 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 ${isDarkMode ? 'bg-[#11151F]/5' : 'bg-slate-50'}`}>
                             <BookOpen className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                             <p className={`font-bold text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No courses enrolled yet.</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* TAB: AI INSIGHTS & INTERVENTIONS */}
                    {tab === 'activity' && (
                      <motion.div key="activity" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className="space-y-6">
                        <div className={`flex justify-between items-end mb-8 border-b pb-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                          <div>
                             <h3 className={`text-3xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                <span className="text-[#E30A17] hover:drop-shadow-[0_0_10px_rgba(227,10,23,0.8)] transition-all cursor-default">🧠</span> Psychological & Attendance Intel
                             </h3>
                             <p className={`font-medium text-sm mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Real-time behavior analysis and recommended interventions.</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                           {learner.activities?.length > 0 ? learner.activities.map((insight, idx) => {
                             
                             let colorTheme = 'border-slate-500/20 bg-slate-500/5 text-slate-200';
                             let ringColor = 'ring-slate-500/20';
                             let iconColor = 'text-slate-200';
                             
                             if (insight.insightFlag === 'Critical') {
                                colorTheme = 'border-[#E30A17]/30 bg-[#E30A17]/5 text-white shadow-[0_0_30px_rgba(227,10,23,0.05)] hover:shadow-[0_0_40px_rgba(227,10,23,0.15)]';
                                ringColor = 'ring-[#E30A17]/30 border-[#E30A17]';
                                iconColor = 'text-[#E30A17]';
                             } else if (insight.insightFlag === 'Warning') {
                                colorTheme = 'border-[#FFD700]/30 bg-[#FFD700]/5 text-white hover:border-[#FFD700]/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.1)]';
                                ringColor = 'ring-[#FFD700]/30 border-[#FFD700]';
                                iconColor = 'text-[#FFD700]';
                             } else if (insight.insightFlag === 'Positive') {
                                colorTheme = 'border-[#E67E22]/30 bg-[#E67E22]/5 text-white hover:border-[#E67E22]/50';
                                ringColor = 'ring-[#00D4FF]/30 border-[#F97316]';
                                iconColor = 'text-[#E67E22]';
                             }

                             return (
                               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.15, type: 'spring', stiffness: 300 }} key={idx} className={`relative p-6 rounded-3xl border ${colorTheme} transition-all duration-300 group`}>
                                  
                                  {/* Pulsing indicator if critical */}
                                  {insight.insightFlag === 'Critical' && (
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#E30A17]/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
                                  )}

                                  <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 bg-black/40 ring-4 ${ringColor}`}>
                                       {insight.insightFlag === 'Critical' ? <Activity className={`w-8 h-8 ${iconColor}`} /> : 
                                        insight.insightFlag === 'Warning' ? <Clock className={`w-8 h-8 ${iconColor}`} /> : 
                                        <Award className={`w-8 h-8 ${iconColor}`} />}
                                     </div>
                                     
                                     <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                           <h4 className="font-bold text-xl leading-tight">
                                             {insight.action}
                                           </h4>
                                           <span className={`text-[10px] font-black px-3 py-1 rounded-lg border ${insight.insightFlag === 'Critical' ? 'bg-[#E30A17] border-[#E30A17]' : insight.insightFlag === 'Warning' ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-[#E67E22] border-[#E67E22]'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                              {insight.insightFlag} 
                                           </span>
                                        </div>
                                        
                                        <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                                          {insight.details}
                                        </p>
                                        
                                        {insight.metadata?.recommendation && (
                                           <div className={`mt-2 p-4 rounded-xl text-xs font-bold ${insight.insightFlag === 'Critical' ? 'bg-[#E30A17]/10 ' : 'bg-black/30 border '} ${isDarkMode ? 'text-white text-slate-300 border-white/5' : 'text-slate-900 text-slate-500 border-slate-100'}`}>
                                              <span className="opacity-50   mr-2">Recommendation:</span>
                                              {insight.metadata.recommendation}
                                           </div>
                                        )}
                                     </div>
                                     
                                     {/* Call to action */}
                                     {insight.insightFlag === 'Critical' && (
                                        <div className="flex items-center justify-center md:items-start shrink-0">
                                           <button className={`font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                              Take Action
                                           </button>
                                        </div>
                                     )}
                                     {insight.insightFlag === 'Warning' && (
                                        <div className="flex items-center justify-center md:items-start shrink-0">
                                           <button className={`border font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap bg-[#E67E22] hover:bg-[#CF711F] shadow-md border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                              Message Instructor
                                           </button>
                                        </div>
                                     )}
                                  </div>
                               </motion.div>
                             );
                           }) : (
                               <div className={`p-12 text-center border rounded-3xl ${isDarkMode ? 'bg-[#11151F]/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                  <Activity className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                                  <p className={`font-bold text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No insights generated yet.</p>
                               </div>
                           )}
                        </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
              
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
