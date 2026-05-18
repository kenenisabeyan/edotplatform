import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Target, TrendingUp, CalendarDays, Clock, CheckCircle2, Circle, Trash2, Plus } from 'lucide-react';
import useThemeMode from '../hooks/useThemeMode';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export default function StudyGoalView() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [goalTab, setGoalTab] = React.useState('weekly');
  const [todoTab, setTodoTab] = React.useState('daily');
  const [isEditing, setIsEditing] = React.useState(false);
  const [newGoal, setNewGoal] = React.useState('');
  
  const [goals, setGoals] = React.useState({ daily: 2, weekly: 10, monthly: 40, yearly: 480 });
  const [todos, setTodos] = React.useState([
    { id: 1, text: 'Review React Context API', completed: true, category: 'weekly' },
    { id: 2, text: 'Complete Math Assignment', completed: false, category: 'weekly' },
    { id: 3, text: 'Watch History Video', completed: false, category: 'daily' },
    { id: 4, text: 'Read 2 chapters of Biology', completed: false, category: 'daily' },
    { id: 5, text: 'Finish React Final Project', completed: false, category: 'monthly' },
    { id: 6, text: 'Master Frontend Engineering', completed: false, category: 'yearly' }
  ]);
  const [newTodo, setNewTodo] = React.useState('');

  const { data: goalData, isLoading } = useQuery({
    queryKey: ['studyGoalView'],
    queryFn: async () => {
      const { data } = await api.get('/study/weekly');
      return data.data || {};
    }
  });

  React.useEffect(() => {
    if (goalData?.studyGoal) {
      setGoals(prev => ({ ...prev, weekly: goalData.studyGoal }));
    }
  }, [goalData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { 
    weeklyStudyData = [
      { name: 'Mon', hours: 0 }, { name: 'Tue', hours: 0 }, { name: 'Wed', hours: 0 },
      { name: 'Thu', hours: 0 }, { name: 'Fri', hours: 0 }, { name: 'Sat', hours: 0 }, { name: 'Sun', hours: 0 }
    ], 
    daysStudied = 0 
  } = goalData || {};

  const totalWeeklyHours = Number(weeklyStudyData.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1));
  const dailyHours = daysStudied > 0 ? Number((totalWeeklyHours / 7).toFixed(1)) : 0;
  const monthlyHours = Number((totalWeeklyHours * 4.2).toFixed(1)); // Approximate
  const yearlyHours = Number((monthlyHours * 12).toFixed(1));

  let currentGoal = goals[goalTab];
  let currentHours = goalTab === 'daily' ? dailyHours : (goalTab === 'weekly' ? totalWeeklyHours : (goalTab === 'monthly' ? monthlyHours : yearlyHours));
  
  const progressPercentage = Math.min(100, Math.round((currentHours / currentGoal) * 100));

  const handleSaveGoal = async () => {
    try {
      const goalNum = Number(newGoal);
      if (goalNum > 0) {
        setGoals(prev => ({ ...prev, [goalTab]: goalNum }));
        if (goalTab === 'weekly') {
          await api.put('/settings', {
            common: { weeklyStudyGoal: goalNum }
          });
          queryClient.invalidateQueries(['studyGoalView']);
        }
        setIsEditing(false);
        setNewGoal('');
      }
    } catch (err) {
      console.error('Failed to update goal', err);
      alert('Failed to update goal');
    }
  };

  const currentTodos = todos.filter(t => t.category === todoTab);

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };
  
  const addTodo = (e) => {
    if (e.key === 'Enter' && newTodo.trim()) {
      setTodos([{ id: Date.now(), text: newTodo, completed: false, category: todoTab }, ...todos]);
      setNewTodo('');
    }
  };
  
  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className={`animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      <div className={`border-b pb-6 mb-8 flex justify-between items-end ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black flex items-center gap-3">
            <Target className="w-8 h-8 text-[#00D4FF]" />
            Study Goals
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Monitor your study habits, manage to-do lists, and track daily/weekly/monthly goals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Goal Ring Card */}
        <Card hover={false} className={`relative overflow-hidden p-8 rounded-[24px] border shadow-sm md:col-span-1 flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-[#0B1D3A]/50 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="w-full mb-6">
            <div className={`flex items-center justify-center rounded-xl p-1.5 mb-6 border ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-slate-100 border-slate-200/50'}`}>
              {['daily', 'weekly', 'monthly', 'yearly'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setGoalTab(tab); setIsEditing(false); }}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-lg capitalize transition-all duration-300 ${goalTab === tab ? 'bg-gradient-to-r from-[#00D4FF] to-[#00D4FF] text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)]' : (isDarkMode ? 'text-slate-400 hover:text-[#00D4FF]' : 'text-slate-500 hover:text-[#00D4FF]')}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between items-center w-full relative">
              <h3 className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{goalTab.charAt(0).toUpperCase() + goalTab.slice(1)} Progress</h3>
              {!isEditing && (
                <button 
                  onClick={() => { setIsEditing(true); setNewGoal(currentGoal.toString()); }}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${isDarkMode ? 'bg-[#1A2235] border-slate-700 text-slate-300 hover:text-[#00D4FF] hover:border-[#00D4FF]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-[#00D4FF] hover:border-[#00D4FF]'}`}
                >
                  Edit
                </button>
              )}
            </div>
            
            {isEditing && (
              <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-6 rounded-[24px] backdrop-blur-md ${isDarkMode ? 'bg-[#0B1D3A]/95 border border-slate-700/50' : 'bg-white/95 border border-slate-200/50'}`}>
                 <h4 className={`text-lg font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Set {goalTab} Goal</h4>
                 <p className={`text-[11px] mb-6 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>TARGET HOURS PER {goalTab.toUpperCase()}</p>
                 <div className="flex items-center gap-3 mb-6 w-full max-w-[200px]">
                   <input 
                     type="number" 
                     value={newGoal} 
                     onChange={(e) => setNewGoal(e.target.value)}
                     className={`flex-1 text-center text-2xl font-black py-3 rounded-xl border-2 focus:outline-none focus:border-[#00D4FF] focus:ring-4 focus:ring-[#00D4FF]/20 transition-all ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                   />
                   <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>HRS</span>
                 </div>
                 <div className="flex gap-3 w-full max-w-[200px]">
                   <button onClick={() => setIsEditing(false)} className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                   <button onClick={handleSaveGoal} className="flex-1 py-2.5 rounded-xl font-bold text-[13px] text-white bg-gradient-to-r from-[#00D4FF] to-[#00D4FF] shadow-[0_4px_12px_rgba(0,212,255,0.3)] hover:shadow-[0_6px_16px_rgba(0,212,255,0.4)] transition-all">Save</button>
                 </div>
              </div>
            )}
          </div>

          <div className="relative w-36 h-36 shrink-0 mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D4FF" />
                  <stop offset="100%" stopColor="#00D4FF" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="40" stroke={isDarkMode ? '#1E293B' : '#F1F5F9'} strokeWidth="8" fill="transparent" />
              <circle 
                cx="50" cy="50" r="40" stroke="url(#brandGradient)" strokeWidth="8" fill="transparent" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 40} strokeDashoffset={(2 * Math.PI * 40) - (progressPercentage / 100) * (2 * Math.PI * 40)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
              <span className={`text-3xl font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentHours}</span>
              <span className={`text-[10px] mt-1 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>/ {currentGoal} HOURS</span>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold w-max shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.8)]"></div>
            {progressPercentage}% Completed
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <Card hover={false} className={`relative overflow-hidden p-8 rounded-[24px] border shadow-sm flex flex-col justify-between ${isDarkMode ? 'bg-[#0B1D3A]/50 border-white/10' : 'bg-white border-slate-200'}`}>
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
               <TrendingUp className="w-24 h-24 text-[#00D4FF]" />
             </div>
             <div>
               <div className="flex items-center gap-3 mb-6">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${isDarkMode ? 'bg-[#00D4FF]/20 border-[#00D4FF]/30' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'}`}>
                   <TrendingUp className="w-5 h-5 text-[#00D4FF]" />
                 </div>
                 <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Study Streak</p>
               </div>
               <div className="flex items-end gap-2 mb-2">
                 <h2 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{daysStudied}</h2>
                 <span className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Days</span>
               </div>
               <p className={`text-xs font-medium mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>You've studied for {daysStudied} days this week. Keep the momentum going!</p>
             </div>
             
             <div className="flex justify-between items-center w-full gap-1">
               {weeklyStudyData.map((day, i) => (
                 <div key={i} className="flex flex-col items-center gap-2">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${day.hours > 0 ? 'bg-gradient-to-r from-[#00D4FF] to-[#00D4FF] text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)]' : (isDarkMode ? 'bg-slate-800 text-slate-500 border border-slate-700' : 'bg-slate-100 text-slate-400 border border-slate-200')}`}>
                     {day.hours > 0 ? '✓' : ''}
                   </div>
                   <span className={`text-[9px] font-bold uppercase ${day.hours > 0 ? (isDarkMode ? 'text-[#00D4FF]' : 'text-[#00D4FF]') : (isDarkMode ? 'text-slate-600' : 'text-slate-400')}`}>{day.name}</span>
                 </div>
               ))}
             </div>
           </Card>

           <Card hover={false} className={`relative overflow-hidden p-8 rounded-[24px] border shadow-sm flex flex-col justify-between ${isDarkMode ? 'bg-[#0B1D3A]/50 border-white/10' : 'bg-white border-slate-200'}`}>
             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
               <Clock className="w-24 h-24 text-[#00D4FF]" />
             </div>
             <div>
               <div className="flex items-center gap-3 mb-6">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${isDarkMode ? 'bg-cyan-500/20 border-cyan-500/30' : 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200'}`}>
                   <Clock className="w-5 h-5 text-[#00D4FF]" />
                 </div>
                 <p className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Average Time</p>
               </div>
               <div className="flex items-end gap-2 mb-2">
                 <h2 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{daysStudied > 0 ? (totalWeeklyHours / daysStudied).toFixed(1) : 0}</h2>
                 <span className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hrs/Day</span>
               </div>
               <p className={`text-xs font-medium mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your average daily study session length based on active days.</p>
             </div>
             
             <div className="w-full">
               <div className="flex justify-between text-[10px] font-bold mb-2">
                 <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Daily Goal Progress</span>
                 <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{goals.daily} Hrs</span>
               </div>
               <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-200'}`}>
                 <div 
                   className="h-full bg-gradient-to-r from-[#00D4FF] to-[#00D4FF] rounded-full relative"
                   style={{ width: `${Math.min(100, ((daysStudied > 0 ? (totalWeeklyHours / daysStudied) : 0) / goals.daily) * 100)}%` }}
                 >
                   <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                 </div>
               </div>
             </div>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <Card hover={false} className={`lg:col-span-2 p-8 rounded-[24px] border shadow-sm ${isDarkMode ? 'bg-[#0B1120]/50 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-8">
             <h3 className={`text-[17px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Activity Performance</h3>
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

        {/* To-Do List */}
        <Card hover={false} className={`lg:col-span-1 p-8 rounded-[24px] border shadow-sm flex flex-col ${isDarkMode ? 'bg-[#0B1120]/50 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-start mb-6">
             <h3 className={`text-[17px] font-bold flex flex-col gap-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Study To-Do List
               <span className="text-[11px] font-medium text-slate-500">Manage your tasks by category</span>
             </h3>
             <span className="text-xs font-bold px-3 py-1 rounded-full text-white bg-gradient-to-r from-[#00D4FF] to-[#00D4FF] shadow-[0_2px_10px_rgba(0,212,255,0.2)]">
               {currentTodos.filter(t => t.completed).length}/{currentTodos.length} Done
             </span>
          </div>

          <div className={`flex items-center justify-center rounded-xl p-1 mb-6 border ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-slate-100 border-slate-200/50'}`}>
             {['daily', 'weekly', 'monthly', 'yearly'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTodoTab(tab)}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-lg capitalize transition-all duration-300 ${todoTab === tab ? 'bg-gradient-to-r from-[#00D4FF] to-[#00D4FF] text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)]' : (isDarkMode ? 'text-slate-400 hover:text-[#00D4FF]' : 'text-slate-500 hover:text-[#00D4FF]')}`}
                >
                  {tab}
                </button>
             ))}
          </div>
          
          <div className="relative mb-6">
            <input 
              type="text" 
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={addTodo}
              placeholder="Add a new study task..."
              className={`w-full pl-4 pr-10 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50 focus:border-[#00D4FF]/50 transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
            <button 
              onClick={() => addTodo({ key: 'Enter' })} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00D4FF] transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {currentTodos.map(todo => (
              <div 
                key={todo.id} 
                className={`group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${todo.completed ? (isDarkMode ? 'bg-slate-800/30 border-slate-800/50 opacity-70' : 'bg-slate-50 border-slate-100 opacity-70') : (isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300')}`}
                onClick={() => toggleTodo(todo.id)}
              >
                <div className="mt-0.5 shrink-0">
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00D4FF] drop-shadow-[0_0_5px_rgba(0,212,255,0.5)]" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 group-hover:text-[#00D4FF] transition-colors" />
                  )}
                </div>
                <p className={`flex-1 text-sm font-medium transition-all ${todo.completed ? (isDarkMode ? 'text-slate-500 line-through' : 'text-slate-400 line-through') : (isDarkMode ? 'text-slate-200' : 'text-slate-700')}`}>
                  {todo.text}
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-red-400' : 'hover:bg-slate-100 text-slate-400 hover:text-red-500'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {currentTodos.length === 0 && (
              <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400 font-medium">
                No tasks yet for {goalTab}. Add one above!
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
