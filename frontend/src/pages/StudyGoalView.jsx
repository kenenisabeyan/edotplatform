import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Target, TrendingUp, CalendarDays, Clock } from 'lucide-react';
import useThemeMode from '../hooks/useThemeMode';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export default function StudyGoalView() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [newGoal, setNewGoal] = React.useState('');
  const queryClient = useQueryClient();

  const { data: goalData, isLoading } = useQuery({
    queryKey: ['studyGoalView'],
    queryFn: async () => {
      const { data } = await api.get('/study/weekly');
      return data.data || {};
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { 
    weeklyStudyData = [
      { name: 'Mon', hours: 0 }, { name: 'Tue', hours: 0 }, { name: 'Wed', hours: 0 },
      { name: 'Thu', hours: 0 }, { name: 'Fri', hours: 0 }, { name: 'Sat', hours: 0 }, { name: 'Sun', hours: 0 }
    ], 
    studyGoal = 10, 
    daysStudied = 0 
  } = goalData;

  const totalWeeklyHours = weeklyStudyData.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1);
  const progressPercentage = Math.min(100, Math.round((totalWeeklyHours / studyGoal) * 100));

  const handleSaveGoal = async () => {
    try {
      const goalNum = Number(newGoal);
      if (goalNum > 0) {
        await api.put('/settings', {
          common: { weeklyStudyGoal: goalNum }
        });
        queryClient.invalidateQueries(['studyGoalView']);
        setIsEditing(false);
        setNewGoal('');
      }
    } catch (err) {
      console.error('Failed to update goal', err);
      alert('Failed to update goal');
    }
  };

  return (
    <div className={`animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      <div className={`border-b pb-6 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <h1 className="text-3xl md:text-4xl font-display font-black flex items-center gap-3">
          <Target className="w-8 h-8 text-[#F97316]" />
          Weekly Study Goal
        </h1>
        <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Monitor your study habits, set targets, and keep your streak alive.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Goal Ring Card */}
        <Card hover={false} className={`p-8 rounded-[24px] border shadow-sm md:col-span-1 flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-[#0B1D3A]/50 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center w-full mb-6">
            <h3 className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Current Progress</h3>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={newGoal} 
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-16 px-2 py-1 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  placeholder={studyGoal}
                />
                <button onClick={handleSaveGoal} className="text-xs px-2 py-1 bg-emerald-500 text-white rounded-md font-bold hover:bg-emerald-600">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-xs px-2 py-1 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-md font-bold">Cancel</button>
              </div>
            ) : (
              <button 
                onClick={() => { setIsEditing(true); setNewGoal(studyGoal.toString()); }}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${isDarkMode ? 'bg-[#1A2235] border-slate-700 text-slate-300 hover:text-[#F97316] hover:border-[#F97316]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-[#F97316] hover:border-[#F97316]'}`}
              >
                Edit Goal
              </button>
            )}
          </div>
          <div className="relative w-36 h-36 shrink-0 mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke={isDarkMode ? '#1E293B' : '#F1F5F9'} strokeWidth="8" fill="transparent" />
              <circle 
                cx="50" cy="50" r="40" stroke="#10B981" strokeWidth="8" fill="transparent" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 40} strokeDashoffset={(2 * Math.PI * 40) - (progressPercentage / 100) * (2 * Math.PI * 40)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
              <span className={`text-3xl font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalWeeklyHours}</span>
              <span className={`text-[10px] mt-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>/ {studyGoal} HOURS</span>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold w-max">
            {progressPercentage}% Completed
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <Card hover={false} className={`p-8 rounded-[24px] border shadow-sm flex flex-col justify-center ${isDarkMode ? 'bg-[#0B1120]/50 border-white/10' : 'bg-white border-slate-200'}`}>
             <div className="flex items-center gap-4 mb-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-100'}`}>
                 <TrendingUp className="w-6 h-6 text-[#F97316]" />
               </div>
               <div>
                 <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Study Streak</p>
                 <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{daysStudied} Days</h2>
               </div>
             </div>
             <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>You've studied for {daysStudied} days this week. Keep the momentum going!</p>
           </Card>

           <Card hover={false} className={`p-8 rounded-[24px] border shadow-sm flex flex-col justify-center ${isDarkMode ? 'bg-[#0B1120]/50 border-white/10' : 'bg-white border-slate-200'}`}>
             <div className="flex items-center gap-4 mb-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                 <Clock className="w-6 h-6 text-blue-500" />
               </div>
               <div>
                 <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Average Time</p>
                 <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{daysStudied > 0 ? (totalWeeklyHours / daysStudied).toFixed(1) : 0} Hrs/Day</h2>
               </div>
             </div>
             <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Your average daily study session length.</p>
           </Card>
        </div>
      </div>

      {/* Chart Section */}
      <Card hover={false} className={`p-8 rounded-[24px] border shadow-sm mt-8 ${isDarkMode ? 'bg-[#0B1120]/50 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-8">
           <h3 className={`text-[17px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>This Week's Activity</h3>
           <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
             <CalendarDays className="w-4 h-4" /> This Week
           </div>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStudyData} margin={{ top: 20, right: 0, left: -25, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#ffffff' : '#000000'} strokeOpacity={0.05} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
              <RechartsTooltip cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: isDarkMode ? '#1E293B' : '#fff', color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold'}} />
              <Bar dataKey="hours" name="Hours" radius={[6, 6, 0, 0]}>
                {weeklyStudyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.hours > 0 ? '#10B981' : (isDarkMode ? '#1E293B' : '#F1F5F9')} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
