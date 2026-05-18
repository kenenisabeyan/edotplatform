import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import SummaryCard from '../components/cards/SummaryCard';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Clock, Video, Users, MessageSquare } from 'lucide-react';

export default function TeachingActivity() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState([]);
  const [kpis, setKpis] = useState({
      hours: 0,
      classes: 0,
      reach: 0,
      replies: 0
  });

  useEffect(() => {
    const fetchTeaching = async () => {
      try {
        const role = user?.role ? user.role.toLowerCase() : 'student';
        const endpointPrefix = role === 'admin' ? '/admin' : '/instructor';
        
        const [analyticsRes, coursesRes, historyRes] = await Promise.all([
           api.get(`/${role}/analytics/detailed`).catch(() => ({ data: { data: { engagementData: [] } } })),
           api.get(`${endpointPrefix}/courses`).catch(() => ({ data: { data: [] } })),
           api.get('/activity/all', { params: { limit: 30 } }).catch(() => ({ data: { data: [] } }))
        ]);
        
        const courses = coursesRes.data?.data || [];
        const activeClasses = courses.length;
        
        let totalReach = 0;
        courses.forEach(c => { totalReach += (c.enrolledStudents?.length || 0); });

        const activities = historyRes.data?.data || [];
        const messagesCount = activities.filter(a => a.type === 'communication' && (a.user?.id || a.user) === user.id).length;

        const realHours = activeClasses * 2 + (activities.filter(a => a.action?.toLowerCase().includes('attendance')).length * 1.5);

        setKpis({
            hours: Math.round(realHours) || 0,
            classes: activeClasses || 0,
            reach: totalReach || 0,
            replies: messagesCount || 0
        });

        const engagement = analyticsRes.data?.data?.engagementData || [];
        const mapped = engagement.map(item => ({
            name: item.name,
            hours: Math.round((item.teachers || 1) * 2), // Base on teacher presence per day
            engagements: item.students || 0
        }));
        
        setActivityData(mapped);
      } catch (error) {
        console.error("Failed to load teaching activity", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTeaching();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className={`w-8 h-8 border-4 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div></div>;
  }

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Clock className="w-8 h-8 text-[#00D4FF]" />
            Teaching Activity
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Track instructor hours, enrollments, and platform engagement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard 
          title="Hours Taught" 
          value={kpis.hours} 
          icon={Clock} 
          colorTheme="blue" 
        />
        <SummaryCard 
          title="Active Classes" 
          value={kpis.classes} 
          icon={Video} 
          colorTheme="purple" 
        />
        <SummaryCard 
          title="Student Reach" 
          value={kpis.reach} 
          icon={Users} 
          colorTheme="green" 
        />
        <SummaryCard 
          title="Forum Replies" 
          value={kpis.replies} 
          icon={MessageSquare} 
          colorTheme="orange" 
        />
      </div>

      <div className={`backdrop-blur-xl p-8 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#0B1120]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
        <h3 className={`text-xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Teaching Velocity</h3>
        <div className="h-80">
          {activityData && activityData.length > 0 && activityData.some(d => d.hours > 0 || d.engagements > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#00D4FF', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', background: '#0B1120', color: '#fff', fontWeight: 'bold' }} />
                <Line yAxisId="left" type="monotone" dataKey="hours" name="Teaching Hours" stroke="#008A32" strokeWidth={4} activeDot={{ r: 8, fill: '#0B1120', stroke: '#008A32', strokeWidth: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="engagements" name="Student Engagements" stroke="#00D4FF" strokeWidth={4} strokeDasharray="5 5" activeDot={{ r: 8, fill: '#0B1120', stroke: '#00D4FF', strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <div className={`flex flex-col items-center justify-center p-4 py-8 text-center border-2 border-dashed rounded-2xl w-full h-full shadow-inner ${isDarkMode ? 'border-white/10 bg-[#0B1120]/5' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={`font-bold text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No teaching velocity data logged</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
