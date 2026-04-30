import React, { useEffect, useState } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { Award, Star } from 'lucide-react';

export default function ProudMomentsFeed() {
  const isDarkMode = useThemeMode();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { data } = await api.get('/achievements/children');
        setAchievements(data.data || []);
      } catch (err) {
        console.error('Failed to fetch proud moments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div></div>;
  }

  if (achievements.length === 0 || achievements.every(ach => ach.badges.length === 0)) {
    return (
      <div className={`bg-transparent/50 rounded-2xl border p-8 text-center flex flex-col items-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
         <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-3">
           <Award className="w-6 h-6 text-amber-300" />
         </div>
         <p className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No proud moments yet.</p>
         <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>When instructors award badges, they'll shine here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {achievements.map((ach, idx) => {
        if (!ach.badges || ach.badges.length === 0) return null;
        return (
          <div key={idx} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6 shadow-sm">
            <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
              <Star className="text-amber-500 w-5 h-5"/> 
              {ach.user?.name}'s Showcase
            </h4>
            <div className="grid gap-3">
              {ach.badges.map((badge, bIdx) => (
                <div key={bIdx} className="glass-card/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5"/>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-100">{badge.title}</h5>
                    <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{badge.description}</p>
                    <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-100/50 inline-block px-2 py-0.5 rounded-md">{new Date(badge.earnedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  );
}
