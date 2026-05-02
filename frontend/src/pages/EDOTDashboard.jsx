import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SupportDashboard from './SupportDashboard';
import { useNavigate } from 'react-router-dom';
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
  Mail
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import useThemeMode from '../hooks/useThemeMode';

export default function EDOTDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [agendaEvents, setAgendaEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const navigate = useNavigate();
  const isDarkMode = useThemeMode();

  const userRole = user?.role ? user.role.toLowerCase().trim() : 'student';
  void motion;

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (userRole === 'sponsor') {
        return setLoading(false);
      }
      try {
        const { data } = await api.get(`/${userRole}/dashboard`);
        setStats(data.data);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAgenda = async () => {
      try {
        const { data } = await api.get('/calendar');
        setAgendaEvents(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error('Error fetching agenda events', err);
      }
    };
    
    if (user) {
        fetchDashboardStats();
        fetchAgenda();
    }
  }, [user, userRole]);

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
        <Card hover={false} className={`rounded-2xl p-6 border backdrop-blur-xl flex flex-col justify-between group relative overflow-hidden transition-all duration-300 ${glowClass} ${isDarkMode ? 'bg-[#1E293B]/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${isDarkMode ? 'bg-[#1E293B]/10 border-white/20 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
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
        <div className={`backdrop-blur-xl p-4 rounded-xl border relative shadow-2xl ${isDarkMode ? 'bg-[#1E293B]/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
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
      setAgendaEvents((prev) => prev.filter((e) => e.id !== agendaId));
    } catch (err) {
      console.error('Failed to delete agenda event', err);
    }
  };

  const onAgendaCreated = (evt) => {
    setAgendaEvents((prev) => [...prev, evt].sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  let headerConfig = {};
  let statsConfig = [];
  let gaugeConfig = {};
  let areaConfig = {};
  let widgetConfig = {};

  if (userRole === 'admin') {
    headerConfig = {
      gradient: 'bg-gradient-to-r from-[#020b1f] via-[#0f48b9] to-[#00d4ff]',
      title: 'Welcome back, Admin Kenenisa Beyan 👋',
      subtitle: ''
    };
    statsConfig = [
      { title: 'Total Courses', value: stats?.totalCourses || 9, icon: BookOpen },
      { title: 'Active Students', value: stats?.totalStudents || 8, icon: Users },
      { title: 'Instructors', value: stats?.totalInstructors || 2, icon: Briefcase },
      { title: 'Pending Courses', value: stats?.pendingCourses || 0, icon: CircleDollarSign },
    ];
    gaugeConfig = {
      title: 'Global Attendance',
      valStr: '100%',
      valNum: 100,
      ringColor: '#00D4FF' // Cyan accent from Home/About
    };
    areaConfig = {
      title: 'Performance Insights',
      data: stats?.studentPerformanceData || [
         { name: 'Jan', value1: 20, value2: 10 }, { name: 'Feb', value1: 40, value2: 30 }, { name: 'Mar', value1: 35, value2: 25 }, { name: 'Apr', value1: 80, value2: 50 }, { name: 'May', value1: 60, value2: 80 }, { name: 'Aug', value1: 90, value2: 60 }
      ],
      lines: [{ key: 'value1', name: 'Subject', color: '#00D4FF' }, { key: 'value2', name: 'Podcast', color: '#F97316' }]
    };
    widgetConfig = {
      type: 'agenda',
      title: 'Agenda',
      subtitle: 'Upcoming sample data',
      items: [
        { label: 'SUPPORT', title: 'concept', desc: 'Event', badge: 'Apr 2', color: '#F97316' }
      ]
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

  const gaugeData = [
    { name: 'Active', value: gaugeConfig.valNum, color: gaugeConfig.ringColor },
    { name: 'Empty', value: 100 - gaugeConfig.valNum, color: isDarkMode ? '#1E293B' : '#E2E8F0' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (userRole === 'sponsor') {
    return <SupportDashboard />;
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
      <div className={`rounded-2xl p-8 border relative overflow-hidden backdrop-blur-xl ${isDarkMode ? 'bg-[#1E293B]/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
        {/* Heritage Mesh Glow placed completely underneath text */}
        <div className={`absolute inset-0 opacity-10 pointer-events-none ${headerConfig.gradient}`}></div>
        <div className="relative z-10">
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {headerConfig.title}
          </h1>
          {headerConfig.subtitle && (
            <p className={`text-sm font-normal ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>{headerConfig.subtitle}</p>
          )}

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsConfig.map((stat, i) => (
          <SmartCard key={i} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      {/* 3. Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Widget: Radial Gauge */}
        <Card hover={false} className={`lg:col-span-3 rounded-2xl p-6 border backdrop-blur-xl shadow-lg flex flex-col items-center justify-center relative min-h-[350px] ${isDarkMode ? 'bg-[#1E293B]/5 border-white/5' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-semibold text-sm absolute top-6 left-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{gaugeConfig.title}</h3>
          
          <div className="w-full flex-1 flex flex-col justify-center items-center relative mt-8">
             <ResponsiveContainer width="100%" height="90%">
               <PieChart>
                 <Pie 
                   data={gaugeData} 
                   cx="50%" 
                   cy="50%" 
                   innerRadius={70} 
                   outerRadius={90} 
                   paddingAngle={0} 
                   dataKey="value" 
                   stroke="none" 
                   cornerRadius={userRole === 'student' ? 40 : 0} 
                   startAngle={90} 
                   endAngle={-270}
                 >
                   {gaugeData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center pt-2">
                {gaugeConfig.valStr.split('\n').map((line, i) => (
                  <span key={i} className={i === 0 ? `text-3xl font-display font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}` : `text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>
                    {line}
                  </span>
                ))}
             </div>
          </div>
        </Card>

        {/* Right Widget: Line/Area Chart */}
        <Card hover={false} className={`lg:col-span-6 rounded-2xl p-6 border backdrop-blur-xl shadow-lg flex flex-col min-h-[350px] ${isDarkMode ? 'bg-[#1E293B]/5 border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{areaConfig.title}</h3>
            <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded ${isDarkMode ? 'text-slate-200 bg-[#1E293B]/5' : 'text-slate-600 bg-slate-100'}`}>
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

         {/* Agenda / Claim Widget (Bottom Right) */}
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
             <Card hover={false} className={`rounded-2xl p-6 border backdrop-blur-xl shadow-lg flex flex-col min-h-[350px] ${isDarkMode ? 'bg-[#1E293B]/5 border-white/5' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start mb-6">
                  <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{widgetConfig.title}</h3>
                  <MoreHorizontal className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-32 h-32 mb-6 opacity-80">
                     {/* Placeholder logic mirroring Master Spec SVG expectations for Certificates */}
                     <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="25" width="40" height="50" rx="4" fill="#E2E8F0" />
                        <rect x="30" y="15" width="45" height="55" rx="4" fill="#CBD5E1" />
                        <rect x="40" y="20" width="50" height="60" rx="4" fill="#F8FAFC" />
                        <circle cx="65" cy="50" r="12" fill="#FFD700" />
                        <circle cx="65" cy="50" r="9" fill="#FDE047" />
                        <circle cx="65" cy="50" r="6" fill="#FEF08A" />
                        <path d="M57 60 L61 75 L65 70 L69 75 L73 60" fill="#FFD700" />
                     </svg>
                  </div>
                  <button 
                    onClick={() => navigate('/dashboard/certificates')}
                    className="w-full py-3 bg-[#FFD700] hover:bg-[#EAB308] text-[#0B0E14] font-bold rounded-xl transition-colors text-sm shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                  >
                    {widgetConfig.action}
                  </button>
                </div>
             </Card>
           )}

           {widgetConfig.type === 'communication' && (
             <Card hover={false} className={`rounded-2xl p-6 border backdrop-blur-xl shadow-lg flex flex-col min-h-[350px] ${isDarkMode ? 'bg-[#1E293B]/5 border-white/5' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start mb-6">
                  <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{widgetConfig.title}</h3>
                  <MoreHorizontal className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`} />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#F97316]/20 flex items-center justify-center border border-[#F97316]/30">
                     <Mail className="w-10 h-10 text-[#FFD700]" />
                  </div>
                  <button 
                    onClick={() => navigate('/dashboard/messages')}
                    className="w-full py-3 border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#0B0E14] font-bold rounded-xl transition-all text-sm shadow-[inset_0_0_15px_rgba(255,215,0,0.1)]"
                  >
                    {widgetConfig.action}
                  </button>
                </div>
             </Card>
           )}
         </div>

      </div>

      <AgendaCreationModal
        isOpen={isAgendaModalOpen}
        onClose={() => setIsAgendaModalOpen(false)}
        onAgendaCreated={(evt) => { onAgendaCreated(evt); setIsAgendaModalOpen(false); }}
      />
    </motion.div>
  );
}
