import React, { useEffect, useState, useCallback } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Users, Layers, Radio, PlusCircle, Edit3, Settings, LogOut, 
  FolderOpen, LayoutDashboard, Clock, CheckCircle2, 
  AlertCircle, XSquare, PlayCircle, Send, Search, Bell, Activity, Video, Star,
  Globe, Calculator, BookOpen, Rocket, Target, UserCheck
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/jpw8g8m6spazsktyizdw';
import ActivityFeed from '../components/ActivityFeed';
import CustomDropdown from '../components/CustomDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { courseDropdownOptions } from '../constants/courseCategories';
import ProfileView from './ProfileView';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import PremiumModal from '../components/PremiumModal';
import CourseFallbackThumbnail from '../components/CourseFallbackThumbnail';

const CATEGORY_MAP = {
  "Social Science": {
    color: "#F97316", // Orange
    gradient: "from-orange-500/20 to-orange-600/10",
    bannerGradient: "from-orange-500 to-red-600",
    badgeBg: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(249,115,22,0.15)] hover:border-orange-500/40",
    buttonHover: "hover:bg-orange-500 hover:text-white hover:border-orange-500",
    icon: Globe
  },
  "Mathematics & Natural Science": {
    color: "#3B82F6", // Blue
    gradient: "from-blue-500/20 to-blue-600/10",
    bannerGradient: "from-blue-600 to-indigo-700",
    badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(59,130,246,0.15)] hover:border-blue-500/40",
    buttonHover: "hover:bg-blue-500 hover:text-white hover:border-blue-500",
    icon: Calculator
  },
  "Natural Language": {
    color: "#A855F7", // Purple
    gradient: "from-purple-500/20 to-purple-600/10",
    bannerGradient: "from-purple-600 to-pink-700",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(168,85,247,0.15)] hover:border-purple-500/40",
    buttonHover: "hover:bg-purple-500 hover:text-white hover:border-purple-500",
    icon: BookOpen
  },
  "Programming & Technology": {
    color: "#6366F1", // Indigo
    gradient: "from-indigo-500/20 to-indigo-600/10",
    bannerGradient: "from-indigo-600 to-violet-700",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(99,102,241,0.15)] hover:border-indigo-500/40",
    buttonHover: "hover:bg-indigo-500 hover:text-white hover:border-indigo-500",
    icon: Rocket
  },
  "Business & Entrepreneurship": {
    color: "#FFD700", // Gold
    gradient: "from-amber-400/20 to-amber-600/10",
    bannerGradient: "from-amber-400 to-amber-600",
    badgeBg: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(255,215,0,0.15)] hover:border-amber-400/40",
    buttonHover: "hover:bg-[#FFD700] hover:text-slate-900 hover:border-[#FFD700]",
    icon: Target
  },
  "Personal Development": {
    color: "#22C55E", // Green
    gradient: "from-emerald-500/20 to-emerald-600/10",
    bannerGradient: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(34,197,94,0.15)] hover:border-emerald-500/40",
    buttonHover: "hover:bg-emerald-500 hover:text-slate-900 hover:border-emerald-500",
    icon: UserCheck
  }
};

const DEFAULT_CAT = {
  color: "#94A3B8",
  gradient: "from-slate-500/20 to-slate-600/10",
  bannerGradient: "from-slate-600 to-slate-800",
  badgeBg: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  hoverGlow: "hover:shadow-[0_15px_30px_rgba(148,163,184,0.15)] hover:border-slate-500/40",
  buttonHover: "hover:bg-slate-500 hover:text-white hover:border-slate-500",
  icon: FolderOpen
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

export default function InstructorDashboard() {
  const isDarkMode = useThemeMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Social Science', duration: 1, thumbnail: '' });
  const [activeTab, setActiveTab] = useState('overview');
  
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [lessonData, setLessonData] = useState({ title: '', description: '', videoUrl: '', duration: 10 });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['instructorStats'],
    queryFn: async () => { const { data } = await api.get('/instructor/dashboard'); return data.data; }
  });

  const { data: analytics } = useQuery({
    queryKey: ['instructorAnalytics'],
    queryFn: async () => { const { data } = await api.get('/instructor/analytics/detailed'); return data.data; }
  });

  const { data: courses = [], refetch: fetchCourses } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: async () => { const { data } = await api.get('/instructor/courses'); return data.data || []; }
  });

  const loading = loadingStats;

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const submissionData = { ...formData };
      if (!submissionData.thumbnail) {
        submissionData.thumbnail = 'default-course.jpg';
      }
      
      await api.post('/instructor/courses', submissionData);
      setFormData({ title: '', description: '', category: 'Programming', duration: 1, thumbnail: '' });
      fetchCourses();
      setActiveTab('courses'); // Redirect to courses list after creation
    } catch (err) {
      console.error('Failed to create course', err);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!activeCourseId) return;
    
    try {
      await api.post(`/instructor/courses/${activeCourseId}/lessons`, lessonData);
      setLessonData({ title: '', description: '', videoUrl: '', duration: 10 });
      setActiveCourseId(null);
      fetchCourses();
    } catch (err) {
      console.error('Failed to add lesson', err);
    }
  };

  const handleSubmitReview = async (courseId) => {
    try {
      await api.put(`/instructor/courses/${courseId}/submit`);
      fetchCourses();
    } catch (err) {
      console.error('Failed to submit for review', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  void stats;
  const { totalStudents, activeCourses } = React.useMemo(() => ({
    totalStudents: courses.reduce((acc, course) => acc + (course.totalStudents || 0), 0),
    activeCourses: courses.filter(c => c.status === 'approved').length
  }), [courses]);

  const renderContent = () => {

    switch (activeTab) {
      case 'overview': {
        const revenueData = React.useMemo(() => analytics?.revenueData || [], [analytics]);
        const engagementData = React.useMemo(() => analytics?.engagementData || [], [analytics]);

        return (
          <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-none mx-auto w-full">
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <div>
                <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Activity className="w-8 h-8 text-[#00D4FF]" />
                  Instructor Overview
                  {loading && <div className={`w-5 h-5 border-2 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'} ml-3`}></div>}
                </h1>
                <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Comprehensive summary of your teaching activities and student engagements.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {/* Total Students Card */}
              <div className={`border rounded-[24px] glass-panel p-6 shadow-lg hover:-translate-y-1 hover:border-white/10 transition-all duration-300 flex flex-col items-center text-center gap-3 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                {/* Icon (centered top) */}
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center bg-transparent relative z-10 ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <Users className="w-6 h-6" />
                </div>
                {/* Content (centered) */}
                <div className="flex flex-col items-center relative z-10 w-full">
                  <span className="text-sm font-medium text-gray-500 mb-1.5">Total Students</span>
                  <h3 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalStudents}</h3>
                </div>
              </div>

              {/* Active Courses Card */}
              <div className={`border rounded-[24px] glass-panel p-6 shadow-lg hover:-translate-y-1 hover:border-white/10 transition-all duration-300 flex flex-col items-center text-center gap-3 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                {/* Icon (centered top) */}
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center bg-transparent relative z-10 ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <Radio className="w-6 h-6" />
                </div>
                {/* Content (centered) */}
                <div className="flex flex-col items-center relative z-10 w-full">
                  <span className="text-sm font-medium text-gray-500 mb-1.5">Active Courses</span>
                  <h3 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeCourses}</h3>
                </div>
              </div>

              {/* Total Creations Card */}
              <div className={`border rounded-[24px] glass-panel p-6 shadow-lg hover:-translate-y-1 hover:border-white/10 transition-all duration-300 flex flex-col items-center text-center gap-3 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                {/* Icon (centered top) */}
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center bg-transparent relative z-10 ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  <Layers className="w-6 h-6" />
                </div>
                {/* Content (centered) */}
                <div className="flex flex-col items-center relative z-10 w-full">
                  <span className="text-sm font-medium text-gray-500 mb-1.5">Total Creations</span>
                  <h3 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{courses.length}</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <div className={`border rounded-[24px] glass-panel p-6 shadow-lg flex flex-col ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <h3 className={`font-medium text-[13px] mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Earnings (Last 6 Months)</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData} margin={{ top: 5, right: 0, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} tickFormatter={(value) => `$${value}`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0B1120', color: '#fff', fontWeight: 'bold' }}
                        formatter={(value) => [`$${value}`, 'Earnings']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{r: 4, fill: '#38bdf8'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`border rounded-[24px] glass-panel p-6 shadow-lg flex flex-col ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <h3 className={`font-medium text-[13px] mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Student Engagement</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementData} margin={{ top: 5, right: 0, bottom: 0, left: -25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#0B1120', color: '#fff', fontWeight: 'bold' }}
                        cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                      />
                      <Bar dataKey="students" fill="#00D4FF" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className={`mt-8 backdrop-blur-xl p-8 rounded-[24px] glass-panel border shadow-2xl relative overflow-hidden ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D4FF]/5 rounded-bl-full -z-10"></div>
               <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                 Recent Activity
               </h3>
               <ActivityFeed isAdmin={false} limit={5} />
            </div>
          </div>
        );
      }
      case 'courses':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className={`text-2xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                My Courses
                {loading && <div className={`w-5 h-5 border-2 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>}
              </h2>
              <button 
                onClick={() => navigate('/instructor/builder')} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white font-black   text-[11px] rounded-xl hover:-translate-y-0.5 transition-transform shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                <PlusCircle className="w-4 h-4" /> Create Course
              </button>
            </div>
            
            {courses.length === 0 ? (
               <div className={`p-12 text-center rounded-[24px] glass-panel border-2 border-dashed shadow-lg flex flex-col items-center justify-center ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-[#0B1120]/5 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
                   <FolderOpen className="w-10 h-10" />
                 </div>
                 <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No courses created</h3>
                 <p className={`max-w-sm mb-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Share your knowledge with the world by creating your first complete course.</p>
                 <button 
                  onClick={() => navigate('/instructor/builder')} 
                  className="px-8 py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white font-black   text-xs rounded-xl hover:-translate-y-0.5 transition-transform shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                 >
                   Start Creating
                 </button>
               </div>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {courses.map(c => {
                     const normalized = normalizeCategory(c.mainCategory || c.category);
                     const catInfo = CATEGORY_MAP[normalized] || DEFAULT_CAT;
                     const IconComponent = catInfo.icon;
                     
                     // Calculate display time
                     const totalMins = c.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0;
                     const hasLessons = Array.isArray(c.lessons) && c.lessons.length > 0;
                     const displayTime = hasLessons && totalMins > 0 
                       ? (totalMins >= 60 ? `${Math.floor(totalMins/60)}h ${totalMins%60}m` : `${totalMins}m`) 
                       : `${c.duration || 0}h`;

                     // Stable ratings based on course ID
                     const ratingSeed = (c.id.charCodeAt(0) + c.id.charCodeAt(c.id.length - 1)) % 10;
                     const courseRating = (4.5 + (ratingSeed / 20)).toFixed(1);
                     const reviewsSeed = (c.id.charCodeAt(1) + c.id.charCodeAt(c.id.length - 2)) * 3 % 200 + 40;
                     const contrastTextColor = catInfo.color === "#FFD700" ? "#0F172A" : "#FFFFFF";

                     return (
                        <motion.div 
                          whileHover={{ y: -8 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          key={c.id} 
                          className={`rounded-[32px] border shadow-2xl flex flex-col group transition-all duration-300 h-full relative overflow-hidden ${
                            isDarkMode 
                              ? `border-white/5 bg-[#0B1120]/80 ${catInfo.hoverGlow}` 
                              : `border-slate-200/60 bg-white ${catInfo.hoverGlow}`
                          }`}
                          style={{
                            '--cat-color': catInfo.color,
                            borderTop: `6px solid ${catInfo.color}`
                          }}
                        >
                          {/* Thumbnail Wrapper */}
                          <div className="p-4 pb-0 shrink-0">
                            <div className="w-full h-[200px] relative overflow-hidden bg-slate-900 flex items-center justify-center rounded-2xl">
                               {c.thumbnail && c.thumbnail !== 'default-course.jpg' ? (
                                 <img 
                                   src={c.thumbnail} 
                                   alt={c.title} 
                                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                 />
                               ) : (
                                 <CourseFallbackThumbnail 
                                   color={catInfo.color} 
                                   darkColor={catInfo.color} 
                                   ribbon={c.mainCategory} 
                                   fallbackId={c.id} 
                                 />
                               )}

                               {/* Status Badge in lowercase pill border shape */}
                               <div className="absolute top-4 right-4 z-20">
                                 <span 
                                   className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border"
                                   style={{ backgroundColor: catInfo.color, color: contrastTextColor, borderColor: 'transparent' }}
                                 >
                                   {(c.status || 'draft').toLowerCase()}
                                 </span>
                               </div>
                            </div>
                          </div>

                         {/* Card Content */}
                         <div className="p-6 flex flex-col flex-1">
                           {/* Title */}
                           <h4 className="text-lg font-bold font-display leading-snug line-clamp-2 mb-2 transition-colors duration-300"
                             style={{ color: catInfo.color }}
                           >
                             {c.title}
                           </h4>

                           {/* Info Row (styled as solid pills in category colors) */}
                           <div className="flex flex-wrap items-center gap-2.5 mb-4">
                             {/* Duration */}
                             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors shadow-sm"
                               style={{
                                 backgroundColor: catInfo.color,
                                 borderColor: catInfo.color,
                                 color: contrastTextColor
                               }}
                             >
                               <Clock className="w-3.5 h-3.5 opacity-90" />
                               {displayTime}
                             </span>
                             
                             {/* Lessons Badge */}
                             <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-300 shadow-sm"
                               style={{
                                 backgroundColor: catInfo.color,
                                 borderColor: catInfo.color,
                                 color: contrastTextColor,
                               }}
                             >
                               <PlayCircle className="w-3.5 h-3.5" />
                               {c.lessons?.length || 0} Lessons
                             </span>
                             
                             {/* Students Badge */}
                             <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-300 shadow-sm"
                               style={{
                                 backgroundColor: catInfo.color,
                                 borderColor: catInfo.color,
                                 color: contrastTextColor,
                               }}
                             >
                               <Users className="w-3.5 h-3.5" />
                               {c.totalStudents || 0} Students
                             </span>
                           </div>

                            {/* Course Creator/Instructor Row */}
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                {c.instructor && c.instructor.avatar && c.instructor.avatar !== 'default-avatar.png' ? (
                                  <img 
                                    src={c.instructor.avatar.startsWith('http') ? c.instructor.avatar : `http://localhost:5000${c.instructor.avatar.startsWith('/') ? '' : '/'}${c.instructor.avatar}`} 
                                    alt={c.instructor.name || 'Instructor'} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center w-full h-full">
                                  {c.instructor?.name ? c.instructor.name.charAt(0) : '?'}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Instructor</p>
                                <p className={`text-[13px] font-bold truncate leading-snug ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{c.instructor?.name || 'EDOT Creator'}</p>
                              </div>
                            </div>

                           {/* Level and Rating Row */}
                           <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 mt-auto mb-6">
                             <span className="text-xs font-bold px-3 py-1.5 rounded-full border transition-all shadow-sm"
                               style={{
                                 backgroundColor: catInfo.color,
                                 borderColor: catInfo.color,
                                 color: contrastTextColor
                               }}
                             >
                               {c.level || 'Beginner'}
                             </span>
                             <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                               <Star className="w-3.5 h-3.5 fill-current" />
                               <span>{courseRating}</span>
                               <span className="text-slate-400 dark:text-slate-500 font-semibold">({reviewsSeed})</span>
                             </div>
                           </div>

                           {/* Action Buttons */}
                           <div className="flex flex-col gap-2.5">
                             {(c.status === 'draft' || c.status === 'rejected') && (
                               <>
                                 <button 
                                   onClick={() => navigate('/instructor/builder/' + c.id)} 
                                   className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 font-bold rounded-2xl border transition-all duration-300 text-xs ${
                                     isDarkMode 
                                       ? 'bg-white/5 text-white border-white/10' 
                                       : 'bg-slate-50 text-slate-800 border-slate-200'
                                   } ${catInfo.buttonHover}`}
                                 >
                                   <PlusCircle className="w-3.5 h-3.5" /> Add Lesson
                                 </button>
                                 <button 
                                   onClick={() => handleSubmitReview(c.id)} 
                                   className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-2xl hover:shadow-[0_6px_20px_rgba(16,185,129,0.3)] transition-all text-xs"
                                 >
                                   <Send className="w-3.5 h-3.5" /> Submit for Review
                                 </button>
                               </>
                             )}
                             
                             {c.status === 'approved' && (
                               <span className="w-full inline-flex items-center justify-center gap-2 text-[#00D4FF] text-xs font-bold bg-[#00D4FF]/10 py-3 rounded-2xl border border-[#00D4FF]/20">
                                 <CheckCircle2 className="w-3.5 h-3.5" /> Live for Students
                               </span>
                             )}
                             
                             {c.status === 'pending' && (
                               <span className="w-full inline-flex items-center justify-center gap-2 text-[#00D4FF] text-xs font-bold bg-[#00D4FF]/10 py-3 rounded-2xl border border-[#00D4FF]/20">
                                 <Clock className="w-3.5 h-3.5" /> Pending Review
                               </span>
                             )}
                           </div>
                         </div>
                       </motion.div>
                     );
                   })}
                 </div>
            )}
          </div>
        );
      case 'create':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
            <h2 className={`text-2xl font-display font-black mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Create Curriculum
              {loading && <div className={`w-5 h-5 border-2 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>}
            </h2>
            <div className={`p-6 md:p-8 rounded-[24px] glass-panel border shadow-lg relative overflow-hidden ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D4FF] opacity-[0.02] rounded-full blur-3xl pointer-events-none"></div>
              
              <form onSubmit={handleCreateCourse} className="space-y-6 relative z-10">
                
                <div>
                  <label className="block text-[10px] font-black   text-[#00D4FF] mb-2">Subject Matter Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                    className={`w-full px-6 py-4 bg-[#0B1120] font-bold border rounded-xl focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent outline-none transition-all placeholder:text-slate-300 ${isDarkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`} 
                    placeholder="E.g., Advanced JavaScript Patterns" 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black   text-[#00D4FF] mb-2">Detailed Framework <span className="text-red-500">*</span></label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    required 
                    className={`w-full !px-6 py-4 bg-[#0B1120] font-medium border !rounded-[32px] focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent outline-none transition-all resize-y placeholder:text-slate-300 ${isDarkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`} 
                    rows="5" 
                    placeholder="Provide a comprehensive operational framework for this module."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black   text-[#00D4FF] mb-2">Primary Domain</label>
                    <CustomDropdown
                      value={formData.category}
                      onChange={(val) => setFormData({...formData, category: val})}
                      options={courseDropdownOptions}
                      className="w-full bg-[#0B1120]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black   text-[#00D4FF] mb-2">Time to Mastery (Hours) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      min="1" 
                      value={formData.duration} 
                      onChange={e => setFormData({...formData, duration: Number(e.target.value)})} 
                      required 
                      className={`w-full px-6 py-4 bg-[#0B1120] font-bold border rounded-xl focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent outline-none transition-all ${isDarkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black   text-[#00D4FF] mb-2">Visual Asset Node (URL)</label>
                  <input 
                    type="url" 
                    value={formData.thumbnail} 
                    onChange={e => setFormData({...formData, thumbnail: e.target.value})} 
                    className={`w-full px-6 py-4 bg-[#0B1120] font-medium border rounded-xl focus:ring-2 focus:ring-[#00D4FF] focus:border-transparent outline-none transition-all placeholder:text-slate-300 ${isDarkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`} 
                    placeholder="https://content-node.cloud/thumbnail.jpg" 
                  />
                  <p className={`mt-2 text-xs font-bold flex items-center gap-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    <AlertCircle className="w-4 h-4 text-[#00D4FF]" /> Will fallback to system default if empty.
                  </p>
                </div>

                <div className={`pt-8 border-t flex flex-col sm:flex-row gap-4 justify-end ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                   <button 
                    type="button" 
                    onClick={() => setActiveTab('courses')} 
                    className={`px-8 py-3.5 bg-transparent font-black text-[11px] rounded-xl border hover:bg-white/5/5 hover:text-white transition-all order-2 sm:order-1 ${isDarkMode ? 'text-slate-200 border-white/10' : 'text-slate-600 border-slate-200'}`}
                   >
                     Abort Setup
                   </button>
                   <button 
                    type="submit" 
                    className={`px-8 py-3.5 font-semibold rounded-full hover:-translate-y-0.5 transition-transform order-1 sm:order-2 bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                   >
                     Initialize Protocol
                   </button>
                </div>
              </form>
            </div>
          </div>
        );
      case 'settings':
        return <ProfileView />;
      default:
        return null;
    }
  };

  const navItemClass = (tabName) => `
    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm text-left
    ${activeTab === tabName 
      ? 'bg-[#0B1120] text-white shadow-sm' 
      : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white'
    }
  `;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#FAFAFA]'} flex flex-col md:flex-row font-sans ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>


      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-none w-full relative">
          
          {/* Top Header mapped from image requirements */}
          <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 w-full">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Global Search (Students, Courses, Messages)..." 
                className={`w-full !pl-10 !pr-20 !py-2.5 border !rounded-full-full text-xs outline-none focus:ring-1 focus:ring-white/10 transition-all font-medium placeholder:text-slate-500 shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
              <div className={`absolute right-2 top-1/2 -translate-y-1/2 bg-[#1A1E26] text-[9px] px-2 py-1 rounded font-bold border ${isDarkMode ? 'text-slate-400 border-white/5' : 'text-slate-500 border-slate-100'}`}>
                CTRL + K
              </div>
            </div>
            
            <div className="flex items-center gap-6 w-full sm:w-auto justify-end">
              <div className="relative cursor-pointer hover:bg-white/5 p-2 rounded-full transition-colors">
                <Bell className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                <span className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#E30A17] rounded-full border-2 border-[#0B1120] text-[7px] flex items-center justify-center font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>1</span>
              </div>
              
              <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-white/5 transition-colors">
                 <div className="w-9 h-9 rounded-full bg-white text-white font-black flex items-center justify-center shadow-sm">
                   {user?.name?.charAt(0) || 'I'}
                 </div>
                 <div className="text-left hidden sm:block">
                   <div className={`text-sm font-bold leading-none mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Instructor'}</div>
                   <div className={`text-[11px] font-medium leading-none capitalize ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user?.role || 'Instructor'}</div>
                 </div>
              </div>
            </div>
          </header>

          {renderContent()}
        </div>
      </main>

      {/* Add Lesson Modal Overlays */}
      <PremiumModal isOpen={!!activeCourseId} onClose={() => setActiveCourseId(null)} maxWidth="max-w-xl">
                 <div className="flex flex-col w-full h-full p-6 md:p-8">
             {/* Brand Background Decorative Elements */}
             <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#00D4FF]/10 to-transparent pointer-events-none z-0"></div>
             <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/20 blur-[80px] pointer-events-none z-0"></div>
             <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/20 blur-[80px] pointer-events-none z-0"></div>

            <div className={`flex justify-between items-center p-8 border-b relative z-10 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <PlayCircle className="w-6 h-6 text-[#00D4FF]" />
                Compile Module Entry
              </h2>
              <button 
                onClick={() => setActiveCourseId(null)} 
                className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5/10 hover:text-white transition-colors ${isDarkMode ? 'bg-[#0B1120]/5 text-slate-200' : 'bg-slate-50 text-slate-600'}`}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddLesson} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black   text-[#00D4FF] mb-2">Module Designation <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={lessonData.title} 
                  onChange={e => setLessonData({...lessonData, title: e.target.value})} 
                  required 
                  className={`w-full !px-6 !py-4 font-bold border !rounded-full focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all placeholder:text-slate-300 ${isDarkMode ? 'bg-[#0B1120] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                  placeholder="E.g., Quantum Algorithm Analysis" 
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black   text-[#00D4FF] mb-2">Execution Protocol <span className="text-red-500">*</span></label>
                <textarea 
                  value={lessonData.description} 
                  onChange={e => setLessonData({...lessonData, description: e.target.value})} 
                  required 
                  className={`w-full !px-6 !py-4 font-medium border !rounded-[32px] focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all resize-none placeholder:text-slate-300 ${isDarkMode ? 'bg-[#0B1120] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                  rows="3" 
                  placeholder="Define operational expectations for this sector."
                ></textarea>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-black   text-[#00D4FF] mb-2">Media Origin Vector <span className="text-red-500">*</span></label>
                  <input 
                    type="url" 
                    value={lessonData.videoUrl} 
                    onChange={e => setLessonData({...lessonData, videoUrl: e.target.value})} 
                    required 
                    className={`w-full !px-6 !py-4 font-bold border !rounded-full focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all placeholder:text-slate-300 ${isDarkMode ? 'bg-[#0B1120] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                    placeholder="WSS:// or HTTP://" 
                  />
                </div>
                <div className="w-full sm:w-32 shrink-0">
                  <label className="block text-[10px] font-black   text-[#00D4FF] mb-2">Cycle (m) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    min="1" 
                    value={lessonData.duration} 
                    onChange={e => setLessonData({...lessonData, duration: Number(e.target.value)})} 
                    required 
                    className={`w-full !px-6 !py-4 font-black border !rounded-full focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all text-center ${isDarkMode ? 'bg-[#0B1120] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                  />
                </div>
              </div>
              
              <div className={`pt-8 border-t flex gap-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                <button 
                  type="button" 
                  onClick={() => setActiveCourseId(null)}
                  className={`flex-1 py-4 px-6 bg-transparent font-black text-[11px] !rounded-full border hover:bg-white/5/5 hover:text-white transition-all shadow-sm ${isDarkMode ? 'text-slate-200 border-white/10' : 'text-slate-600 border-slate-200'}`}
                >
                  Terminate
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-4 px-6 font-semibold rounded-full border hover:-translate-y-0.5 transition-transform bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border-[#00D4FF] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  Compile Node
                </button>
              </div>
            </form>
                 </div>
      </PremiumModal>
    </div>
  );
}
