import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { revenueService } from '../services/api';
import SummaryCard from '../components/cards/SummaryCard';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { CircleDollarSign, ArrowDownRight, CreditCard, Activity } from 'lucide-react';

export default function Revenue() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [realCourses, setRealCourses] = useState([]);
  const [kpis, setKpis] = useState({ total: 0, growth: 0 });

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const role = user?.role ? user.role.toLowerCase() : 'student';
        
        const data = await revenueService.getRevenueMetrics(role);
        
        let coursesRes = [];
        try {
           if (role === 'admin') coursesRes = await api.get('/admin/courses');
           else if (role === 'instructor') coursesRes = await api.get('/instructor/courses');
           else coursesRes = await api.get('/courses');
        } catch { /* ignore */ }

        const courses = coursesRes?.data?.data || coursesRes?.data || [];
        setRealCourses(courses);

        let totalNetRevenue = 0;
        let totalActiveSubs = 0;

        courses.forEach(course => {
           let studentsCount = course.totalStudents || (course.enrolledStudents ? course.enrolledStudents.length : 0);
           let coursePrice = Number(course.price) || 0;
           totalNetRevenue += studentsCount * coursePrice;
           totalActiveSubs += studentsCount;
        });

        setKpis({
            total: totalNetRevenue,
            activeLearners: totalActiveSubs,
            growth: 0
        });

        setRevenueData(data);
      } catch (error) {
        console.error("Failed to load revenue data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchRevenue();
  }, [user]);



  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <CircleDollarSign className="w-8 h-8 text-[#00D4FF]" />
            Finance & Revenue
            {loading && <div className={`w-5 h-5 border-2 border-t-[#F97316] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'} ml-3`}></div>}
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Track platform monetization and subscription flow.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total Net Computed" 
          value={`$${kpis.total.toLocaleString()}`} 
          isPositive={true} 
          icon={CircleDollarSign} 
          colorTheme="blue" 
        />
        <SummaryCard 
          title="Active Paid Subscriptions" 
          value={kpis.activeLearners} 
          percentage={null} 
          isPositive={true} 
          icon={Activity} 
          colorTheme="green" 
        />
        <SummaryCard 
          title="Transaction Loss" 
          value="$0" 
          isPositive={false} 
          icon={ArrowDownRight} 
          colorTheme="orange" 
        />
      </div>

      <div className={`backdrop-blur-xl p-8 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#0B1120]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
        <h3 className={`text-xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Revenue Trajectory Timeline</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#008A32" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#008A32" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', background: '#0B1120', color: '#fff', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="revenue" stroke="#008A32" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#0B1120]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-white/10 bg-[#0B1120]/5' : 'border-slate-200 bg-slate-50'}`}>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Recent Transactions</h3>
          <p className={`text-[10px] font-bold mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Based on computed active course enrollments</p>
        </div>
        <div className="p-0 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`bg-[#0B1120] text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                <th className={`p-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Date</th>
                <th className={`p-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Course Allocation</th>
                <th className={`p-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Amount Computed</th>
                <th className={`p-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Status</th>
              </tr>
            </thead>
            <tbody className={`text-sm font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {realCourses.length > 0 && realCourses.some(c => c.price > 0 && c.totalStudents > 0) ? (
                 realCourses.filter(c => c.price > 0 && c.totalStudents > 0).map((course, idx) => (
                    <tr key={idx} className={`border-b hover:bg-white/5/5 transition-colors ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <td className={`p-5 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{new Date(course.createdAt).toLocaleDateString()}</td>
                      <td className="p-5 font-bold">{course.title}</td>
                      <td className="p-5 text-[#F97316] ">${(course.price * course.totalStudents).toLocaleString()}</td>
                      <td className="p-5"><span className="bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 px-3 py-1 rounded-lg text-xs font-black  ">Settled</span></td>
                    </tr>
                 ))
              ) : (
                 <tr className={`border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                   <td colSpan="4" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center opacity-50">
                         <CreditCard className={`w-10 h-10 mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                         <span className={`font-bold text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No monetized enrollments found.</span>
                      </div>
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
