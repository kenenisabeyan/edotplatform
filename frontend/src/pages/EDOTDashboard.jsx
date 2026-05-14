import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SupportDashboard from './SupportDashboard';
import { Navigate, useNavigate } from 'react-router-dom';
import StudentOverview from '../components/student/StudentOverview';
import AgendaCreationModal from '../components/AgendaCreationModal';
import AgendaWidget from '../components/AgendaWidget';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  CircleDollarSign,
  Briefcase,
  TrendingUp,
  Award,
  CheckCircle,
  MoreHorizontal,
  Mail,
  Calendar,
  Bell,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import useThemeMode from '../hooks/useThemeMode';

import { useQuery } from '@tanstack/react-query';

export default function EDOTDashboard() {
  const { user } = useAuth();
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const navigate = useNavigate();
  const isDarkMode = useThemeMode();

  const userRole = user?.role ? user.role.toLowerCase().trim() : 'student';
  void motion;

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['edotDashboardStats', userRole],
    queryFn: async () => {
      if (userRole === 'sponsor') return null;
      if (userRole === 'student') {
        const [{ data: enrolled }, { data: dashboard }] = await Promise.all([
          api.get('/courses/enrolled'),
          api.get('/users/dashboard-stats')
        ]);
        return { ...dashboard.data, enrolledCourses: enrolled.data || [] };
      }
      const { data } = await api.get(`/${userRole}/dashboard`);
      return data.data;
    },
    enabled: !!user
  });

  const { data: agendaEvents = [], refetch: refetchAgenda } = useQuery({
    queryKey: ['edotAgendaEvents'],
    queryFn: async () => {
      const { data } = await api.get('/calendar');
      return Array.isArray(data.data) ? data.data : [];
    },
    enabled: !!user
  });

  const loading = loadingStats && userRole !== 'sponsor';

  const SmartCard = ({ title, value, icon: Icon }) => {
    let glowClass = 'hover:shadow-[0_0_25px_rgba(0,212,255,0.2)]'; // Cyan glow for admin
    if (userRole === 'admin') {
      glowClass = 'hover:shadow-[0_0_25px_rgba(0,212,255,0.2)]'; // Cyan glow
    } else if (userRole === 'instructor') {
      glowClass = 'hover:shadow-[0_0_25px_rgba(249,115,22,0.2)]'; // Orange glow
    } else if (userRole === 'student') {
      glowClass = 'hover:shadow-[0_0_25px_rgba(249,115,22,0.2)]'; // Orange glow
    } else if (userRole === 'parent') {
      glowClass = 'hover:shadow-[0_0_25px_rgba(0,212,255,0.2)]'; // Cyan glow
    }

    return (
      <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        <Card hover={false} className={`rounded-2xl p-6 border backdrop-blur-xl flex flex-col justify-between group relative overflow-hidden transition-all duration-300 ${glowClass} ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${isDarkMode ? 'bg-[#0B1120]/10 border-white/20 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
              {Icon && <Icon className="w-5 h-5" />}
            </div>
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>{title}</h3>
          </div>
          <div>
            <h2 className={`text-2xl md:text-3xl font-bold max-w-[90%] truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</h2>
          </div>
        </Card>
      </motion.div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`backdrop-blur-xl p-4 rounded-xl border relative shadow-2xl ${isDarkMode ? 'bg-[#0B1120]/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
          <p className={`font-bold mb-3 text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{label}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <span className={`w-3 h-3 rounded-full border ${isDarkMode ? 'border-white/20' : 'border-slate-300'}`} style={{ backgroundColor: entry.color }}></span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{entry.name}:</span>
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const deleteAgenda = async (agendaId) => {
    try {
      await api.delete(`/calendar/${agendaId}`);
      refetchAgenda();
    } catch (err) {
      console.error('Failed to delete agenda event', err);
    }
  };

  const onAgendaCreated = (evt) => {
    refetchAgenda();
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return typeof value === 'string' ? value : '$0';
    return `$${value.toLocaleString()}`;
  };

  const monthlyRevenueSeries = Array.isArray(stats?.monthlyRevenue) ? stats.monthlyRevenue : [];
  const currentMonthRevenue = typeof stats?.finance?.monthlyIncome === 'number'
    ? stats.finance.monthlyIncome
    : monthlyRevenueSeries.length
      ? monthlyRevenueSeries[monthlyRevenueSeries.length - 1].revenue
      : stats?.finance?.totalRevenue ?? 0;
  const patternPerformanceData = monthlyRevenueSeries.map((item) => ({
    name: item.name,
    revenue: item.revenue || 0,
    students: Math.max(0, Math.round((item.revenue || 0) / 25)),
    courses: Math.max(0, Math.round((item.revenue || 0) / 180))
  }));

  let headerConfig = {};
  let statsConfig = [];
  let gaugeConfig = {};
  let areaConfig = {};
  let widgetConfig = {};

  if (userRole === 'admin') {
    headerConfig = {
      gradient: 'bg-gradient-to-r from-[#020b1f] via-[#0f48b9] to-[#00d4ff]',
      title: 'Welcome back, Admin Kenenisa Beyan 👋',
      subtitle: 'Here’s what’s happening with your platform today.'
    };
    statsConfig = [
      { title: 'Total Courses', value: stats?.totalCourses ?? 0, icon: BookOpen },
      { title: 'Active Students', value: stats?.totalStudents ?? 0, icon: Users },
      { title: 'Instructors', value: stats?.totalInstructors ?? 0, icon: Briefcase },
      { title: 'Pending Approvals', value: stats?.pendingCourses ?? 0, icon: Award },
      { title: 'Revenue (This Month)', value: formatCurrency(currentMonthRevenue), icon: CircleDollarSign }
    ];
    areaConfig = {
      title: 'Platform Performance',
      data: patternPerformanceData.length ? patternPerformanceData : [
         { name: 'Jan', revenue: 1200, students: 420, courses: 28 },
         { name: 'Feb', revenue: 1500, students: 510, courses: 32 },
         { name: 'Mar', revenue: 1080, students: 380, courses: 24 },
         { name: 'Apr', revenue: 1720, students: 620, courses: 38 },
         { name: 'May', revenue: 1980, students: 740, courses: 44 },
         { name: 'Jun', revenue: 1640, students: 560, courses: 36 }
      ],
      lines: [
        { key: 'courses', name: 'Courses', color: '#00D4FF' },
        { key: 'students', name: 'Students', color: '#10B981' },
        { key: 'revenue', name: 'Revenue', color: '#F97316' }
      ]
    };
    widgetConfig = {
      type: 'activity',
      title: 'Recent Activities',
      subtitle: 'Live platform feed',
    };
  } else if (userRole === 'instructor') {
    headerConfig = {
      gradient: 'bg-gradient-to-r from-[#020b1f] via-[#0f48b9] to-[#00d4ff]',
      title: 'Hello, Instructor Kenenisa! 🎓',
      subtitle: ''
    };
    statsConfig = [
      { title: 'Total Courses Created', value: stats?.totalCourses || 9, icon: BookOpen },
      { title: 'Active Classes', value: stats?.activeCourses || 8, icon: Briefcase },
      { title: 'Students Enrolled', value: stats?.totalStudents || 15, icon: Users },
      { title: 'Teaching Activity Score', value: '95%', icon: TrendingUp },
    ];
    gaugeConfig = {
      title: 'Course Health Score',
      valStr: '100%\nHEALTHY',
      valNum: 100,
      ringColor: '#00D4FF' // Cyan accent from Home/About
    };
    areaConfig = {
      title: 'Student Engagement Insights',
      data: [
         { name: 'Jan', value1: 20, value2: 10, value3: 30 }, { name: 'Feb', value1: 40, value2: 30, value3: 45 }, { name: 'Mar', value1: 35, value2: 25, value3: 60 }, { name: 'Apr', value1: 80, value2: 50, value3: 70 }, { name: 'May', value1: 60, value2: 80, value3: 90 }, { name: 'Aug', value1: 90, value2: 60, value3: 100 }
      ],
      lines: [{ key: 'value1', name: 'Math 101', color: '#00D4FF' }, { key: 'value2', name: 'History 202', color: '#F97316' }, { key: 'value3', name: 'Bio 303', color: '#E30A17' }]
    };
    widgetConfig = {
      type: 'agenda',
      title: 'Agenda',
      subtitle: 'Upcoming teaching events',
      items: [
        { label: 'Class', title: 'conceptual card', desc: 'Event', badge: 'Apr 2', color: '#00D4FF' }
      ]
    };
  } else if (userRole === 'student') {
    headerConfig = {
      gradient: 'bg-gradient-to-r from-[#020b1f] via-[#0f48b9] to-[#00d4ff]',
      title: 'Welcome back, kenokana beyan! 💡\nReady to learn?',
      subtitle: ''
    };
    statsConfig = [
      { title: 'Enrolled Courses', value: stats?.totalEnrolled || 0, icon: BookOpen },
      { title: 'Average Progress', value: `${stats?.averageProgress || 0}%`, icon: TrendingUp },
      { title: 'Completed Lessons', value: stats?.completedLessons || 0, icon: CheckCircle },
      { title: 'Certificates', value: stats?.completedCourses || 0, icon: Award },
    ];
    gaugeConfig = {
      title: 'Academic Progress Ring',
      valStr: '0%\nPROGRESS',
      valNum: 0,
      ringColor: '#F97316' // Orange accent for student
    };
    areaConfig = {
      title: 'Weekly Study Goal',
      data: [ { name: 'Jan', value1: 0 }, { name: 'Feb', value1: 0 }, { name: 'Mar', value1: 0 }, { name: 'Apr', value1: 0 }, { name: 'May', value1: 0 }, { name: 'Aug', value1: 0 } ],
      lines: [{ key: 'value1', name: 'Study Progress', color: '#F97316' }]
    };
    widgetConfig = {
      type: 'claim',
      title: 'Certificates Claim',
      action: 'Claim Certificate'
    };
  } else {
    headerConfig = {
      gradient: 'bg-gradient-to-r from-[#020b1f] via-[#0f48b9] to-[#00d4ff]',
      title: 'Welcome, Family Guardian! 🛡️\nHeart-centered follow-up for student success.',
      subtitle: ''
    };
    statsConfig = [
      { title: 'Students Monitored', value: stats?.totalLearners || 1, icon: Users },
      { title: 'Average Attendance', value: '100%', icon: BookOpen },
      { title: 'Growth Milestone', value: '1', icon: TrendingUp },
      { title: 'Support Tickets', value: '0', icon: Mail },
    ];
    gaugeConfig = {
      title: 'Family Growth Circle',
      valStr: '100%\nGrowth',
      valNum: 100,
      ringColor: '#00D4FF' // Cyan for parent
    };
    areaConfig = {
      title: 'Milestone Timeline',
      data: [
         { name: 'Jan', value1: 0, value2: 0 }, { name: 'Feb', value1: 40, value2: 30 }, { name: 'Mar', value1: 40, value2: 35 }, { name: 'Apr', value1: 85, value2: 60 }, { name: 'May', value1: 65, value2: 60 }, { name: 'Aug', value1: 95, value2: 100 }
      ],
      lines: [{ key: 'value1', name: 'Growth', color: '#00D4FF' }, { key: 'value2', name: 'Progress', color: '#F97316' }]
    };
    widgetConfig = {
      type: 'communication',
      title: 'Communication',
      action: 'Message Instructor'
    };
  }

  const topCourseRankings = stats?.topCourses || [];
  const recentActivities = stats?.recentActivity?.slice(0, 5) || [];
  const notifications = stats?.notifications?.slice(0, 5) || [];
  const events = stats?.events?.slice(0, 4) || [];
  const studentEngagement = stats?.studentEngagement || {};
  const instructorPerformance = stats?.instructorPerformance?.slice(0, 3) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (userRole === 'sponsor') {
    return <Navigate to="/dashboard/sponsor" replace />;
  }

  const dashboardAction = (tab) => {
    if (tab === 'certificates') {
      navigate('/dashboard/certificates');
      return;
    }
    if (tab === 'courses' || tab === 'catalog') {
      navigate('/dashboard/courses');
      return;
    }
    if (tab === 'overview') {
      navigate('/dashboard');
      return;
    }
    navigate('/dashboard');
  };

  if (userRole === 'student') {
    const enrolledCourses = stats?.enrolledCourses || [];
    const completedCourses = enrolledCourses.filter(c => c.progress === 100 || c.status === 'completed' || c.completed === true);
    
    const userCertificates = stats?.certificates || [];
    const claimedCourseIds = new Set(userCertificates.map(c => c.courseId));
    
    const readyToClaimCertificates = completedCourses.filter(enrolled => {
      const courseId = enrolled.course?.id || enrolled.courseId;
      const isPassed = !enrolled.course?.isExamRequired || enrolled.passedFinalExam;
      return !claimedCourseIds.has(courseId) && isPassed;
    });

    const certificateEarnedCount = userCertificates.length;
    const readyToClaimCount = readyToClaimCertificates.length;
    const totalCertificateProgress = certificateEarnedCount + readyToClaimCount;

    let totalProgress = 0;
    let totalLessonsCompleted = 0;
    enrolledCourses.forEach(e => {
        totalProgress += (e.progress || 0);
        const lessons = e.completedLessons ? (Array.isArray(e.completedLessons) ? e.completedLessons : [e.completedLessons]) : [];
        totalLessonsCompleted += lessons.length;
    });
    const averageProgress = enrolledCourses.length > 0 ? Math.round(totalProgress / enrolledCourses.length) : 0;

    return <StudentOverview 
      user={user}
      enrolledCourses={enrolledCourses} 
      completedCourses={completedCourses}
      totalEnrolled={enrolledCourses.length}
      totalLessonsCompleted={totalLessonsCompleted}
      averageProgress={averageProgress}
      isDarkMode={isDarkMode}
      setActiveTab={dashboardAction}
      dashboardStats={stats}
      certificateSummary={{
        claimed: certificateEarnedCount,
        readyToClaim: readyToClaimCount,
        total: totalCertificateProgress
      }}
    />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-[1600px] mx-auto pb-10"
    >
      {/* 1. Welcome Banner (Heritage Glow) */}
      <div className={`rounded-2xl p-8 border relative overflow-hidden backdrop-blur-xl ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
        {/* Heritage Mesh Glow placed completely underneath text */}
        <div className={`absolute inset-0 opacity-10 pointer-events-none ${headerConfig.gradient}`}></div>
        <div className="relative z-10">
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {headerConfig.title}
          </h1>
          {headerConfig.subtitle && (
            <p className={`text-sm font-normal ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>{headerConfig.subtitle}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <div className={`rounded-2xl p-4 border ${isDarkMode ? 'bg-[#0B1120]/10 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-2">Platform Status</p>
              <p className="text-lg font-semibold">Healthy</p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>System operations are running smoothly.</p>
            </div>
            <div className={`rounded-2xl p-4 border ${isDarkMode ? 'bg-[#0B1120]/10 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-2">Active Now</p>
              <p className="text-2xl font-semibold">{stats?.dailyActiveUsers ?? 0}</p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>users currently active on platform</p>
            </div>
          </div>

          <div className="mt-5">
            {userRole === 'admin' && (
              <button 
                onClick={() => setIsAgendaModalOpen(true)}
                className="px-4 py-2 rounded-lg border border-[#00D4FF] text-[#00D4FF] font-semibold hover:bg-[#00D4FF]/20 shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all"
              >
                + Broadcast Notice
              </button>
            )}
            {userRole === 'instructor' && (
              <button 
                onClick={() => navigate('/dashboard/builder')}
                className="px-4 py-2 rounded-lg border border-[#F97316] text-[#F97316] font-semibold hover:bg-[#F97316]/20 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
              >
                + Create New Course
              </button>
            )}
            {userRole === 'student' && (
              <button 
                onClick={() => navigate('/dashboard/courses')}
                className="px-4 py-2 rounded-lg border border-[#F97316] text-[#F97316] font-semibold hover:bg-[#F97316]/10 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
              >
                + Start a Lesson
              </button>
            )}
            {userRole === 'parent' && (
              <button 
                onClick={() => navigate('/dashboard/messages')}
                className="px-4 py-2 rounded-lg border border-[#00D4FF] text-[#00D4FF] font-semibold hover:bg-[#00D4FF]/20 shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all"
              >
                ✉️ Message Instructor
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Stats Grid (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {statsConfig.map((stat, i) => (
          <SmartCard key={i} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      {/* 3. Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Widget: Essential Activities Gauges */}
        <Card hover={false} className={`lg:col-span-3 rounded-2xl p-6 border backdrop-blur-xl shadow-lg flex flex-col relative min-h-[350px] ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-semibold text-sm mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Essential Activities</h3>
          
          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Student Engagement */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isDarkMode ? '#0B1120' : '#E2E8F0'}
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray={`${Math.round((stats?.dailyActiveUsers ?? 0) / (stats?.totalStudents ?? 1) * 100)}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {Math.round((stats?.dailyActiveUsers ?? 0) / (stats?.totalStudents ?? 1) * 100)}%
                  </span>
                </div>
              </div>
              <p className={`text-xs text-center font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Student Engagement</p>
            </div>

            {/* Course Completion */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isDarkMode ? '#0B1120' : '#E2E8F0'}
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray={`${stats?.courseCompletionRate ?? 0}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {stats?.courseCompletionRate ?? 0}%
                  </span>
                </div>
              </div>
              <p className={`text-xs text-center font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Course Completion</p>
            </div>

            {/* Learning Activity */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isDarkMode ? '#0B1120' : '#E2E8F0'}
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray={`${Math.min(100, (stats?.studentEngagement?.lessonsCompleted ?? 0) / 10 * 100)}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {Math.min(100, Math.round((stats?.studentEngagement?.lessonsCompleted ?? 0) / 10 * 100))}%
                  </span>
                </div>
              </div>
              <p className={`text-xs text-center font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Learning Activity</p>
            </div>

            {/* Community Activity */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={isDarkMode ? '#0B1120' : '#E2E8F0'}
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    strokeDasharray={`${Math.min(100, (stats?.recentActivity?.length ?? 0) * 10)}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {Math.min(100, (stats?.recentActivity?.length ?? 0) * 10)}%
                  </span>
                </div>
              </div>
              <p className={`text-xs text-center font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Community Activity</p>
            </div>
          </div>
        </Card>

        {/* Right Widget: Line/Area Chart */}
        <Card hover={false} className={`lg:col-span-5 rounded-2xl p-6 border backdrop-blur-xl shadow-lg flex flex-col min-h-[350px] ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{areaConfig.title}</h3>
            <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded ${isDarkMode ? 'text-slate-200 bg-[#0B1120]/5' : 'text-slate-600 bg-slate-100'}`}>
              Recharts <MoreHorizontal className="w-3 h-3" />
            </div>
          </div>
          
          <div className={`flex items-center justify-center gap-6 text-[11px] font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
             {areaConfig.lines.map((line, i) => (
               <span key={i} className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line.color }}></div> 
                 {line.name}
               </span>
             ))}
          </div>

          <div className="flex-1 w-full relative min-h-[220px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaConfig.data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    {areaConfig.lines.map((line, i) => (
                      <linearGradient key={i} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={line.color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={line.color} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  {areaConfig.lines.map((line, i) => (
                    <Area key={i} type="monotone" dataKey={line.key} stroke={line.color} strokeWidth={2.5} fillOpacity={1} fill={`url(#color${i})`} activeDot={{ r: 5, fill: line.color, stroke: '#fff', strokeWidth: 2 }} />
                  ))}
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </Card>

         {/* Right Side Block: Top Courses for Admin, alternative widgets for others */}
         {userRole === 'admin' ? (
           <Card hover={false} className={`lg:col-span-4 rounded-2xl p-6 border backdrop-blur-xl shadow-lg ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'}`}>
             <div className="flex items-start justify-between gap-4 mb-6">
               <div>
                 <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Top Courses</h3>
                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>This month’s best performers</p>
               </div>
               <span className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{topCourseRankings.length} items</span>
             </div>
             <div className="space-y-4">
               {topCourseRankings.length ? topCourseRankings.map((course, index) => (
                 <div key={course.id || index} className={`rounded-3xl p-4 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                   <div className="flex items-center justify-between gap-3">
                     <div>
                       <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{course.title || course.name || 'Untitled course'}</p>
                       <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{course.enrollments ?? 0} students</p>
                     </div>
                     <div className="text-right">
                       <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{course.completionRate ?? 0}%</p>
                       <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>completion</p>
                     </div>
                   </div>
                   <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                     <div className="h-full rounded-full bg-[#00D4FF]" style={{ width: `${course.completionRate ?? 0}%` }} />
                   </div>
                 </div>
               )) : (
                 <div className={`rounded-2xl p-6 text-center ${isDarkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                   No top course data available yet.
                 </div>
               )}
             </div>
           </Card>
         ) : (
           <div className="lg:col-span-3 h-full">
             {widgetConfig.type === 'agenda' && (
               <AgendaWidget 
                 events={agendaEvents} 
                 userRole={userRole} 
                 isAdmin={userRole === 'admin'} 
                 onDelete={deleteAgenda} 
                 onCreateClick={() => setIsAgendaModalOpen(true)} 
               />
             )}

             {widgetConfig.type === 'claim' && (
               <Card hover={false} className={`rounded-2xl p-6 border backdrop-blur-xl shadow-lg flex flex-col min-h-[350px] ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'}`}>
                 <div className="flex justify-between items-start mb-6">
                   <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{widgetConfig.title}</h3>
                   <MoreHorizontal className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`} />
                 </div>
                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                   <div className="w-32 h-32 mb-6 opacity-80">
                     <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <rect x="20" y="25" width="40" height="50" rx="4" fill="#E2E8F0" />
                       <rect x="30" y="15" width="45" height="55" rx="4" fill="#CBD5E1" />
                       <rect x="40" y="20" width="50" height="60" rx="4" fill="#F8FAFC" />
                       <circle cx="65" cy="50" r="12" fill="#F97316" />
                       <circle cx="65" cy="50" r="9" fill="#FDE047" />
                       <circle cx="65" cy="50" r="6" fill="#FEF08A" />
                       <path d="M57 60 L61 75 L65 70 L69 75 L73 60" fill="#F97316" />
                     </svg>
                   </div>
                   <button 
                     onClick={() => navigate('/dashboard/certificates')}
                     className="w-full py-3 bg-[#F97316] hover:bg-[#F97316] text-[#0B1120] font-bold rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                   >
                     {widgetConfig.action}
                   </button>
                 </div>
               </Card>
             )}

             {widgetConfig.type === 'communication' && (
               <Card hover={false} className={`rounded-2xl p-6 border backdrop-blur-xl shadow-lg flex flex-col min-h-[350px] ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'}`}>
                 <div className="flex justify-between items-start mb-6">
                   <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{widgetConfig.title}</h3>
                   <MoreHorizontal className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`} />
                 </div>
                 <div className="flex-1 flex flex-col items-center justify-center text-center">
                   <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#F97316]/20 flex items-center justify-center border border-[#F97316]/30">
                     <Mail className="w-10 h-10 text-[#F97316]" />
                   </div>
                   <button 
                     onClick={() => navigate('/dashboard/messages')}
                     className="w-full py-3 border-2 border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-[#0B1120] font-bold rounded-xl transition-all text-sm shadow-[inset_0_0_15px_rgba(255,215,0,0.1)]"
                   >
                     {widgetConfig.action}
                   </button>
                 </div>
               </Card>
             )}
           </div>
         )}

      </div>

      {userRole === 'admin' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <Card hover={false} className={`xl:col-span-3 rounded-2xl p-6 border backdrop-blur-xl shadow-lg ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Recent Activities</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Live platform feed</p>
              </div>
              <span className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{recentActivities.length} activities</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentActivities.length ? recentActivities.map((activity, index) => (
                <div key={activity.id || index} className={`rounded-xl p-3 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activity.type === 'user_joined' ? 'bg-green-100 text-green-700' : activity.type === 'course_published' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {activity.type === 'user_joined' ? '👤' : activity.type === 'course_published' ? '📚' : '⚡'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activity.title}</p>
                      <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{activity.itemTitle || activity.studentName}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className={`rounded-xl p-6 text-center ${isDarkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                  No recent activities.
                </div>
              )}
            </div>
          </Card>

          <Card hover={false} className={`xl:col-span-3 rounded-2xl p-6 border backdrop-blur-xl shadow-lg ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Instructor Performance</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Top teaching metrics</p>
              </div>
              <span className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{instructorPerformance.length} instructors</span>
            </div>
            <div className="space-y-4">
              {instructorPerformance.length ? instructorPerformance.map((inst) => (
                <div key={inst.id} className={`rounded-2xl p-4 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{inst.name}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{inst.coursesTaught ?? 0} courses · {inst.studentCount ?? 0} students</p>
                    </div>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{inst.performanceScore ?? 0}%</span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Completion</span><span>{inst.completionRate ?? 0}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Attendance</span><span>{inst.attendanceRate ?? 0}%</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className={`rounded-2xl p-6 text-center ${isDarkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                  No instructor data yet.
                </div>
              )}
            </div>
          </Card>

          <Card hover={false} className={`xl:col-span-3 rounded-2xl p-6 border backdrop-blur-xl shadow-lg ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Student Engagement</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Learning activity trends</p>
              </div>
              <span className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>This Week</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className={`rounded-2xl p-4 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs text-slate-500">Active Students</p>
                <p className={`mt-2 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{studentEngagement.activeStudents ?? 0}</p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{studentEngagement.activeStudentsChange ?? '+0%'}</p>
              </div>
              <div className={`rounded-2xl p-4 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs text-slate-500">Lessons Completed</p>
                <p className={`mt-2 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{studentEngagement.lessonsCompleted ?? 0}</p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cumulative study progress</p>
              </div>
              <div className={`rounded-2xl p-4 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs text-slate-500">Study Hours</p>
                <p className={`mt-2 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{studentEngagement.studyHours ?? 0}</p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hours this month</p>
              </div>
            </div>
          </Card>

          <Card hover={false} className={`xl:col-span-3 rounded-2xl p-6 border backdrop-blur-xl shadow-lg ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Quick Actions</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Fast access for admins</p>
              </div>
              <Bell className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
            </div>
            <div className="grid gap-3">
              <button onClick={() => navigate('/dashboard/builder')} className="w-full rounded-2xl border border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0EA5E9] py-3 font-semibold">Create Course</button>
              <button onClick={() => navigate('/dashboard/approvals')} className="w-full rounded-2xl border border-[#34D399] bg-[#34D399]/10 text-[#065F46] py-3 font-semibold">Approve Course</button>
              <button onClick={() => navigate('/dashboard/users')} className="w-full rounded-2xl border border-[#F97316] bg-[#F97316]/10 text-[#92400E] py-3 font-semibold">Add Instructor</button>
              <button onClick={() => navigate('/dashboard/notice')} className="w-full rounded-2xl border border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#5B21B6] py-3 font-semibold">Broadcast Message</button>
            </div>
            <div className="mt-6">
              <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>System Notifications</h4>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((note, idx) => (
                  <div key={`quick-note-${idx}`} className={`rounded-2xl p-3 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{note.title || note.message || 'Notification'}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{note.time || note.date || note.createdAt || 'Recent update'}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {userRole === 'admin' && events.length > 0 && (
        <Card hover={false} className={`rounded-2xl p-6 border backdrop-blur-xl shadow-lg ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Upcoming Events</h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Scheduled platform activities</p>
            </div>
            <span className={`text-xs font-semibold uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{events.length} events</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map((event, index) => (
              <div key={event.id || index} className={`rounded-2xl p-4 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-[#0B1120]/10 border-white/20' : 'bg-slate-100 border-slate-200'} border`}>
                    <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{event.title || 'Event'}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                </div>
                {event.description && (
                  <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} line-clamp-2`}>{event.description}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <AgendaCreationModal
        isOpen={isAgendaModalOpen}
        onClose={() => setIsAgendaModalOpen(false)}
        onAgendaCreated={(evt) => { onAgendaCreated(evt); setIsAgendaModalOpen(false); }}
      />
    </motion.div>
  );
}
