import React, { useEffect, useState } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { PlusCircle, Search, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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
            {courses.map((course) => (
              <div 
                key={course.id} 
                className={`backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col md:flex-row p-6 items-start md:items-center gap-6 hover:border-[#00D4FF]/30 transition-all relative group ${isDarkMode ? 'bg-[#0B1120]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4FF] opacity-5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <img 
                  src={course.thumbnail === 'default-course.jpg' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80' : course.thumbnail} 
                  alt={course.title} 
                  className="w-full md:w-48 h-48 md:h-32 object-cover rounded-2xl bg-[#0B1120] shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" 
                />
                
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
            ))}
          </div>
      )}
    </div>
  );
}
