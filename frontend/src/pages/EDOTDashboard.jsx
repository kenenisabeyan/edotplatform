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
  const [showRechartsMenu, setShowRechartsMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [clearedNotifications, setClearedNotifications] = useState(false);
  const navigate = useNavigate();
  const isDarkMode = useThemeMode();

  const userRole = user?.role ? user.role.toLowerCase().trim() : 'student';
  void motion;

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['edotDashboardStats', userRole],
    queryFn: async () => {
      if (userRole === 'sponsor') {
        const { data } = await api.get('/sponsor/dashboard');
        return data;
      }
      if (userRole === 'student') {
        const { data } = await api.get('/student/dashboard');
        const payload = data.data || {};
        return {
           profile: payload.profile || {},
           enrolledCourses: payload.enrollments || [],
           overview: payload.stats || {},
           progress: payload.progress || { percentile: 0 },
           recentCourses: payload.recentCourses || [],
           study: payload.weeklyStudy || {},
           certificates: payload.certificates || [],
           achievements: payload.achievements || [],
           sidebarCounts: payload.sidebarCounts || { messages: 0, certificates: 0, notices: 0 }
        };
      }
      if (userRole === 'admin') {
        const { data } = await api.get('/dashboard/stats');
        return data.data;
      }
      const { data } = await api.get(`/${userRole}/dashboard`);
      return data.data;
    },
    enabled: !!user,
    refetchInterval: 30000
  });

  const { data: agendaEvents = [], refetch: refetchAgenda } = useQuery({
    queryKey: ['edotAgendaEvents'],
    queryFn: async () => {
      const { data } = await api.get('/calendar');
      return Array.isArray(data.data) ? data.data : [];
    },
    enabled: !!user,
    refetchInterval: 30000
  });

  const { data: sectionsData = [] } = useQuery({
    queryKey: ['dashboardSections'],
    queryFn: async () => {
      const { data } = await api.get('/sections');
      return data.data || [];
    },
    enabled: userRole === 'admin'
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

  const monthlyRevenueSeries = Array.isArray(stats?.analytics?.revenueData) ? stats.analytics.revenueData : (Array.isArray(stats?.monthlyRevenue) ? stats.monthlyRevenue : []);
  const currentMonthRevenue = typeof stats?.dashboardStats?.totalRevenue === 'number'
    ? stats.dashboardStats.totalRevenue
    : stats?.finance?.totalRevenue ?? 0;
  const patternPerformanceData = monthlyRevenueSeries.map((item) => ({
    name: item.name,
    revenue: item.revenue || 0,
    students: item.students || 0,
    courses: item.courses || 0
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
      { title: 'Total Courses', value: stats?.dashboardStats?.totalCourses ?? stats?.totalCourses ?? 0, icon: BookOpen },
      { title: 'Active Students', value: stats?.dashboardStats?.totalStudents ?? stats?.totalStudents ?? 0, icon: Users },
      { title: 'Instructors', value: stats?.dashboardStats?.totalInstructors ?? stats?.totalInstructors ?? 0, icon: Briefcase },
      { title: 'Pending Approvals', value: stats?.dashboardStats?.pendingApprovals ?? stats?.pendingCourses ?? 0, icon: Award },
      { title: 'Total Revenue', value: formatCurrency(currentMonthRevenue), icon: CircleDollarSign }
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
        { key: 'revenue', name: 'Revenue', color: '#00D4FF' }
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
      title: 'Hello, Instructor! 🎓',
      subtitle: ''
    };
    statsConfig = [
      { title: 'Total Courses Created', value: stats?.totalCourses || 0, icon: BookOpen },
      { title: 'Active Classes', value: stats?.activeCourses || 0, icon: Briefcase },
      { title: 'Students Enrolled', value: stats?.totalStudents || 0, icon: Users },
      { title: 'Total Lessons', value: stats?.totalLessons || 0, icon: TrendingUp },
    ];
    gaugeConfig = {
      title: 'Active Course Ratio',
      valStr: `${stats?.totalCourses ? Math.round((stats.activeCourses/stats.totalCourses)*100) : 0}%\nACTIVE`,
      valNum: stats?.totalCourses ? Math.round((stats.activeCourses/stats.totalCourses)*100) : 0,
      ringColor: '#00D4FF'
    };
    
    const instructorLines = [];
    if (stats?.courseNames?.[0]) instructorLines.push({ key: 'value1', name: stats.courseNames[0], color: '#00D4FF' });
    if (stats?.courseNames?.[1]) instructorLines.push({ key: 'value2', name: stats.courseNames[1], color: '#00D4FF' });
    if (stats?.courseNames?.[2]) instructorLines.push({ key: 'value3', name: stats.courseNames[2], color: '#E30A17' });

    areaConfig = {
      title: 'Student Engagement Insights',
      data: stats?.studentPerformanceData || [],
      lines: instructorLines.length ? instructorLines : [{ key: 'value1', name: 'No Data', color: '#00D4FF' }]
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
      title: 'Welcome back! 💡\nReady to learn?',
      subtitle: ''
    };
    statsConfig = [
      { title: 'Enrolled Courses', value: stats?.enrolledCourses?.length || 0, icon: BookOpen },
      { title: 'Average Progress', value: `${stats?.percentile || 0}%`, icon: TrendingUp },
      { title: 'Days Studied', value: stats?.daysStudied || 0, icon: CheckCircle },
      { title: 'Certificates', value: stats?.certificates?.length || 0, icon: Award },
    ];
    gaugeConfig = {
      title: 'Academic Progress Ring',
      valStr: `${stats?.percentile || 0}%\nPROGRESS`,
      valNum: stats?.percentile || 0,
      ringColor: '#00D4FF'
    };
    areaConfig = {
      title: 'Weekly Study Goal',
      data: stats?.weeklyStudyData || [],
      lines: [{ key: 'hours', name: 'Study Hours', color: '#00D4FF' }]
    };
    widgetConfig = {
      type: 'claim',
      title: 'Certificates Claim',
      action: 'Claim Certificate'
    };
  } else if (userRole === 'sponsor') {
    headerConfig = {
      gradient: 'bg-gradient-to-r from-[#020b1f] via-[#0f48b9] to-[#00d4ff]',
      title: 'Welcome, Sponsor! 🌟\nEmpowering education for everyone.',
      subtitle: ''
    };
    statsConfig = [
      { title: 'Total Contributions', value: `$${stats?.stats?.totalContributions || 0}`, icon: CircleDollarSign },
      { title: 'Supported Students', value: stats?.stats?.supportedStudents || 0, icon: Users },
      { title: 'Courses Completed', value: stats?.humanImpact?.coursesCompleted || 0, icon: CheckCircle },
      { title: 'Active Cycles', value: stats?.stats?.activeSupportCycles || 0, icon: BookOpen },
    ];
    gaugeConfig = {
      title: 'Human Impact Index',
      valStr: `${stats?.stats?.supportedStudents ? '100' : '0'}%\nIMPACT`,
      valNum: stats?.stats?.supportedStudents ? 100 : 0,
      ringColor: '#F59E0B'
    };
    areaConfig = {
      title: 'Sponsorship Timeline',
      data: stats?.recentImpact?.map(r => ({ name: new Date(r.createdAt).toLocaleDateString(), impact: 1 })) || [],
      lines: [{ key: 'impact', name: 'Impact Instances', color: '#F59E0B' }]
    };
    widgetConfig = {
      type: 'communication',
      title: 'Communication',
      action: 'Message Student'
    };
  } else {
    headerConfig = {
      gradient: 'bg-gradient-to-r from-[#020b1f] via-[#0f48b9] to-[#00d4ff]',
      title: 'Welcome, Family Guardian! 🛡️\nHeart-centered follow-up for student success.',
      subtitle: ''
    };
    statsConfig = [
      { title: 'Students Monitored', value: stats?.totalLearners || 0, icon: Users },
      { title: 'Total Enrolled Courses', value: stats?.totalEnrolledCourses || 0, icon: BookOpen },
      { title: 'Completed Lessons', value: stats?.completedLessons || 0, icon: TrendingUp },
      { title: 'Average Progress', value: `${stats?.averageProgress || 0}%`, icon: CheckCircle },
    ];
    gaugeConfig = {
      title: 'Family Growth Circle',
      valStr: `${stats?.averageProgress || 0}%\nGrowth`,
      valNum: stats?.averageProgress || 0,
      ringColor: '#00D4FF'
    };
    areaConfig = {
      title: 'Milestone Timeline',
      data: stats?.performanceTimeline || [],
      lines: [{ key: 'progress', name: 'Growth', color: '#00D4FF' }, { key: 'target', name: 'Target', color: '#00D4FF' }]
    };
    widgetConfig = {
      type: 'communication',
      title: 'Communication',
      action: 'Message Instructor'
    };
  }

  const topCourseRankings = Array.isArray(stats?.topCourses) ? stats.topCourses : [];
  const recentActivities = Array.isArray(stats?.recentActivities) ? stats.recentActivities.slice(0, 5) : (Array.isArray(stats?.recentActivity) ? stats.recentActivity.slice(0, 5) : []);
  const notifications = clearedNotifications ? [] : (Array.isArray(stats?.notifications) ? stats.notifications.slice(0, 5) : []);
  const events = Array.isArray(stats?.events) ? stats.events.slice(0, 4) : [];
  const studentEngagement = stats?.engagement?.studentEngagement || stats?.studentEngagement || {};
  const instructorPerformanceRaw = stats?.engagement?.instructorPerformance || stats?.instructorPerformance;
  const instructorPerformance = Array.isArray(instructorPerformanceRaw) ? instructorPerformanceRaw.slice(0, 3) : [];

  let gauge1 = 0, gauge2 = 0, gauge3 = 0, gauge4 = 0;
  if (userRole === 'admin') {
     gauge1 = Math.min(100, Math.round(((stats?.engagement?.studentEngagement?.activeStudents ?? stats?.dailyActiveUsers ?? 0) / (stats?.dashboardStats?.totalStudents ?? stats?.totalStudents ?? 1)) * 100));
     gauge2 = Math.round(stats?.engagement?.courseCompletionRate ?? stats?.courseCompletionRate ?? 0);
     gauge3 = Math.min(100, Math.round(((stats?.engagement?.studentEngagement?.lessonsCompleted ?? stats?.studentEngagement?.lessonsCompleted ?? 0) / 20) * 100));
     gauge4 = Math.min(100, (stats?.engagement?.communityActivity ?? stats?.recentActivities?.length ?? stats?.recentActivity?.length ?? 0) * 5);
  } else if (userRole === 'instructor') {
     gauge1 = stats?.totalStudents ? 100 : 0;
     gauge2 = stats?.totalCourses ? Math.round((stats.activeCourses/stats.totalCourses)*100) : 0;
     gauge3 = stats?.totalLessons ? Math.min(100, stats.totalLessons * 5) : 0;
     gauge4 = 100;
  } else if (userRole === 'student') {
     gauge1 = stats?.daysStudied ? Math.min(100, Math.round((stats.daysStudied / 7) * 100)) : 0;
     gauge2 = stats?.percentile || 0;
     gauge3 = stats?.enrolledCourses?.length ? Math.min(100, stats.enrolledCourses.length * 20) : 0;
     gauge4 = stats?.certificates?.length ? 100 : (stats?.achievements?.length ? 50 : 0);
  } else if (userRole === 'parent') {
     gauge1 = stats?.totalLearners ? 100 : 0;
     gauge2 = stats?.averageProgress || 0;
     gauge3 = stats?.completedLessons ? Math.min(100, stats.completedLessons * 10) : 0;
     gauge4 = stats?.recentActivity?.length ? Math.min(100, stats.recentActivity.length * 20) : 0;
  } else if (userRole === 'sponsor') {
     gauge1 = stats?.stats?.supportedStudents ? 100 : 0;
     gauge2 = stats?.humanImpact?.coursesCompleted ? Math.min(100, stats.humanImpact.coursesCompleted * 10) : 0;
     gauge3 = stats?.stats?.activeSupportCycles ? 100 : 0;
     gauge4 = stats?.recentImpact?.length ? Math.min(100, stats.recentImpact.length * 20) : 0;
  }

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
    if (tab === 'schedule' || tab === 'study-goal') {
      navigate('/dashboard/study-goal');
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

  const exportToCSV = () => {
    const headers = ['Month', 'Revenue', 'Students', 'Courses'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + patternPerformanceData.map(e => `${e.name},${e.revenue},${e.students},${e.courses}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "platform_performance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowRechartsMenu(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-[1600px] mx-auto pb-10"
      onClick={() => {
        if (showRechartsMenu) setShowRechartsMenu(false);
        if (showNotificationsMenu) setShowNotificationsMenu(false);
      }}
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
              <p className="text-2xl font-semibold">{stats?.engagement?.studentEngagement?.activeStudents ?? stats?.dailyActiveUsers ?? 0}</p>
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
                className="px-4 py-2 rounded-lg border border-[#00D4FF] text-[#00D4FF] font-semibold hover:bg-[#00D4FF]/20 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
              >
                + Create New Course
              </button>
            )}
            {userRole === 'student' && (
              <button 
                onClick={() => navigate('/dashboard/courses')}
                className="px-4 py-2 rounded-lg border border-[#00D4FF] text-[#00D4FF] font-semibold hover:bg-[#00D4FF]/10 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
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
                    strokeDasharray={`${gauge1}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {gauge1}%
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
                    strokeDasharray={`${gauge2}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {gauge2}%
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
                    strokeDasharray={`${gauge3}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {gauge3}%
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
                    strokeDasharray={`${gauge4}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {gauge4}%
                  </span>
                </div>
              </div>
              <p className={`text-xs text-center font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Community Activity</p>
            </div>
          </div>
        </Card>

        {/* Right Widget: Line/Area Chart */}
        <Card hover={false} className={`lg:col-span-5 rounded-2xl p-6 border backdrop-blur-xl shadow-lg flex flex-col min-h-[350px] ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-6 shrink-0 relative">
            <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{areaConfig.title}</h3>
            <div 
              onClick={(e) => { e.stopPropagation(); setShowRechartsMenu(!showRechartsMenu); }}
              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded cursor-pointer font-bold ${isDarkMode ? 'text-[#00D4FF] bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20' : 'text-[#00D4FF] bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20'}`}
            >
              Recharts <MoreHorizontal className="w-3 h-3" />
            </div>
            {showRechartsMenu && (
              <div className={`absolute top-8 right-0 w-36 rounded-lg shadow-xl overflow-hidden z-20 border ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'}`}>
                <button onClick={exportToCSV} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-white/5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Export to CSV</button>
                <button onClick={() => setShowRechartsMenu(false)} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-white/5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Refresh Data</button>
              </div>
            )}
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
                       <circle cx="65" cy="50" r="12" fill="#00D4FF" />
                       <circle cx="65" cy="50" r="9" fill="#FDE047" />
                       <circle cx="65" cy="50" r="6" fill="#FEF08A" />
                       <path d="M57 60 L61 75 L65 70 L69 75 L73 60" fill="#00D4FF" />
                     </svg>
                   </div>
                   <button 
                     onClick={() => navigate('/dashboard/certificates')}
                     className="w-full py-3 bg-[#00D4FF] hover:bg-[#00D4FF] text-[#0B1120] font-bold rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(255,215,0,0.3)]"
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
                   <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#00D4FF]/20 flex items-center justify-center border border-[#00D4FF]/30">
                     <Mail className="w-10 h-10 text-[#00D4FF]" />
                   </div>
                   <button 
                     onClick={() => navigate('/dashboard/messages')}
                     className="w-full py-3 border-2 border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-[#0B1120] font-bold rounded-xl transition-all text-sm shadow-[inset_0_0_15px_rgba(255,215,0,0.1)]"
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
            <div className="space-y-3">
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
                <p className={`mt-2 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats?.engagement?.studentEngagement?.activeStudents ?? 0}</p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stats?.engagement?.studentEngagement?.activeStudentsChange ?? '+0%'}</p>
              </div>
              <div className={`rounded-2xl p-4 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs text-slate-500">Lessons Completed</p>
                <p className={`mt-2 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats?.engagement?.studentEngagement?.lessonsCompleted ?? 0}</p>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cumulative study progress</p>
              </div>
              <div className={`rounded-2xl p-4 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-xs text-slate-500">Study Hours</p>
                <p className={`mt-2 text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats?.engagement?.studentEngagement?.studyHours ?? 0}</p>
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
              <button onClick={() => navigate('/dashboard/users')} className="w-full rounded-2xl border border-[#00D4FF] bg-[#00D4FF]/10 text-[#92400E] py-3 font-semibold">Add Instructor</button>
              <button onClick={() => navigate('/dashboard/notice')} className="w-full rounded-2xl border border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#5B21B6] py-3 font-semibold">Broadcast Message</button>
            </div>
            <div className="mt-6 relative">
              <div className="flex justify-between items-center mb-3">
                <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>System Notifications</h4>
                <div 
                  onClick={(e) => { e.stopPropagation(); setShowNotificationsMenu(!showNotificationsMenu); }}
                  className={`p-1 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5`}
                >
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </div>
                {showNotificationsMenu && (
                  <div className={`absolute top-8 right-0 w-40 rounded-lg shadow-xl overflow-hidden z-20 border ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'}`}>
                    <button onClick={() => { setClearedNotifications(false); setShowNotificationsMenu(false); }} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-white/5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Mark all as read</button>
                    <button onClick={() => { setClearedNotifications(true); setShowNotificationsMenu(false); }} className={`w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10`}>Clear notifications</button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {notifications.length > 0 ? notifications.slice(0, 3).map((note, idx) => (
                  <div key={`quick-note-${idx}`} className={`rounded-2xl p-3 border ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{note.title || note.message || 'Notification'}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{note.time || note.date || note.createdAt || 'Recent update'}</p>
                  </div>
                )) : (
                  <div className={`rounded-2xl p-4 text-center text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    You're all caught up!
                  </div>
                )}
              </div>
            </div>

            {/* Active Sections */}
            <div className="mt-6 relative border-t pt-5 dark:border-white/10 border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Active Sections</h4>
                <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isDarkMode ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-cyan-100 text-cyan-600'}`}>{sectionsData.length} total</div>
              </div>
              <div className="space-y-3">
                {sectionsData.length > 0 ? [...sectionsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3).map((sec, idx) => (
                  <div key={`quick-sec-${idx}`} className={`rounded-2xl p-4 border transition-colors hover:border-[#00D4FF]/50 ${isDarkMode ? 'border-white/10 bg-[#0B1120]/50 shadow-sm' : 'border-slate-200 bg-white shadow-sm hover:shadow-md'}`}>
                    <p className={`text-sm font-black flex items-center gap-2 mb-1.5 ${isDarkMode ? 'text-[#00D4FF]' : 'text-[#00D4FF]'}`}>
                      <Users className="w-4 h-4" /> {sec.name || 'Unnamed Section'}
                    </p>
                    <p className={`text-[11px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Course: <span className={isDarkMode ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>{sec.course?.title || 'Unknown'}</span></p>
                    <p className={`text-[11px] font-bold mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Instructor: <span className={isDarkMode ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>{sec.instructor?.name || 'Unassigned'}</span></p>
                    
                    <div className="mt-3 pt-2 border-t flex flex-wrap gap-1.5 items-center dark:border-white/5 border-slate-100">
                      <span className={`text-[10px] font-bold mr-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Members:</span>
                      {sec.students?.slice(0,3).map(st => (
                        <span key={st.id} className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border ${isDarkMode ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                          {st.name}
                        </span>
                      ))}
                      {sec.students?.length > 3 && (
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border ${isDarkMode ? 'bg-white/10 text-slate-300 border-white/5' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          +{sec.students.length - 3} more
                        </span>
                      )}
                      {!sec.students?.length && (
                         <span className={`text-[9px] italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No students linked yet</span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className={`rounded-2xl p-4 text-center text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    No active sections found.
                  </div>
                )}
              </div>
              <button onClick={() => navigate('/dashboard/sections')} className="w-full mt-3 py-2 text-xs font-bold text-[#00D4FF] hover:bg-[#00D4FF]/10 rounded-lg transition-colors border border-transparent hover:border-[#00D4FF]/20">
                Manage All Sections
              </button>
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
