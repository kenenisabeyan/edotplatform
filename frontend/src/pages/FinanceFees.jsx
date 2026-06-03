import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, Search, MoreVertical, Edit2, Trash2, ArrowUpRight, ArrowDownRight, CircleDollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StatBox = ({ title, value, percentage, type }) => {
  const isDarkMode = useThemeMode();
  return (
  <div className={`p-4 md:p-6 rounded-3xl border shadow-sm overflow-hidden flex flex-col justify-center ${type === 'primary' ? 'bg-gradient-to-r from-[#00D4FF] to-[#0099CC] border-[#00D4FF]/50' : (isDarkMode ? 'bg-[#0B1120]/90 backdrop-blur-xl' : 'bg-white')} ${isDarkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`}>
    <div className="flex justify-between items-start mb-2 md:mb-4">
      <h3 className={`font-black text-[10px] truncate ${type === 'primary' ? 'text-white/80' : (isDarkMode ? 'text-slate-200' : 'text-slate-500')}`}>{title}</h3>
      {percentage && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${
          type === 'primary' ? 'bg-[#0B1120]/20 border-white/30 text-white' : 
          percentage.startsWith('+') ? 'bg-[#00D4FF]/20 border-[#00D4FF]/30 text-[#00D4FF]' : 'bg-[#E30A17]/20 border-[#E30A17]/30 text-[#E30A17]'
        }`}>
          {percentage}%
        </span>
      )}
    </div>
    <h2 className={`text-xl sm:text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-black tracking-tight w-full ${type === 'primary' ? 'text-white' : (isDarkMode ? 'text-[#00D4FF]' : 'text-slate-900')}`} title={value}>{value}</h2>
    <p className={`text-[9px] md:text-[10px] mt-1 md:mt-2 font-bold truncate ${type === 'primary' ? 'text-white/70' : (isDarkMode ? 'text-slate-300' : 'text-slate-500')}`}>Total Computed Ledger</p>
  </div>
);
};

export default function FinanceFees() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const role = user?.role ? user.role.toLowerCase() : 'student';
        let res = [];
        if (role === 'admin') res = await api.get('/admin/courses').catch(()=>({data:{data:[]}}));
        else if (role === 'instructor') res = await api.get('/instructor/courses').catch(()=>({data:{data:[]}}));
        else res = await api.get('/courses').catch(()=>({data:{data:[]}}));

        setCourses(res.data?.data || res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchFinance();
  }, [user]);

  const { totalExpected, activePaidLearners } = React.useMemo(() => ({
    totalExpected: courses.reduce((acc, c) => acc + (Number(c.price) * (c.enrolledStudents?.length || c.totalStudents || 0)), 0),
    activePaidLearners: courses.reduce((acc, c) => acc + (c.price > 0 ? (c.enrolledStudents?.length || c.totalStudents || 0) : 0), 0)
  }), [courses]);

  const collectionData = React.useMemo(() => [
    { name: 'Jan', collection: totalExpected * 0.1 },
    { name: 'Feb', collection: totalExpected * 0.3 },
    { name: 'Mar', collection: totalExpected * 0.5 },
    { name: 'Apr', collection: totalExpected * 0.7 },
    { name: 'May', collection: totalExpected }
  ], [totalExpected]);

  if (loading) {
     return <div className="flex justify-center items-center h-64"><div className={`w-10 h-10 border-4 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div></div>;
  }

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-none mx-auto w-full">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <CircleDollarSign className="w-8 h-8 text-[#00D4FF]" />
            Institution Financials
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Manage global fee ledgers & financial flows.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 backdrop-blur-xl p-8 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#0B1120]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
           <div className="flex justify-between items-center mb-6">
             <h3 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>System Collection Trajectory</h3>
             <button className={`flex items-center gap-1 font-semibold px-3 py-1.5 rounded-full border transition-colors bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border-[#00D4FF] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Year-to-Date <ChevronDown className="w-3 h-3" />
             </button>
           </div>
           
           <div className="text-center mb-4">
             <p className="text-[#00D4FF] text-[10px] font-black  ">Active Computed Ledger Projection</p>
           </div>
           
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={collectionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorColor" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', background: '#0B1120', color: '#fff', fontWeight: 'bold' }} />
                 <Area type="monotone" dataKey="collection" stroke="#00D4FF" strokeWidth={3} fillOpacity={1} fill="url(#colorColor)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:grid-rows-2">
           <div className="grid grid-cols-2 gap-4">
             <StatBox title="Gross Expected" value={`$${totalExpected.toLocaleString()}`} type="primary" />
             <StatBox title="Paid Subscriptions" value={activePaidLearners} type="default" />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <StatBox title="Deficit/Pending" value="$0" type="default" />
             <StatBox title="Refunded" value="$0" type="default" />
           </div>
        </div>
      </div>

      <div className={`backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#0B1120]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
        <div className={`p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 ${isDarkMode ? 'border-white/10 bg-[#0B1120]/5' : 'border-slate-200 bg-slate-50'}`}>
          <h3 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Active Financial Enrollments</h3>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ml-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <input 
                type="text" 
                placeholder="Search ledger..." 
                className={`w-full !pl-14 !pr-4 !py-2.5 bg-[#0B1120] border !rounded-full-full text-sm font-medium outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/50 placeholder:text-slate-400 transition-all shadow-inner ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className={`bg-[#0B1120] text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                <th className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Ledger Entity (Course)</th>
                <th className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Instructor</th>
                <th className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Base Tuition Fee</th>
                <th className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Active Volume</th>
                <th className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Gross Computation</th>
                <th className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Entity Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-white/5 text-sm font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {courses.length > 0 ? courses.map(c => {
                 const volume = c.enrolledStudents?.length || c.totalStudents || 0;
                 return (
                <tr key={c.id} className="hover:bg-white/5/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 flex items-center justify-center font-black text-[10px] shrink-0   shadow-sm">
                        {c.title.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</p>
                        <p className={`text-[10px] font-black mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{c.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{c.instructor?.name || 'Assigned Instructor'}</td>
                  <td className="px-6 py-4 text-[#00D4FF] font-black ">${c.price || 0}</td>
                  <td className={`px-6 py-4 font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{volume}</td>
                  <td className="px-6 py-4 text-[#00D4FF] font-black ">${(c.price || 0) * volume}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center px-3 py-1 border rounded-[4px] text-[9px] font-black   shadow-sm
                      ${c.status === 'approved' ? 'bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30' : 
                        c.status === 'pending' ? 'bg-[#E30A17]/20 text-[#E30A17] border-[#E30A17]/30' : 
                        'bg-[#0B1120] text-slate-200 border-slate-700'}`}>
                      {c.status || 'draft'}
                    </span>
                  </td>
                </tr>
              )}) : (
                 <tr>
                    <td colSpan="6" className="p-12 text-center">
                       <div className="flex flex-col items-center justify-center opacity-50">
                          <CircleDollarSign className={`w-10 h-10 mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                          <span className={`font-bold text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No active tuition ledgers established.</span>
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
