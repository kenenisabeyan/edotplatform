import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AttendanceAnalytics() {
  const isDarkMode = useThemeMode();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/attendance/aggregate');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-[#00D4FF] rounded-full animate-spin border-slate-200"></div>
      </div>
    );
  }

  if (!data || !data.analytics) return null;

  const { monthlyTrends, weeklyTrends, lowAttendanceAlerts } = data.analytics;
  const raw = data.raw;

  // Format weekly data for Recharts
  const weeklyData = Object.keys(weeklyTrends).map(day => ({
    name: day,
    count: weeklyTrends[day]
  }));

  // Format monthly data
  const monthlyData = Object.keys(monthlyTrends).map(month => ({
    name: month,
    Present: monthlyTrends[month].present,
    Late: monthlyTrends[month].late,
    Absent: monthlyTrends[month].absent
  }));

  const pieData = raw.total === 0 ? data.data : [
    { name: 'Present', value: raw.present, color: '#00D4FF' },
    { name: 'Late', value: raw.late, color: '#F97316' },
    { name: 'Absent', value: raw.absent, color: '#E30A17' }
  ].filter(d => d.value > 0);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Overview Pie Chart */}
      <div className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all duration-500 ease-out group ${isDarkMode ? 'bg-gradient-to-br from-[#0B1120]/80 to-[#0f172a]/80 border-white/10 hover:border-[#00D4FF]/30 hover:shadow-[0_0_40px_rgba(0,212,255,0.05)]' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-[#2563EB]/30 hover:shadow-xl'}`}>
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4FF]/10 blur-[60px] rounded-full pointer-events-none"></div>
        <h3 className={`font-black font-display text-lg mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
           <span className="w-2 h-2 rounded-full bg-[#00D4FF]"></span>
           Platform Overview
        </h3>
        <div className="h-48 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={6}
                dataKey="value"
                stroke={isDarkMode ? '#0B1120' : '#ffffff'}
                strokeWidth={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-sm hover:opacity-80 transition-opacity duration-300 outline-none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#0B1120' : '#FFF', 
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                  borderRadius: '12px' 
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Trends */}
      <div className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all duration-500 ease-out group ${isDarkMode ? 'bg-gradient-to-br from-[#0B1120]/80 to-[#0f172a]/80 border-white/10 hover:border-[#00D4FF]/30 hover:shadow-[0_0_40px_rgba(0,212,255,0.05)]' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-[#2563EB]/30 hover:shadow-xl'}`}>
         <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#2563EB]/10 blur-[70px] rounded-full pointer-events-none"></div>
        <h3 className={`font-black font-display text-lg mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <TrendingUp className="w-5 h-5 text-[#00D4FF]" /> Weekly Flow
        </h3>
        <div className="h-48 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 600 }} dx={-10} />
              <Tooltip 
                cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} className="drop-shadow-md hover:opacity-80 transition-opacity duration-300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intervention / Alerts */}
      <div className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all duration-500 ease-out group ${isDarkMode ? 'bg-gradient-to-br from-[#0B1120]/80 to-[#0f172a]/80 border-white/10 hover:border-[#E30A17]/30 hover:shadow-[0_0_40px_rgba(227,10,23,0.05)]' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-[#E30A17]/30 hover:shadow-xl'}`}>
         <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-32 bg-[#E30A17]/10 blur-[60px] rounded-full pointer-events-none"></div>
        <h3 className={`font-black font-display text-lg mb-4 flex items-center gap-2 relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <AlertTriangle className="w-5 h-5 text-[#E30A17]" /> Interventions Needed
        </h3>
        <div className="relative z-10 space-y-3 overflow-y-auto max-h-[190px] pr-2 custom-scrollbar">
           {lowAttendanceAlerts.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-6 px-4 text-center rounded-2xl border border-dashed ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                 <CheckCircle2 className="w-8 h-8 text-[#00D4FF] mb-2 opacity-50" />
                 <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>All active students currently meet the 75% attendance threshold.</p>
              </div>
           ) : (
              lowAttendanceAlerts.map(alert => (
                 <div key={alert.studentId} className={`flex justify-between items-center p-3 rounded-xl border transition-colors hover:shadow-md ${isDarkMode ? 'bg-black/40 border-white/5 hover:border-white/10' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                    <div>
                      <p className={`text-xs font-black tracking-wide ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>ID: <span className="opacity-70">{alert.studentId.substring(0, 8)}...</span></p>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#E30A17]/20 to-[#F97316]/20 text-[#E30A17] text-xs font-black shadow-sm border border-[#E30A17]/20">
                      {alert.percentage}%
                    </div>
                 </div>
              ))
           )}
        </div>
      </div>
    </div>
  );
}
