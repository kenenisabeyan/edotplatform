import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Globe, ShoppingCart, Calculator, BookOpen, Rocket, Target, UserCheck, Moon, Sun } from 'lucide-react';
const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';
import PackageCard from '../components/student/PackageCard';
import ThemeDropdown from '../components/ThemeDropdown';
import useThemeMode from '../hooks/useThemeMode';
import { PACKAGES } from '../constants/packages';



export default function StudentCourses() {
  const navigate = useNavigate();
  const isDarkMode = useThemeMode();
  const { data: enrolledCourses = [] } = useQuery({
    queryKey: ['studentEnrollments'],
    queryFn: async () => {
      const { data } = await api.get('/student/enrollments');
      return data.data || [];
    }
  });

  const { data: dbCourses = [] } = useQuery({
    queryKey: ['allCourses'],
    queryFn: async () => {
      const { data } = await api.get('/courses', { params: { limit: 100 } });
      return data.courses || [];
    }
  });

  return (
    <div className={`min-h-screen relative font-sans animate-in fade-in duration-500 z-0 flex flex-col ${isDarkMode ? 'bg-[#0B1120] text-slate-200' : 'bg-[#FAFAFA] text-slate-700'}`}>
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeDropdown />
      </div>

      {/* Theme-Aware Header area behind courses */}
      <div className={`absolute top-0 left-0 right-0 h-40 -z-10 overflow-hidden flex items-start border-b transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-r from-slate-800 to-[#0B1120] border-slate-700' : 'bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] border-blue-200'}`}>
         <div className="absolute right-0 top-0 w-1/3 h-full opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="10" y1="10" x2="100" y2="80" stroke={isDarkMode ? "#475569" : "#1e3a8a"} strokeWidth="1" />
              <line x1="100" y1="80" x2="200" y2="40" stroke={isDarkMode ? "#475569" : "#1e3a8a"} strokeWidth="1" />
              <line x1="50" y1="50" x2="150" y2="20" stroke={isDarkMode ? "#475569" : "#1e3a8a"} strokeWidth="1" />
              <circle cx="10" cy="10" r="3" fill={isDarkMode ? "#475569" : "#1e3a8a"} />
              <circle cx="100" cy="80" r="4" fill={isDarkMode ? "#475569" : "#1e3a8a"} />
              <circle cx="200" cy="40" r="3" fill={isDarkMode ? "#475569" : "#1e3a8a"} />
              <circle cx="50" cy="50" r="3" fill={isDarkMode ? "#475569" : "#1e3a8a"} />
              <circle cx="150" cy="20" r="3" fill={isDarkMode ? "#475569" : "#1e3a8a"} />
            </svg>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 pt-1">
        
        <div className="mb-10 text-white/90">
           <span className="text-sm font-medium tracking-tight">Explore our courses below</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
          {PACKAGES.map((pkg, idx) => {
            const pkgCategoryName = pkg.title.replace(' Courses', '');
            const pkgCourses = dbCourses.filter(c => c.mainCategory === pkgCategoryName);
            
            // Filter to only include active/completed enrollments
            const activeEnrollments = enrolledCourses.filter(e => e.status === 'active' || e.status === 'completed' || e.completed);
            
            const enrolledInPkg = activeEnrollments.filter(enrollment => 
              pkgCourses.some(pc => pc.id === (enrollment.course?.id || enrollment.courseId))
            );
            
            const isPkgEnrolled = enrolledInPkg.length > 0;
            
            return (
              <PackageCard key={idx} pkg={{...pkg, courses: pkgCourses}} isEnrolled={isPkgEnrolled} enrolledCoursesData={enrolledInPkg} isDarkMode={isDarkMode} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
