import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Download, Filter, ArrowLeft, TrendingUp, Users, BookOpen, CircleDollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AnalyticsReport() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
     revenueData: [],
     engagementData: [],
     courseCompletionData: [],
     totalRevenue: 0,
     totalActiveLearners: 0,
     totalCourseCompletions: 0
  });

  const COLORS = ['#10b981', '#6366f1', '#f59e0b'];

  useEffect(() => {
    const fetchDetailedAnalytics = async () => {
       try {
          const userRole = user?.role ? user.role.toLowerCase().trim() : 'student';
          const { data } = await api.get(`/${userRole}/analytics/detailed`);
          if (data.success) {
             setReportData(data.data);
          }
       } catch (error) {
          console.error("Failed to fetch precise detailed analytics", error);
       } finally {
          setLoading(false);
       }
    };

    if (user) {
        fetchDetailedAnalytics();
    }
  }, [user]);

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-none w-full">
      {/* Header section with back button */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className={`p-3 hover:bg-white/5/10 rounded-full transition-colors hover:text-white border ${isDarkMode ? 'bg-[#0B1120]/5 text-slate-200 border-white/5' : 'bg-slate-50 text-slate-600 border-slate-100'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <TrendingUp className="w-8 h-8 text-[#00D4FF]" />
              Detailed Data Report
            </h1>
            <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Comprehensive overview of platform analytics and metrics.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className={`group relative overflow-hidden flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all border shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${isDarkMode ? 'bg-[#0B1120]/80 border-white/10 text-white hover:border-[#00D4FF]/30' : 'bg-white border-slate-200 text-slate-900 hover:border-[#00D4FF]/30'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/10 to-[#2563EB]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Filter className="w-4 h-4 relative z-10 text-[#00D4FF]" /> 
            <span className="relative z-10">Filter Data</span>
          </button>
          <button className={`group relative overflow-hidden flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-sm transition-all shadow-lg hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 hover:scale-105 border border-white/20 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white`}>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <Download className="w-4 h-4 relative z-10 drop-shadow-md" /> 
            <span className="relative z-10 drop-shadow-md">Export PDF Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
           <div className={`w-12 h-12 border-4 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
        </div>
      ) : (
        <div className="space-y-6">
            {/* Report Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#00D4FF] to-[#2563EB] rounded-[2.5rem] p-8 text-white shadow-[0_0_40px_rgba(0,212,255,0.2)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col items-center text-center gap-3">
                <div className="absolute right-[-20%] top-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-md shadow-inner border border-white/20 mb-3"><CircleDollarSign className="w-6 h-6" /></div>
                  <p className="text-white/80 font-bold text-sm tracking-wide mb-1.5">{user?.role === 'admin' ? 'Total Quarterly Revenue' : 'Total Course Earnings'}</p>
                  <h2 className="text-5xl font-black font-display mb-3 drop-shadow-md">${(reportData.totalRevenue || 0).toLocaleString()}</h2>
                  <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm w-fit"><TrendingUp className="w-3 h-3" /> +24%</span>
                </div>
              </div>
              
              <div className={`p-8 rounded-[2.5rem] border shadow-2xl flex flex-col items-center text-center gap-3 group hover:-translate-y-1 transition-all duration-500 cursor-pointer relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-[#0B1120]/80 to-[#0f172a]/80 border-white/10 hover:border-[#00D4FF]/30' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-[#00D4FF]/30'}`}>
                <div className="absolute right-0 bottom-0 w-48 h-48 bg-[#00D4FF]/10 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-screen"></div>
                <div className="p-3 bg-gradient-to-br from-[#00D4FF]/20 to-[#2563EB]/20 border border-[#00D4FF]/30 text-[#00D4FF] rounded-full shadow-inner relative z-10"><Users className="w-6 h-6" /></div>
                <div className="relative z-10 w-full flex flex-col items-center">
                  <p className="text-[#00D4FF] font-bold text-sm tracking-wide mb-1.5">Active Learners</p>
                  <h2 className={`text-5xl font-black font-display ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{reportData.totalActiveLearners || 0}</h2>
                </div>
              </div>

              <div className={`p-8 rounded-[2.5rem] border shadow-2xl flex flex-col items-center text-center gap-3 group hover:-translate-y-1 transition-all duration-500 cursor-pointer relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-[#0B1120]/80 to-[#0f172a]/80 border-white/10 hover:border-[#2563EB]/30' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-[#2563EB]/30'}`}>
                <div className="absolute right-0 bottom-0 w-48 h-48 bg-[#2563EB]/10 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-screen"></div>
                <div className="p-3 bg-gradient-to-br from-[#2563EB]/20 to-[#00D4FF]/20 border border-[#2563EB]/30 text-[#2563EB] rounded-full shadow-inner relative z-10"><BookOpen className="w-6 h-6" /></div>
                <div className="relative z-10 w-full flex flex-col items-center">
                  <p className="text-[#2563EB] font-bold text-sm tracking-wide mb-1.5">Course Completions</p>
                  <h2 className={`text-5xl font-black font-display ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{reportData.totalCourseCompletions || 0}</h2>
                </div>
              </div>
            </div>

           {/* Detailed Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className={`p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden group ${isDarkMode ? 'bg-gradient-to-br from-[#0B1120]/80 to-[#0f172a]/80 border-white/10' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'}`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D4FF]/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
                <h3 className={`text-xl font-black font-display mb-6 relative z-10 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                   <span className="w-2.5 h-2.5 rounded-full bg-[#00D4FF]"></span> Revenue Trajectory
                </h3>
                <div className="h-72 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9"} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600}} dx={-10} />
                      <Tooltip 
                         contentStyle={{ 
                            borderRadius: '16px', 
                            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0', 
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
                            background: isDarkMode ? '#0f172a' : '#ffffff', 
                            color: isDarkMode ? '#fff' : '#0f172a', 
                            fontWeight: 'bold' 
                         }} 
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#00D4FF" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" className="drop-shadow-lg" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className={`p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden group ${isDarkMode ? 'bg-gradient-to-br from-[#0B1120]/80 to-[#0f172a]/80 border-white/10' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'}`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/5 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
                <h3 className={`text-xl font-black font-display mb-6 relative z-10 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                   <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span> Platform Engagement
                </h3>
                <div className="h-72 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00D4FF" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#0088cc" stopOpacity={0.8}/>
                        </linearGradient>
                        <linearGradient id="barTeachers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#1e40af" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9"} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600}} dx={-10} />
                      <Tooltip 
                         cursor={{fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)'}} 
                         contentStyle={{ 
                            borderRadius: '16px', 
                            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0', 
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', 
                            background: isDarkMode ? '#0f172a' : '#ffffff', 
                            color: isDarkMode ? '#fff' : '#0f172a', 
                            fontWeight: 'bold' 
                         }} 
                      />
                      <Bar dataKey="students" fill="url(#barStudents)" radius={[6, 6, 0, 0]} name="Students" barSize={20} className="drop-shadow-md hover:opacity-80 transition-opacity" />
                      <Bar dataKey="teachers" fill="url(#barTeachers)" radius={[6, 6, 0, 0]} name="Teachers" barSize={20} className="drop-shadow-md hover:opacity-80 transition-opacity" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
           </div>

           {/* Footer Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className={`p-8 rounded-[2.5rem] border shadow-2xl flex items-center relative overflow-hidden group ${isDarkMode ? 'bg-gradient-to-br from-[#0B1120]/80 to-[#0f172a]/80 border-white/10 hover:border-[#00D4FF]/30' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-[#00D4FF]/30'}`}>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00D4FF]/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-48 w-1/2 relative z-10">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={reportData.courseCompletionData} innerRadius={55} outerRadius={80} paddingAngle={6} dataKey="value" stroke={isDarkMode ? '#0B1120' : '#ffffff'} strokeWidth={3}>
                         {(reportData.courseCompletionData || []).map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} className="drop-shadow-sm hover:opacity-80 transition-opacity outline-none" />
                         ))}
                       </Pie>
                       <Tooltip contentStyle={{ borderRadius: '16px', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0', background: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#fff' : '#0f172a', fontWeight: 'bold', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                     </PieChart>
                   </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-6 relative z-10">
                   <h3 className={`text-xl font-black font-display mb-5 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <span className="w-2 h-2 rounded-full bg-[#00D4FF]"></span> Course Overview
                   </h3>
                   <div className="space-y-4">
                     {(reportData.courseCompletionData || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-3">
                              <span className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: item.color || COLORS[idx%COLORS.length] }}></span>
                              <span className={`font-bold text-[10px] ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{item.name}</span>
                           </div>
                           <span className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
                        </div>
                     ))}
                   </div>
                </div>
             </div>

             <div className={`p-8 rounded-[2.5rem] border shadow-2xl flex flex-col justify-center relative overflow-hidden group ${isDarkMode ? 'bg-gradient-to-br from-[#0B1120]/90 to-[#0f172a]/90 border-white/10' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'}`}>
               <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-gradient-to-br from-[#00D4FF]/20 to-[#2563EB]/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
               <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-gradient-to-tr from-[#2563EB]/10 to-[#00D4FF]/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity duration-700 delay-100"></div>
               
               <div className="flex items-center gap-3 mb-4 relative z-10">
                 <div className="p-2.5 bg-gradient-to-tr from-[#00D4FF]/20 to-[#2563EB]/20 rounded-2xl border border-[#00D4FF]/30">
                   <div className="w-5 h-5 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
                 </div>
                 <h3 className="text-2xl font-black font-display bg-clip-text text-transparent bg-gradient-to-r from-[#00D4FF] to-[#2563EB]">Automated Insight AI</h3>
               </div>
               
               <p className={`font-bold leading-relaxed text-sm mb-8 relative z-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                 Platform performance is actively monitored. AI-driven strategic insights will compile here automatically once sufficient historical engagement data aligns with algorithmic forecasting thresholds.
               </p>
               <button className={`group/btn relative overflow-hidden self-start flex items-center gap-2 px-8 py-3.5 rounded-full font-black text-sm transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:-translate-y-0.5 hover:scale-105 border border-white/20 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white`}>
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                 <span className="relative z-10 drop-shadow-md">Generate Executive Briefing</span>
                 <ArrowLeft className="w-4 h-4 rotate-180 relative z-10 drop-shadow-md group-hover/btn:translate-x-1 transition-transform" />
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
