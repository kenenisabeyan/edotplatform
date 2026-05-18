import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

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

  const pieData = [
    { name: 'Present', value: raw.present, color: '#00D4FF' },
    { name: 'Late', value: raw.late, color: '#00D4FF' },
    { name: 'Absent', value: raw.absent, color: '#E30A17' }
  ].filter(d => d.value > 0);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Overview Pie Chart */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col items-center ${isDarkMode ? 'bg-[#0B1120]/70 border-white/10' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Platform Overview</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
      <div className={`p-6 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-[#0B1120]/70 border-white/10' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <TrendingUp className="w-5 h-5 text-[#00D4FF]" /> Weekly Flow
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
              <Tooltip 
                cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#0B1120' : '#FFF', 
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                  borderRadius: '12px' 
                }}
              />
              <Bar dataKey="count" fill="#00D4FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intervention / Alerts */}
      <div className={`p-6 rounded-3xl border shadow-sm overflow-y-auto max-h-[260px] ${isDarkMode ? 'bg-[#0B1120]/70 border-white/10' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <AlertTriangle className="w-5 h-5 text-[#E30A17]" /> Interventions Needed
        </h3>
        {lowAttendanceAlerts.length === 0 ? (
           <p className={`text-sm italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>All students meet the 75% threshold.</p>
        ) : (
           <div className="space-y-3">
             {lowAttendanceAlerts.map(alert => (
                <div key={alert.studentId} className={`flex justify-between items-center p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                   <div>
                     <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>ID: {alert.studentId.substring(0, 8)}...</p>
                   </div>
                   <div className="px-2 py-1 rounded-lg bg-[#E30A17]/20 text-[#E30A17] text-xs font-black">
                     {alert.percentage}%
                   </div>
                </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
