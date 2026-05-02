import React from 'react';
import useThemeMode from '../../hooks/useThemeMode';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function SummaryCard({ title, value, percentage, isPositive, icon: Icon, colorTheme = 'blue', onClick }) {
  const isDarkMode = useThemeMode();
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600 text-blue-400 bg-blue-500/100/10',
    green: 'from-[#00D4FF] to-[#0099CC] text-[#F97316] bg-[#F97316]/10',
    gold: 'from-[#F97316] to-orange-600 text-[#F97316] bg-[#F97316]/10',
    purple: 'from-purple-500 to-fuchsia-600 text-purple-400 bg-purple-500/100/10',
    orange: 'from-orange-500 to-amber-600 text-orange-400 bg-orange-500/10',
  };
  const theme = colorClasses[colorTheme] || colorClasses.blue;
  const gradient = theme.split(' text-')[0];
  const textBg = 'text-' + theme.split(' text-')[1];

  return (
    <div 
      onClick={onClick}
      className={`/90 backdrop-blur-xl rounded-3xl p-6 border shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${onClick ? 'cursor-pointer hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:-translate-y-1' : ''} ${isDarkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white border-slate-200'}`}
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${gradient} rounded-full opacity-10 group-hover:opacity-30 blur-2xl transition-opacity`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${textBg} transition-transform group-hover:scale-110 duration-300 border ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{title}</h3>
        </div>
        {percentage && (
           <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-md   shadow-sm ${isPositive ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-[#E30A17]/20 text-[#E30A17]'}`}>
             {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
             {percentage}%
           </div>
        )}
      </div>
      <div className="flex justify-between items-end relative z-10 mt-2">
        <h2 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</h2>
      </div>
    </div>
  );
}
