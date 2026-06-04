import React, { useState, useCallback } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { 
  ClipboardCheck, CheckCircle2, 
  XSquare, Users, AlertCircle, BadgeInfo, Undo2,
  Globe, Calculator, BookOpen, Rocket, Target, UserCheck,
  LayoutGrid, List, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import UserAvatar from '../components/UserAvatar';
import CourseFallbackThumbnail from '../components/CourseFallbackThumbnail';

const CAT_COLORS = {
  "Social Science": { main: "#F97316", dark: "#C2410C" }, 
  "Mathematics & Natural Science": { main: "#3B82F6", dark: "#1D4ED8" }, 
  "Natural Language": { main: "#A855F7", dark: "#7E22CE" }, 
  "Programming & Technology": { main: "#6366F1", dark: "#4338CA" }, 
  "Business & Entrepreneurship": { main: "#FFD700", dark: "#CA8A04" }, 
  "Personal Development": { main: "#22C55E", dark: "#15803D" }
};

const DEFAULT_COLOR = { main: "#3b82f6", dark: "#2563eb" };

const CAT_ICONS = {
  "Social Science": Globe,
  "Mathematics & Natural Science": Calculator,
  "Natural Language": BookOpen,
  "Programming & Technology": Rocket,
  "Business & Entrepreneurship": Target,
  "Personal Development": UserCheck,
  "General Overview": BookOpen
};

const normalizeCategory = (cat) => {
  const c = cat?.toLowerCase() || '';
  if (c.includes('social')) return 'Social Science';
  if (c.includes('math') || c.includes('science')) return 'Mathematics & Natural Science';
  if (c.includes('language')) return 'Natural Language';
  if (c.includes('programming') || c.includes('tech')) return 'Programming & Technology';
  if (c.includes('business') || c.includes('entrepreneur')) return 'Business & Entrepreneurship';
  if (c.includes('personal') || c.includes('growth') || c.includes('development')) return 'Personal Development';
  return 'General Overview';
};

export default function AdminCourseApprovals() {
  const isDarkMode = useThemeMode();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'active'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Parallel Query Fetching for counts persistence
  const { data: pendingData = { courses: [], pendingEnrollments: [] }, isLoading: loadingPending } = useQuery({
    queryKey: ['adminPendingApprovals'],
    queryFn: async () => {
      const [{ data: coursesData }, { data: enrollmentsData }] = await Promise.all([
        api.get('/admin/courses/pending'),
        api.get('/admin/enrollments/pending')
      ]);
      return {
        courses: coursesData.data || [],
        pendingEnrollments: enrollmentsData.data || []
      };
    }
  });

  const { data: activeEnrollments = [], isLoading: loadingActive } = useQuery({
    queryKey: ['adminActiveEnrollments'],
    queryFn: async () => {
      const { data: activeData } = await api.get('/admin/enrollments/active', { params: { limit: 100 } });
      return activeData.data || [];
    }
  });

  const courses = pendingData.courses || [];
  const pendingEnrollments = pendingData.pendingEnrollments || [];
  const loading = loadingPending || loadingActive;

  const fetchData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['adminPendingApprovals'] });
    queryClient.invalidateQueries({ queryKey: ['adminActiveEnrollments'] });
  }, [queryClient]);

  // Derived filter arrays
  const filteredCourses = React.useMemo(() => {
    return courses.filter(c => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = c.title?.toLowerCase().includes(query);
        const matchesInstructor = c.instructor?.name?.toLowerCase().includes(query);
        const matchesDesc = c.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesInstructor && !matchesDesc) return false;
      }
      if (categoryFilter) {
        const normCourseCat = normalizeCategory(c.mainCategory || c.category);
        if (normCourseCat !== categoryFilter) return false;
      }
      return true;
    });
  }, [courses, searchQuery, categoryFilter]);

  const filteredPendingEnrollments = React.useMemo(() => {
    return pendingEnrollments.filter(e => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesStudent = e.studentName?.toLowerCase().includes(query);
        const matchesEmail = e.studentEmail?.toLowerCase().includes(query);
        const matchesCourse = e.courseTitle?.toLowerCase().includes(query);
        if (!matchesStudent && !matchesEmail && !matchesCourse) return false;
      }
      return true;
    });
  }, [pendingEnrollments, searchQuery]);

  const filteredActiveEnrollments = React.useMemo(() => {
    return activeEnrollments.filter(e => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesStudent = e.studentName?.toLowerCase().includes(query);
        const matchesEmail = e.studentEmail?.toLowerCase().includes(query);
        const matchesCourse = e.courseTitle?.toLowerCase().includes(query);
        if (!matchesStudent && !matchesEmail && !matchesCourse) return false;
      }
      return true;
    });
  }, [activeEnrollments, searchQuery]);

  const handleStatusUpdate = async (courseId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus === 'approved' ? 'approve and publish' : 'reject'} this course?`)) return;
    
    setProcessing(courseId);
    try {
      await api.put(`/admin/courses/${courseId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to update course status', err);
      alert('Failed to update course status');
    } finally {
      setProcessing(null);
    }
  };

  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [pendingRejectionId, setPendingRejectionId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleEnrollmentStatusUpdate = async (enrollmentId, newStatus, isRollback = false) => {
    if (newStatus === 'rejected' && !isRollback) {
      setPendingRejectionId(enrollmentId);
      setRejectionReason('');
      setRejectionModalOpen(true);
      return;
    }

    const actionText = newStatus === 'approved' || newStatus === 'active' ? 'approve' : 'revoke/rollback';
    if (!window.confirm(`Are you sure you want to ${actionText} this enrollment?`)) return;

    setProcessing(enrollmentId);
    try {
      if (newStatus === 'approved' || newStatus === 'active') {
        await api.post(`/admin/enrollments/${enrollmentId}/approve`);
      } else {
        await api.put(`/admin/enrollments/${enrollmentId}/status`, { status: 'rejected', reason: 'Revoked by admin' });
      }
      fetchData();
    } catch (err) {
      console.error('Failed to update enrollment status', err);
      alert('Failed to update enrollment status');
    } finally {
      setProcessing(null);
    }
  };

  const submitRejection = async () => {
    if (!pendingRejectionId) return;
    setProcessing(pendingRejectionId);
    try {
      await api.post(`/admin/enrollments/${pendingRejectionId}/reject`, {
        rejectionReason: rejectionReason.trim() || 'Rejected by admin'
      });
      setRejectionModalOpen(false);
      setPendingRejectionId(null);
      setRejectionReason('');
      fetchData();
    } catch (err) {
      console.error('Failed to reject enrollment', err);
      alert('Failed to reject enrollment');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="animate-in fade-in flex flex-col space-y-8 min-h-screen -mx-4 md:-mx-8 lg:-mx-12 -mt-4 md:-mt-8 p-6 md:p-8 font-sans"
    >
      {/* Premium Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 pt-2 mb-4 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
             <div className="p-2.5 bg-gradient-to-tr from-[#00D4FF]/20 to-[#2563EB]/20 rounded-2xl border border-[#00D4FF]/30">
               <ClipboardCheck className="w-8 h-8 text-[#00D4FF]" />
             </div>
             Approvals Management
          </h1>
          <p className={`text-sm mt-3 font-medium flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
             <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></span>
             Review courses and administer student enrollment placements.
          </p>
        </div>
      </div>

      {/* Main Glassmorphic Dashboard Panel */}
      <div className={`rounded-[2.5rem] p-8 border backdrop-blur-2xl shadow-2xl overflow-hidden relative transition-all duration-500 ${isDarkMode ? 'border-white/10 bg-[#0B1120]/80' : 'border-slate-200 bg-white/90 hover:border-[#2563EB]/30'}`}>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00D4FF]/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2563EB]/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>

        {/* Global Filter & Actions Panel */}
        <div className={`pb-6 border-b flex flex-wrap justify-between items-center gap-4 relative z-10 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          
          {/* Unified Search Input */}
          <div className="relative w-full sm:w-80 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] rounded-full opacity-0 group-hover:opacity-30 transition duration-300 blur-sm pointer-events-none"></div>
            <Search className={`w-[18px] h-[18px] absolute left-5 top-1/2 -translate-y-1/2 ml-0.5 z-10 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`} />
            <input 
              type="text"
              placeholder="Search approvals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full relative z-10 !pl-14 !pr-4 !py-3 border !rounded-full text-sm font-bold outline-none focus:ring-2 focus:ring-[#00D4FF]/50 transition-all shadow-sm placeholder-slate-400 ${isDarkMode ? 'bg-black/60 border-white/10 text-white hover:bg-black/80' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mt-3 sm:mt-0">
            {/* Category Filter Dropdown (Pending queue only) */}
            {activeTab === 'pending' && (courses.length > 0) && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`px-4 py-2.5 border rounded-full text-xs font-semibold focus:outline-none cursor-pointer transition-all ${
                  isDarkMode ? 'bg-black/60 border-white/10 text-slate-200 focus:border-[#00D4FF] hover:bg-black/80' : 'bg-white border-slate-200 text-slate-700 focus:border-[#00D4FF] hover:bg-slate-50'
                }`}
              >
                <option value="">All Categories</option>
                <option value="Social Science">Social Science</option>
                <option value="Mathematics & Natural Science">Math & Science</option>
                <option value="Natural Language">Natural Language</option>
                <option value="Programming & Technology">Tech & Programming</option>
                <option value="Business & Entrepreneurship">Business Hub</option>
                <option value="Personal Development">Personal Growth</option>
                <option value="General Overview">General Overview</option>
              </select>
            )}

            {/* View Mode Toggle - Circular highlight matching design */}
            <div className={`flex items-center gap-1.5 p-1 rounded-full border transition-colors ${isDarkMode ? 'bg-[#0F172A] border-white/10' : 'bg-[#F8FAFC] border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-full transition-all ${
                  viewMode === 'grid' 
                    ? (isDarkMode ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]' : 'bg-[#e0f7ff] text-[#0088cc] border border-[#00D4FF] shadow-sm') 
                    : 'text-slate-400 hover:text-slate-600 border border-transparent'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-2.5 rounded-full transition-all ${
                  viewMode === 'table' 
                    ? (isDarkMode ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]' : 'bg-[#e0f7ff] text-[#0088cc] border border-[#00D4FF] shadow-sm') 
                    : 'text-slate-400 hover:text-slate-600 border border-transparent'
                }`}
                title="Table List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Dynamic Counter Tabs */}
            <div className={`flex gap-1 p-1.5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <button 
                type="button"
                onClick={() => setActiveTab('pending')} 
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${activeTab === 'pending' ? 'bg-gradient-to-r from-[#2563EB] to-[#00D4FF] text-white shadow-[0_5px_15px_rgba(0,212,255,0.3)] scale-105' : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm'}`}
              >
                Pending Queue ({courses.length + pendingEnrollments.length})
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('active')} 
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${activeTab === 'active' ? 'bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white shadow-[0_5px_15px_rgba(0,212,255,0.3)] scale-105' : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm'}`}
              >
                Active Enrollments ({activeEnrollments.length})
              </button>
            </div>
          </div>
        </div>

        {/* Query Loading State */}
        {loading && courses.length === 0 && pendingEnrollments.length === 0 && activeEnrollments.length === 0 ? (
          <div className="flex justify-center items-center py-20 relative z-10">
            <div className="w-12 h-12 border-4 border-t-[#00D4FF] rounded-full animate-spin shadow-[0_0_15px_rgba(0,212,255,0.5)]"></div>
          </div>
        ) : activeTab === 'pending' && (courses.length === 0 && pendingEnrollments.length === 0) ? (
          /* Empty Pending State */
          <div className={`p-16 text-center rounded-[2.5rem] border shadow-2xl backdrop-blur-2xl flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 mt-6 ${isDarkMode ? 'border-white/10 bg-[#0B1120]/80' : 'border-slate-200 bg-white/90'}`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#00D4FF]/10 to-[#2563EB]/10 blur-[80px] rounded-full pointer-events-none mix-blend-screen"></div>
            <div className={`w-28 h-28 border rounded-[2rem] flex items-center justify-center mb-6 relative group border border-[#00D4FF]/30 text-[#00D4FF] shadow-[0_0_30px_rgba(0,212,255,0.15)] bg-gradient-to-tr from-[#00D4FF]/10 to-[#2563EB]/10`}>
              <ClipboardCheck className="w-12 h-12 drop-shadow-lg" />
            </div>
            <h3 className={`text-4xl font-display font-black tracking-tight mb-3 relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Queue Clear</h3>
            <p className={`max-w-sm mb-8 text-sm font-medium relative z-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>There are no pending course or enrollment approvals waiting for your review.</p>
          </div>
        ) : activeTab === 'active' && activeEnrollments.length === 0 ? (
          /* Empty Active State */
          <div className={`p-16 text-center rounded-[2.5rem] border shadow-2xl backdrop-blur-2xl flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 mt-6 ${isDarkMode ? 'border-white/10 bg-[#0B1120]/80' : 'border-slate-200 bg-white/90'}`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#2563EB]/10 to-[#00D4FF]/10 blur-[80px] rounded-full pointer-events-none mix-blend-screen"></div>
            <div className={`w-28 h-28 border rounded-[2rem] flex items-center justify-center mb-6 relative group border border-[#2563EB]/30 text-[#2563EB] shadow-[0_0_30px_rgba(37,99,235,0.15)] bg-gradient-to-tr from-[#2563EB]/10 to-[#00D4FF]/10`}>
              <BadgeInfo className="w-12 h-12 drop-shadow-lg" />
            </div>
            <h3 className={`text-4xl font-display font-black tracking-tight mb-3 relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No Active Enrollments</h3>
            <p className={`max-w-sm mb-8 text-sm font-medium relative z-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>There are currently zero active students in the system.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Mode - Horizontal 4 Columns (md:cols-2, lg:cols-3, xl:cols-4) */
          <div className="space-y-12 relative z-10 mt-6 animate-in fade-in duration-300">
            
            {/* PENDING QUEUE TAB CONTENT */}
            {activeTab === 'pending' && (
              <>
                {/* Courses section (Blue Brand Color theme) */}
                {courses.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#2563EB] to-blue-700" />
                      <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        Pending Course Approvals
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {filteredCourses.length}
                        </span>
                      </h3>
                    </div>

                    {filteredCourses.length === 0 ? (
                      <p className={`text-sm italic font-medium p-6 border border-dashed rounded-3xl text-center ${isDarkMode ? 'text-slate-400 border-white/10' : 'text-slate-500 border-slate-200'}`}>
                        No courses match your filter criteria.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                          {filteredCourses.map(c => {
                            const normalized = normalizeCategory(c.mainCategory || c.category);
                            const catInfo = CAT_COLORS[normalized] || DEFAULT_COLOR;
                            const IconComponent = CAT_ICONS[normalized] || BookOpen;
                            return (
                              <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={c.id} 
                                className={`rounded-3xl border shadow-lg hover:shadow-2xl overflow-hidden flex flex-col group transition-all duration-500 ${
                                  isDarkMode 
                                    ? 'border-blue-500/20 bg-[#0B1120]/60 hover:bg-[#0B1120] hover:border-blue-500 hover:shadow-[0_10px_30px_rgba(37,99,235,0.12)]' 
                                    : 'border-slate-200 bg-white hover:border-blue-500 hover:shadow-[0_10px_30px_rgba(37,99,235,0.08)]'
                                }`}
                              >
                                <div 
                                  className="w-full h-40 relative flex items-center justify-center overflow-hidden shrink-0 bg-[#030303]"
                                >
                                  {c.thumbnail && c.thumbnail !== 'default-course.jpg' ? (
                                    <img 
                                      src={c.thumbnail} 
                                      alt={c.title} 
                                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" 
                                    />
                                  ) : (
                                    <CourseFallbackThumbnail 
                                      color={catInfo.main} 
                                      darkColor={catInfo.dark || catInfo.main} 
                                      ribbon={c.mainCategory} 
                                      fallbackId={c.id} 
                                    />
                                  )}
                                  <div className="absolute top-3 right-3 z-20">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-normal text-white border border-white/40 bg-white/10 backdrop-blur-md">
                                      {(c.status || 'pending').toLowerCase()}
                                    </span>
                                  </div>
                                </div>

                                <div className={`flex flex-col flex-1 p-5 relative z-10 ${isDarkMode ? 'bg-[#0B1120]/90' : 'bg-white'}`}>
                                  <div className="flex-1">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-[#2563EB]">
                                      {c.mainCategory || 'General'}
                                    </span>
                                    <h3 className={`text-base font-black leading-snug break-words mb-2 mt-1 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                      {c.title}
                                    </h3>
                                    <div className={`flex flex-wrap gap-2 mb-3 text-[9px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                                       <span className={`px-2 py-0.5 rounded border ${isDarkMode ? 'border-white/5 bg-[#0B1120]/20' : 'border-slate-100 bg-slate-50'}`}>
                                         Inst: <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{c.instructor?.name || 'Unknown'}</span>
                                       </span>
                                    </div>
                                    <p className={`line-clamp-2 text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                      {c.description}
                                    </p>
                                  </div>
                                  <div className={`mt-4 pt-3 border-t flex flex-col gap-2.5 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                    <span className={`text-[9px] font-bold text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                      Submitted: {new Date(c.createdAt || c.updatedAt).toLocaleDateString()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button 
                                        disabled={processing === c.id}
                                        onClick={() => handleStatusUpdate(c.id, 'rejected')} 
                                        className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-transparent text-[#E30A17] font-black text-[11px] rounded-lg border border-[#E30A17]/30 hover:bg-[#E30A17]/10 transition-colors disabled:opacity-50"
                                      >
                                        Reject
                                      </button>
                                      <button 
                                        disabled={processing === c.id}
                                        onClick={() => handleStatusUpdate(c.id, 'approved')} 
                                        className={`flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[11px] rounded-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50`}
                                      >
                                        Approve
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}

                {/* Pending Enrollments Section (Cyan Brand Color theme) */}
                {pendingEnrollments.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#00D4FF] to-cyan-600" />
                      <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        Enrollment Requests
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-cyan-500/10 text-[#00D4FF] border-cyan-500/20">
                          {filteredPendingEnrollments.length}
                        </span>
                      </h3>
                    </div>

                    {filteredPendingEnrollments.length === 0 ? (
                      <p className={`text-sm italic font-medium p-6 border border-dashed rounded-3xl text-center ${isDarkMode ? 'text-slate-400 border-white/10' : 'text-slate-500 border-slate-200'}`}>
                        No requests match your filter criteria.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                          {filteredPendingEnrollments.map(en => {
                            const studentUser = { name: en.studentName, email: en.studentEmail, role: 'student', avatar: null };
                            return (
                              <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={en.id} 
                                className={`rounded-3xl border p-5 flex flex-col justify-between transition-all duration-500 group shadow-lg relative overflow-hidden ${
                                  isDarkMode 
                                    ? 'bg-[#0B1120] border-[#00D4FF]/20 hover:border-[#00D4FF] hover:shadow-[0_10px_30px_rgba(0,212,255,0.12)]' 
                                    : 'bg-white border-slate-200 hover:border-[#00D4FF] hover:shadow-[0_10px_30px_rgba(0,212,255,0.06)]'
                                }`}
                              >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D4FF]/5 rounded-full blur-[30px] pointer-events-none group-hover:bg-[#00D4FF]/10 transition-colors duration-500"></div>
                                
                                <div className="relative z-10 flex-1 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                      <h4 className={`font-black tracking-tight text-sm break-words line-clamp-1 group-hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {en.courseTitle}
                                      </h4>
                                      <span className={`text-[8px] font-black border px-1 py-0.5 rounded whitespace-nowrap ${isDarkMode ? 'text-slate-400 bg-[#0B1120]/5 border-white/5' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                                        ID: {en.id.slice(0, 4)}
                                      </span>
                                    </div>

                                    {/* Student Identity Block */}
                                    <div className="flex items-center gap-3 mb-4">
                                      <UserAvatar user={studentUser} className="w-8 h-8 border border-[#00D4FF]/30 shadow-sm" />
                                      <div className="min-w-0">
                                        <div className={`text-xs font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                          {en.studentName || 'System Unknown'}
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate font-semibold">
                                          {en.studentEmail || 'N/A'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className={`border p-2.5 rounded-2xl mb-4 flex flex-col gap-1 text-[11px] ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Submitted On</span>
                                      <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                        {new Date(en.requestedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2 relative z-10 mt-auto pt-2">
                                  <button
                                    disabled={processing === en.id}
                                    onClick={() => handleEnrollmentStatusUpdate(en.id, 'rejected')}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E30A17]/30 bg-transparent text-[#E30A17] text-[11px] font-black hover:bg-[#E30A17]/10 transition-colors disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    disabled={processing === en.id}
                                    onClick={() => handleEnrollmentStatusUpdate(en.id, 'active')}
                                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-[11px] font-black hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                                  >
                                    Ensure
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ACTIVE ENROLLMENTS TAB CONTENT (Cyan Brand Color theme) */}
            {activeTab === 'active' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#00D4FF] to-cyan-600" />
                  <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Active Authorized Enrollments
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-cyan-500/10 text-[#00D4FF] border-cyan-500/20">
                      {filteredActiveEnrollments.length}
                    </span>
                  </h3>
                </div>

                {filteredActiveEnrollments.length === 0 ? (
                  <p className={`text-sm italic font-medium p-6 border border-dashed rounded-3xl text-center ${isDarkMode ? 'text-slate-400 border-white/10' : 'text-slate-500 border-slate-200'}`}>
                    No active enrollments match your filter criteria.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                      {filteredActiveEnrollments.map(en => {
                        const studentUser = { name: en.studentName, email: en.studentEmail, role: 'student', avatar: null };
                        return (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={en.id} 
                            className={`rounded-3xl border p-5 flex flex-col justify-between transition-all duration-500 group shadow-lg relative overflow-hidden ${
                              isDarkMode 
                                ? 'bg-[#0B1120] border-[#00D4FF]/20 hover:border-[#00D4FF] hover:shadow-[0_10px_30px_rgba(0,212,255,0.12)]' 
                                : 'bg-white border-slate-200 hover:border-[#00D4FF] hover:shadow-[0_10px_30px_rgba(0,212,255,0.06)]'
                            }`}
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D4FF]/5 rounded-full blur-[30px] pointer-events-none group-hover:bg-[#00D4FF]/10 transition-colors duration-500"></div>
                            
                            <div className="relative z-10 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-3">
                                  <h4 className={`font-black tracking-tight text-sm break-words line-clamp-1 group-hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {en.courseTitle}
                                  </h4>
                                  <span className="text-[8px] font-black text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/30 px-1.5 py-0.5 rounded whitespace-nowrap">
                                    Active
                                  </span>
                                </div>

                                {/* Student Identity Block */}
                                <div className="flex items-center gap-3 mb-4">
                                  <UserAvatar user={studentUser} className="w-8 h-8 border border-[#00D4FF]/30 shadow-sm" />
                                  <div className="min-w-0">
                                    <div className={`text-xs font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                      {en.studentName || 'System Unknown'}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate font-semibold">
                                      {en.studentEmail || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className={`border p-2.5 rounded-2xl mb-4 flex flex-col gap-1 text-[11px] ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Verified On</span>
                                  <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                    {new Date(en.requestedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="relative z-10 mt-auto pt-2">
                              <button
                                disabled={processing === en.id}
                                onClick={() => handleEnrollmentStatusUpdate(en.id, 'rejected', true)}
                                className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border bg-transparent hover:text-[#E30A17] hover:border-[#E30A17]/30 text-[10px] font-black hover:bg-[#E30A17]/10 transition-all disabled:opacity-50 ${isDarkMode ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-600'}`}
                              >
                                <Undo2 className="w-3 h-3"/> Revoke Access / Rollback
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Table List View Mode - Using the two brand colors (Blue for courses, Cyan for enrollments) */
          <div className="overflow-x-auto relative z-10 custom-scrollbar pb-6 mt-6 animate-in fade-in duration-300">
            {activeTab === 'pending' ? (
              <div className="space-y-8">
                
                {/* Pending Courses Table (Blue Brand Accent) */}
                {courses.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-6 rounded-full bg-blue-600" />
                      <h3 className={`text-sm font-black uppercase tracking-wider text-slate-400`}>
                        Pending Course Approvals ({filteredCourses.length})
                      </h3>
                    </div>

                    {filteredCourses.length === 0 ? (
                      <p className={`text-sm italic font-medium p-4 border border-dashed rounded-2xl text-center ${isDarkMode ? 'text-slate-400 border-white/10' : 'text-slate-500 border-slate-200'}`}>
                        No courses match filters.
                      </p>
                    ) : (
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'bg-[#0B1120]/40 text-slate-400' : 'bg-slate-100/80 text-slate-500'} border-b ${isDarkMode ? 'border-blue-500/20' : 'border-blue-100'}`}>
                            <th className="px-6 py-4 rounded-tl-2xl">Course Details</th>
                            <th className="px-6 py-4">Instructor</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Submitted Date</th>
                            <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y text-sm font-bold ${isDarkMode ? 'divide-white/5 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                          {filteredCourses.map(c => {
                            const normalized = normalizeCategory(c.mainCategory || c.category);
                            const catInfo = CAT_COLORS[normalized] || DEFAULT_COLOR;
                            const IconComponent = CAT_ICONS[normalized] || BookOpen;
                            return (
                              <tr key={c.id} className={`transition-colors duration-300 ${isDarkMode ? 'hover:bg-blue-500/5' : 'hover:bg-blue-50/50'}`}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-8 rounded overflow-hidden shrink-0 relative bg-[#030303] flex items-center justify-center">
                                      {c.thumbnail && c.thumbnail !== 'default-course.jpg' ? (
                                        <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="absolute w-[260px] h-[220px] scale-[0.15] origin-center flex items-center justify-center">
                                          <CourseFallbackThumbnail 
                                            color={catInfo.main} 
                                            darkColor={catInfo.dark || catInfo.main} 
                                            ribbon={c.mainCategory} 
                                            fallbackId={c.id} 
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className={`font-black text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</div>
                                      <div className="text-xs text-slate-400 font-medium line-clamp-1">{c.description}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{c.instructor?.name || 'Unknown'}</td>
                                <td className="px-6 py-4">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {c.mainCategory || 'General'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                                  {new Date(c.createdAt || c.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button 
                                      disabled={processing === c.id}
                                      onClick={() => handleStatusUpdate(c.id, 'rejected')} 
                                      className="px-3 py-1.5 bg-transparent text-[#E30A17] font-black text-xs rounded-lg border border-[#E30A17]/30 hover:bg-[#E30A17]/10 transition-colors disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                    <button 
                                      disabled={processing === c.id}
                                      onClick={() => handleStatusUpdate(c.id, 'approved')} 
                                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs rounded-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                                    >
                                      Approve
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* Pending Enrollments Table (Cyan Brand Accent) */}
                {pendingEnrollments.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-6 rounded-full bg-[#00D4FF]" />
                      <h3 className={`text-sm font-black uppercase tracking-wider text-slate-400`}>
                        Pending Enrollment Requests ({filteredPendingEnrollments.length})
                      </h3>
                    </div>

                    {filteredPendingEnrollments.length === 0 ? (
                      <p className={`text-sm italic font-medium p-4 border border-dashed rounded-2xl text-center ${isDarkMode ? 'text-slate-400 border-white/10' : 'text-slate-500 border-slate-200'}`}>
                        No requests match filters.
                      </p>
                    ) : (
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'bg-[#0B1120]/40 text-slate-400' : 'bg-slate-100/80 text-slate-500'} border-b ${isDarkMode ? 'border-[#00D4FF]/30' : 'border-cyan-100'}`}>
                            <th className="px-6 py-4 rounded-tl-2xl">Student Identity</th>
                            <th className="px-6 py-4">Requested Course</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Submitted On</th>
                            <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y text-sm font-bold ${isDarkMode ? 'divide-white/5 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                          {filteredPendingEnrollments.map(en => {
                            const studentUser = { name: en.studentName, email: en.studentEmail, role: 'student', avatar: null };
                            return (
                              <tr key={en.id} className={`transition-colors duration-300 ${isDarkMode ? 'hover:bg-[#00D4FF]/5' : 'hover:bg-cyan-50/50'}`}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <UserAvatar user={studentUser} className="w-8 h-8 border border-[#00D4FF]/30 shadow-md" />
                                    <span className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{en.studentName || 'System Unknown'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{en.courseTitle}</td>
                                <td className="px-6 py-4 text-slate-400">{en.studentEmail || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                                  {new Date(en.requestedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button 
                                      disabled={processing === en.id}
                                      onClick={() => handleEnrollmentStatusUpdate(en.id, 'rejected')} 
                                      className="px-3 py-1.5 bg-transparent text-[#E30A17] font-black text-xs rounded-lg border border-[#E30A17]/30 hover:bg-[#E30A17]/10 transition-colors disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                    <button 
                                      disabled={processing === en.id}
                                      onClick={() => handleEnrollmentStatusUpdate(en.id, 'active')} 
                                      className="px-3 py-1.5 bg-gradient-to-r from-[#00D4FF] to-[#0099CC] text-white font-black text-xs rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
                                    >
                                      Ensure Access
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Active Enrollments Table (Cyan Brand Accent) */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#00D4FF] to-blue-500" />
                  <h3 className={`text-sm font-black uppercase tracking-wider text-slate-400`}>
                    Active Authorized Enrollments ({filteredActiveEnrollments.length})
                  </h3>
                </div>

                {filteredActiveEnrollments.length === 0 ? (
                  <p className={`text-sm italic font-medium p-4 border border-dashed rounded-2xl text-center ${isDarkMode ? 'text-slate-400 border-white/10' : 'text-slate-500 border-slate-200'}`}>
                    No active enrollments match filters.
                  </p>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'bg-[#0B1120]/40 text-slate-400' : 'bg-slate-100/80 text-slate-500'} border-b ${isDarkMode ? 'border-[#00D4FF]/30' : 'border-cyan-100'}`}>
                        <th className="px-6 py-4 rounded-tl-2xl">Student Identity</th>
                        <th className="px-6 py-4">Course Enrolled</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Verified On</th>
                        <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-sm font-bold ${isDarkMode ? 'divide-white/5 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                      {filteredActiveEnrollments.map(en => {
                        const studentUser = { name: en.studentName, email: en.studentEmail, role: 'student', avatar: null };
                        return (
                          <tr key={en.id} className={`transition-colors duration-300 ${isDarkMode ? 'hover:bg-[#00D4FF]/5' : 'hover:bg-cyan-50/50'}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <UserAvatar user={studentUser} className="w-8 h-8 border border-[#00D4FF]/30 shadow-md" />
                                <span className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{en.studentName || 'System Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-400">{en.courseTitle}</td>
                            <td className="px-6 py-4 text-slate-400">{en.studentEmail || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                              {new Date(en.requestedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                disabled={processing === en.id}
                                onClick={() => handleEnrollmentStatusUpdate(en.id, 'rejected', true)} 
                                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border bg-transparent hover:text-[#E30A17] hover:border-[#E30A17]/30 text-[10px] font-black hover:bg-[#E30A17]/10 transition-all disabled:opacity-50 ${isDarkMode ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-600'}`}
                              >
                                <Undo2 className="w-3 h-3" /> Revoke Access / Rollback
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rejection Reasons Modal Overlay */}
      <AnimatePresence>
        {rejectionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative overflow-hidden ${
                isDarkMode ? 'bg-[#0B1120] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E30A17]/5 rounded-full blur-[40px] pointer-events-none"></div>

              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#E30A17]" />
                  Reject Enrollment
                </h3>
                <button
                  onClick={() => {
                    setRejectionModalOpen(false);
                    setPendingRejectionId(null);
                    setRejectionReason('');
                  }}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isDarkMode ? 'border-white/10 hover:bg-white/5 text-slate-400 hover:text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <XSquare className="w-5 h-5" />
                </button>
              </div>

              <p className={`text-xs mb-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Please provide a clear reason for rejecting this student's enrollment request. The student will be notified and see this reason on their dashboard.
              </p>

              <div className="mb-6">
                <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Please verify your payment details or contact support."
                  rows={4}
                  className={`w-full p-4 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 transition-all resize-none ${
                    isDarkMode 
                      ? 'bg-black/40 border-white/10 text-white placeholder-slate-500 focus:border-[#00D4FF]' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00D4FF]'
                  }`}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectionModalOpen(false);
                    setPendingRejectionId(null);
                    setRejectionReason('');
                  }}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-black transition-colors ${
                    isDarkMode ? 'border-white/10 bg-transparent text-slate-300 hover:bg-white/5' : 'border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processing === pendingRejectionId}
                  onClick={submitRejection}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E30A17] to-[#B30006] text-white text-xs font-black hover:shadow-[0_0_20px_rgba(227,10,23,0.3)] transition-all disabled:opacity-50"
                >
                  {processing === pendingRejectionId ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
