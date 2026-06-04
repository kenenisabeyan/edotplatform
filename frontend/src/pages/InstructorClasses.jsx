import React, { useEffect, useState } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { PlusCircle, Search, BookOpen, Globe, Calculator, Rocket, Target, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import CourseFallbackThumbnail from '../components/CourseFallbackThumbnail';

const CATEGORY_MAP = {
  "Social Science": {
    color: "#F97316", // Orange
    gradient: "from-orange-500/20 to-orange-600/10",
    bannerGradient: "from-orange-500 to-red-600",
    badgeBg: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(249,115,22,0.15)] hover:border-orange-500/40",
    buttonHover: "hover:bg-orange-500 hover:text-white hover:border-orange-500",
    icon: Globe
  },
  "Mathematics & Natural Science": {
    color: "#3B82F6", // Blue
    gradient: "from-blue-500/20 to-blue-600/10",
    bannerGradient: "from-blue-600 to-indigo-700",
    badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(59,130,246,0.15)] hover:border-blue-500/40",
    buttonHover: "hover:bg-blue-500 hover:text-white hover:border-blue-500",
    icon: Calculator
  },
  "Natural Language": {
    color: "#A855F7", // Purple
    gradient: "from-purple-500/20 to-purple-600/10",
    bannerGradient: "from-purple-600 to-pink-700",
    badgeBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(168,85,247,0.15)] hover:border-purple-500/40",
    buttonHover: "hover:bg-purple-500 hover:text-white hover:border-purple-500",
    icon: BookOpen
  },
  "Programming & Technology": {
    color: "#6366F1", // Indigo
    gradient: "from-indigo-500/20 to-indigo-600/10",
    bannerGradient: "from-indigo-600 to-violet-700",
    badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(99,102,241,0.15)] hover:border-indigo-500/40",
    buttonHover: "hover:bg-indigo-500 hover:text-white hover:border-indigo-500",
    icon: Rocket
  },
  "Business & Entrepreneurship": {
    color: "#FFD700", // Gold
    gradient: "from-amber-400/20 to-amber-600/10",
    bannerGradient: "from-amber-400 to-amber-600",
    badgeBg: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(255,215,0,0.15)] hover:border-amber-400/40",
    buttonHover: "hover:bg-[#FFD700] hover:text-slate-900 hover:border-[#FFD700]",
    icon: Target
  },
  "Personal Development": {
    color: "#22C55E", // Green
    gradient: "from-emerald-500/20 to-emerald-600/10",
    bannerGradient: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    hoverGlow: "hover:shadow-[0_15px_30px_rgba(34,197,94,0.15)] hover:border-emerald-500/40",
    buttonHover: "hover:bg-emerald-500 hover:text-slate-900 hover:border-emerald-500",
    icon: UserCheck
  }
};

const DEFAULT_CAT = {
  color: "#94A3B8",
  gradient: "from-slate-500/20 to-slate-600/10",
  bannerGradient: "from-slate-600 to-slate-800",
  badgeBg: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  hoverGlow: "hover:shadow-[0_15px_30px_rgba(148,163,184,0.15)] hover:border-slate-500/40",
  buttonHover: "hover:bg-slate-500 hover:text-white hover:border-slate-500",
  icon: BookOpen
};

const normalizeCategory = (cat) => {
  const c = cat?.toLowerCase() || '';
  if (c.includes('social')) return 'Social Science';
  if (c.includes('math') || c.includes('science')) return 'Mathematics & Natural Science';
  if (c.includes('language')) return 'Natural Language';
  if (c.includes('programming') || c.includes('tech')) return 'Programming & Technology';
  if (c.includes('business') || c.includes('entrepreneur')) return 'Business & Entrepreneurship';
  if (c.includes('personal') || c.includes('growth') || c.includes('development')) return 'Personal Development';
  return 'General Overview';
};

export default function InstructorClasses() {
  const isDarkMode = useThemeMode();
  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: async () => {
      const { data } = await api.get('/instructor/courses');
      return data.data || [];
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`w-12 h-12 border-4 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-none w-full">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <BookOpen className="w-8 h-8 text-[#00D4FF]" />
            My Classes
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Manage and edit your active courses and classes.</p>
        </div>
        <Link to="/dashboard/builder" className={`inline-flex items-center gap-2 px-6 py-3 font-black rounded-full hover:-translate-y-0.5 transition-transform bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <PlusCircle className="w-4 h-4" /> Create New Course
        </Link>
      </div>

      {courses.length === 0 ? (
          <div className={`bg-[#0B1120]/50 backdrop-blur-xl p-12 text-center rounded-3xl border-2 border-dashed shadow-sm flex flex-col items-center justify-center ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-[#0B1120]/5 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
              <Search className="w-10 h-10" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No classes yet</h3>
            <p className={`max-w-sm mb-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Create your first course to start teaching.</p>
            <Link to="/dashboard/builder" className={`px-8 py-3.5 font-black text-xs rounded-full hover:-translate-y-0.5 transition-transform bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Create Course
            </Link>
          </div>
      ) : (
          <div className="grid grid-cols-1 gap-6">
            {courses.map((course) => {
              const normalized = normalizeCategory(course.mainCategory || course.category);
              const catInfo = CATEGORY_MAP[normalized] || DEFAULT_CAT;
              const IconComponent = catInfo.icon;
              
              return (
                <div 
                  key={course.id} 
                  className={`backdrop-blur-xl rounded-[32px] border shadow-2xl overflow-hidden flex flex-col md:flex-row p-6 items-start md:items-center gap-6 hover:border-[#00D4FF]/30 transition-all relative group ${isDarkMode ? 'bg-[#0B1120]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}
                  style={{
                    borderTop: `6px solid ${catInfo.color}`
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4FF] opacity-5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                  
                  {/* Thumbnail / Fallback Gradient Banner */}
                  <div className="w-full md:w-48 h-48 md:h-40 rounded-2xl bg-[#0B1120] shrink-0 overflow-hidden relative flex items-center justify-center">
                    {course.thumbnail && course.thumbnail !== 'default-course.jpg' ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-500" 
                      />
                    ) : (
                      <CourseFallbackThumbnail 
                        color={catInfo.color} 
                        darkColor={catInfo.color} 
                        ribbon={course.mainCategory} 
                        fallbackId={course.id} 
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 w-full relative z-10">
                    <h3 className={`text-xl font-bold leading-snug mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{course.title}</h3>
                    <div className="flex items-center gap-4 mb-4 text-[10px] font-black  ">
                      <span className={`px-3 py-1.5 rounded-sm border ${
                          course.status === 'approved' ? 'bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/30' :
                          course.status === 'pending' ? 'bg-[#00D4FF]/100/20 text-[#00D4FF] border-[#00D4FF]/30' :
                          course.status === 'rejected' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                          'bg-[#0B1120]/5 text-slate-200 border-white/10'
                      }`}>
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                      <span className={isDarkMode ? 'text-slate-300' : 'text-slate-500'}>•</span>
                      <span className={isDarkMode ? 'text-slate-200' : 'text-slate-600'}>{course.totalStudents || 0} Students</span>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto md:pl-6 md:border-l md:border-white/10 shrink-0 pt-4 md:pt-0 relative z-10">
                    <Link 
                      to={`/dashboard/builder/${course.id}`} 
                      className={`w-full inline-flex justify-center items-center gap-2 px-6 py-3 font-black rounded-full border transition-colors drop-shadow-md bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                    >
                      Edit Course
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
      )}
    </div>
  );
}
