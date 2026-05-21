import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Award, Star, Zap, Target } from 'lucide-react';
import useThemeMode from '../hooks/useThemeMode';

export default function AchievementsView() {
  const isDarkMode = useThemeMode();

  const { data: achievementsData, isLoading } = useQuery({
    queryKey: ['achievementsView'],
    queryFn: async () => {
      const { data } = await api.get('/achievements');
      return data.data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const achievements = Array.isArray(achievementsData) ? achievementsData : [];

  return (
    <div className={`animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-none w-full ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      <div className={`border-b pb-6 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <h1 className="text-3xl md:text-4xl font-display font-black flex items-center gap-3">
          <Award className="w-8 h-8 text-[#00D4FF]" />
          My Achievements
        </h1>
        <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Track your learning milestones and badges earned through your courses.
        </p>
      </div>

      {achievements.length === 0 ? (
        <div className={`p-10 text-center rounded-2xl border-2 border-dashed ${isDarkMode ? 'border-white/10 bg-[#0B1120]/50 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
          <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold mb-2">No Achievements Yet</h3>
          <p className="text-sm">Complete courses and participate in activities to earn your first badge!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {achievements.map((ach, i) => {
            const IconComponent = typeof ach.icon === 'string'
              ? ({ Award, Star, Zap, Target }[ach.icon] || Award)
              : (ach.icon || Award);

            return (
              <div key={i} className={`flex flex-col items-center text-center p-6 md:p-8 rounded-[24px] border shadow-sm transition-transform hover:-translate-y-1 ${isDarkMode ? ach.darkBg + ' border-white/5' : ach.lightBg + ' border-slate-100' || 'bg-slate-50 border-slate-200'}`}>
                <div className="relative mb-6 flex items-center justify-center">
                  {/* Glowing Aura */}
                  <div className="absolute inset-0 blur-2xl opacity-40 scale-150" style={{ backgroundColor: ach.color || '#00D4FF' }}></div>
                  
                  {/* Hexagon Badge */}
                  <div className={`w-[80px] h-[90px] relative flex items-center justify-center`} style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    background: `linear-gradient(135deg, ${ach.color || '#00D4FF'} 0%, ${isDarkMode ? '#0B1D3A' : '#ffffff'} 100%)`
                  }}>
                    <div className={`w-[74px] h-[84px] flex items-center justify-center relative z-10`} style={{
                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      backgroundColor: isDarkMode ? '#1E293B' : '#ffffff'
                    }}>
                      <IconComponent className="w-8 h-8 relative z-20" style={{ color: ach.color || '#00D4FF' }} />
                    </div>
                  </div>
                </div>
                
                <h4 className="text-[15px] font-black leading-tight mb-2 tracking-tight">{ach.title}</h4>
                <p className={`text-[12px] font-semibold leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{ach.desc}</p>
                <div className="mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${ach.color || '#00D4FF'}20`, color: ach.color || '#00D4FF' }}>
                  {ach.date}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
