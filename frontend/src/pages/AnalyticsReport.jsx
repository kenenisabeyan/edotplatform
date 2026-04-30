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
    <div className="space-y-6">
      {/* Header section with back button */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl p-6 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#0B0E14]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className={`p-3 hover:bg-[#11151F]/10 rounded-full transition-colors hover:text-white border ${isDarkMode ? 'bg-[#11151F]/5 text-slate-200 border-white/5' : 'bg-slate-50 text-slate-600 border-slate-100'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-display font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Detailed Data Report</h1>
            <p className="text-[#FFD700] text-xs font-bold   mt-1">Comprehensive overview of platform analytics</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors border bg-[#E67E22] hover:bg-[#CF711F] shadow-md border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className={`flex items-center gap-2 hover:shadow-[0_0_15px_rgba(0,138,50,0.4)] px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
           <div className={`w-12 h-12 border-4 border-t-[#FFD700] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
        </div>
      ) : (
        <div className="space-y-6">
           {/* Report Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-gradient-to-br from-[#FFD700] to-yellow-600 rounded-3xl p-6 text-black shadow-[0_0_30px_rgba(255,215,0,0.2)] relative overflow-hidden group hover:-translate-y-1 transition-all cursor-pointer">
               <div className={`absolute right-0 top-0 w-32 h-32 rounded-full blur-2xl group-hover:bg-[#11151F]/30 transition-all ${isDarkMode ? 'bg-[#11151F]/20' : 'bg-slate-100'}`}></div>
               <div className="relative z-10">
                 <div className="flex justify-between items-center mb-4">
                   <div className="p-2 bg-black/10 rounded-xl backdrop-blur-sm shadow-inner"><CircleDollarSign className="w-6 h-6" /></div>
                   <span className="flex items-center gap-1 text-[10px] font-black bg-black/10 px-2 py-1 rounded-md backdrop-blur-sm  "><TrendingUp className="w-3 h-3" /> +24%</span>
                 </div>
                 <h2 className="text-4xl font-black mb-1">${(reportData.totalRevenue || 0).toLocaleString()}</h2>
                 <p className="text-black/70 font-bold   text-xs mt-2">{user?.role === 'admin' ? 'Total Quarterly Revenue' : 'Total Course Earnings'}</p>
               </div>
             </div>
             
             <div className={`backdrop-blur-xl p-6 rounded-3xl border shadow-2xl flex flex-col justify-between group hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden ${isDarkMode ? 'bg-[#0B0E14]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
               <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-[#E67E22]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex justify-between items-center mb-4 relative z-10">
                 <div className="p-3 bg-[#E67E22]/10 border border-[#E67E22]/30 text-[#E67E22] rounded-xl"><Users className="w-6 h-6" /></div>
               </div>
               <div className="relative z-10">
                 <h2 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{reportData.totalActiveLearners || 0}</h2>
                 <p className="text-[#E67E22] font-bold text-xs  ">Active Learners</p>
               </div>
             </div>

             <div className={`backdrop-blur-xl p-6 rounded-3xl border shadow-2xl flex flex-col justify-between group hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden ${isDarkMode ? 'bg-[#0B0E14]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
               <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-blue-500/100/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex justify-between items-center mb-4 relative z-10">
                 <div className="p-3 bg-blue-500/100/10 border border-blue-500/30 text-blue-400 rounded-xl"><BookOpen className="w-6 h-6" /></div>
               </div>
               <div className="relative z-10">
                 <h2 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{reportData.totalCourseCompletions || 0}</h2>
                 <p className="text-blue-400 font-bold text-xs  ">Course Completions</p>
               </div>
             </div>
           </div>

           {/* Detailed Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className={`backdrop-blur-xl p-6 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#0B0E14]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
                <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Revenue Trajectory</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FFD700" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', background: '#0B0E14', color: '#fff', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className={`backdrop-blur-xl p-6 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#0B0E14]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
                <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Platform Engagement</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                      <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', background: '#0B0E14', color: '#fff', fontWeight: 'bold' }} />
                      <Bar dataKey="students" fill="#008A32" radius={[6, 6, 0, 0]} name="Students" barSize={20} />
                      <Bar dataKey="teachers" fill="#4B5563" radius={[6, 6, 0, 0]} name="Teachers" barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
           </div>

           {/* Footer Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className={`backdrop-blur-xl p-6 rounded-3xl border shadow-2xl flex items-center ${isDarkMode ? 'bg-[#0B0E14]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
                <div className="h-48 w-1/2">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={reportData.courseCompletionData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                         {(reportData.courseCompletionData || []).map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#0B0E14', color: '#fff' }} />
                     </PieChart>
                   </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-6">
                   <h3 className={`text-lg font-bold mb-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Course Overview</h3>
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

             <div className={`bg-gradient-to-br from-[#1a1f2e] to-[#0B0E14] p-8 rounded-3xl border shadow-inner flex flex-col justify-center relative overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
               <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>
               <h3 className="text-xl font-bold text-[#FFD700] mb-3 relative z-10">Automated Insight AI</h3>
               <p className={`font-medium leading-relaxed text-sm mb-6 relative z-10 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                 Platform performance is actively monitored. Automated insights will generate here automatically once enough interaction data aligns with algorithmic thresholds.
               </p>
               <button className={`self-start text-sm font-semibold px-6 py-3 rounded-xl transition-all border relative z-10 hover:shadow-lg bg-[#E67E22] hover:bg-[#CF711F] shadow-md border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                 Generate Briefing
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
