import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  Users, BookOpen, ArrowRight, Search, Filter, Shield, 
  Zap, Star, Target, Rocket, ChevronDown, ChevronRight, Clock, PlayCircle,
  Globe, Calculator, UserCheck, LayoutGrid, Check, CheckCircle, Briefcase, GraduationCap
} from 'lucide-react';

import CTA from '../components/CTA';
const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';
const kenosHero = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/puh8cqwax9ahjfdyyhwm';
import useThemeMode from '../hooks/useThemeMode';

import COURSE_CATEGORIES, { MAIN_CATEGORIES } from '../constants/courseCategories';

const CATEGORY_DETAILS = {
  "Social Science": {
    icon: Globe,
    color: "#F97316", // Orange
    darkColor: "#C2410C",
    ribbon: "SOCIAL SCIENCE",
    description: "This curriculum path is designed to enable learners to travel inside human society, increasing awareness to grow understanding of history, behavior, and structural consciousness.",
    coursesCount: "120+"
  },
  "Mathematics & Natural Science": {
    icon: Calculator,
    color: "#3B82F6", // Blue
    darkColor: "#1D4ED8",
    ribbon: "MATH & SCIENCE",
    description: "This training curriculum allows people to develop a step-by-step rigorous analytical system to build the required logic for the purpose, dreams, and advanced scientific goals they designed.",
    coursesCount: "150+"
  },
  "Natural Language": {
    icon: BookOpen,
    color: "#A855F7", // Purple
    darkColor: "#7E22CE",
    ribbon: "NATURAL LANGUAGE",
    description: "This language path is engineered to empower seamless global communication. The training lets learners balance their social, professional, and cultural interactions elegantly.",
    coursesCount: "90+"
  },
  "Programming & Technology": {
    icon: Rocket,
    color: "#6366F1", // Indigo
    darkColor: "#4338CA",
    ribbon: "PROGRAMMING",
    description: "This curriculum is the track to tech mastery. It's designed to create 'Aha' moments and increase awareness to grow into highly sought-after software architectures and development mindsets.",
    coursesCount: "250+"
  },
  "Business & Entrepreneurship": {
    icon: Target,
    color: "#F97316", // Yellow
    darkColor: "#CA8A04",
    ribbon: "BUSINESS",
    description: "This premium curriculum enables future leaders to navigate markets independently. It helps construct financial stability, leadership, and powerful entrepreneurial ecosystems.",
    coursesCount: "180+"
  },
  "Personal Development": {
    icon: UserCheck,
    color: "#22C55E", // Green
    darkColor: "#15803D",
    ribbon: "DEVELOPMENT",
    description: "This training empowers individuals to unlock self-mastery. Develop habits and physical, mental, and social goals that directly translate to long-term prosperity.",
    coursesCount: "110+"
  }
};

const CategoryHexagon = ({ cat, idx, translate, onClick }) => {
  const isDarkMode = useThemeMode();
  const details = CATEGORY_DETAILS[cat] || CATEGORY_DETAILS["Programming & Technology"];
  const Icon = details.icon;
  
  return (
    <button 
      onClick={onClick}
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center group hover:z-30 transition-all duration-300 z-10"
      style={{ 
         transform: translate, 
         clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' 
      }}
    >
       <div 
         className="w-[96%] h-[96%] m-auto flex items-center justify-center relative transition-transform duration-500 group-hover:scale-[1.03]" 
         style={{ backgroundColor: details.color, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
       >
          <div 
             className={`w-[97%] h-[97%] flex flex-col items-center justify-center relative p-2 md:p-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1120] hover:bg-[#1a1f2e]' : 'bg-white hover:bg-slate-50'}`}
             style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          >
             <div className="absolute top-0 left-0 w-full h-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             
             {/* Number wrapper */}
             <div className="flex items-center justify-center mb-1 md:mb-2 relative z-10 opacity-90 group-hover:opacity-100 transition-transform group-hover:scale-110">
                <span className="font-black text-2xl md:text-3xl drop-shadow-md" style={{ color: details.color }}>{`0${idx + 1}`}</span>
             </div>
             
             {/* Category Name */}
             <span className={`font-bold text-xs md:text-sm text-center leading-tight drop-shadow-sm group-hover:opacity-80 transition-opacity relative z-10 px-2 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {cat}
             </span>
             
             {/* Description */}
             <span className={`text-[8px] md:text-[10px] text-center leading-snug mt-1.5 md:mt-2 px-3 md:px-4 line-clamp-3 md:line-clamp-4 relative z-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {details.description}
             </span>
             
             {/* Courses Count */}
             <span className={`text-[9px] md:text-[10px] mt-1.5 md:mt-2 font-bold relative z-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} style={{ color: isDarkMode ? undefined : details.color }}>
                {details.coursesCount} Courses
             </span>
          </div>
       </div>
    </button>
  );
};

const CentralEDOTLogo = () => {
  const isDarkMode = useThemeMode();
  return (
  <div className="flex flex-col items-center justify-center relative w-full h-full z-20 scale-[0.88] hover:scale-[0.93] transition-transform duration-500">
    <div className="absolute inset-0 bg-gradient-to-b from-[#F97316] to-[#F97316] opacity-30 blur-2xl rounded-full"></div>
    {/* Hexagon Shape */}
    <div 
       className="w-full h-full bg-gradient-to-b from-[#00D4FF] to-[#0099CC] shadow-[0_0_50px_rgba(0,212,255,0.6)] flex flex-col items-center justify-center p-[4px] relative z-10"
       style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
    >
       <div 
         className={`w-full h-full flex flex-col items-center justify-center relative ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}
         style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
       >
         {/* Inner geometric accent */}
         <div className={`absolute right-0 top-0 w-1/2 h-full bg-white/5 pointer-events-none border-l ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}></div>
         
         <div className="relative z-10 text-center flex flex-col items-center justify-center mt-3">
           <span className={`font-black text-2xl md:text-4xl tracking-[0.1em] drop-shadow-md pb-1 border-b-2 border-[#F97316] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>EDOT</span>
           <div className={`w-20 h-20 md:w-[120px] md:h-[120px] rounded-full mt-4 mx-auto shadow-xl flex items-center justify-center overflow-hidden border-[4px] ${isDarkMode ? 'bg-white border-[#0B1120]' : 'bg-white border-slate-100'}`}>
             <img src={edotLogo} alt="EDOT Hub" className="w-full h-full object-contain scale-90" />
           </div>
         </div>
       </div>
    </div>
  </div>
);
};

const CourseFallbackThumbnail = ({ color, darkColor, ribbon, fallbackId }) => {
  return (
    <div className="w-full h-full bg-[#030303] flex items-center justify-center overflow-hidden group">
       <div className="relative w-[260px] h-[220px] mx-auto origin-center">
         
         {/* Background Glow */}
         <div className="absolute w-[150px] h-[150px] rounded-full blur-[60px] opacity-30 top-[55px] left-[55px]" style={{ backgroundColor: color }}></div>

         {/* SVG Back Tails */}
         <div className="absolute inset-0 z-10 pointer-events-none transition-transform duration-500 group-hover:-translate-y-1">
           <svg width="100%" height="100%" viewBox="0 0 260 220" className="overflow-visible">
             <path d="M 50 115 L 20 75 L 0 90 L -20 75 L 10 115 Z" fill={darkColor || '#4338ca'} />
             <path d="M 210 115 L 240 75 L 260 90 L 280 75 L 250 115 Z" fill={darkColor || '#4338ca'} />
           </svg>
         </div>

         {/* 3D Metallic Rings */}
         <div className="absolute z-20 w-[160px] h-[160px] top-[50px] left-[50px] rounded-full border-[8px] opacity-60 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-105" 
              style={{ borderColor: color, borderTopColor: darkColor, borderBottomColor: darkColor }}></div>
         
         <div className="absolute z-20 w-[130px] h-[130px] top-[65px] left-[65px] rounded-full border-[4px] opacity-80 shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-transform duration-700 group-hover:scale-110" 
              style={{ borderColor: darkColor, borderLeftColor: color, borderRightColor: color }}></div>
         
         <div className="absolute z-20 w-[106px] h-[106px] top-[77px] left-[77px] rounded-full border-[6px] shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-95" 
              style={{ borderColor: color }}></div>

         {/* Curved Text (EDOT) */}
         <div className="absolute z-20 w-[160px] h-[160px] top-[50px] left-[50px]">
           <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
             <path id={`curve-fb-${fallbackId}`} d="M 25 50 A 25 25 0 0 0 75 50" fill="transparent" />
             <text className="text-[12px] font-black tracking-[0.3em]" style={{ fill: color }}>
               <textPath href={`#curve-fb-${fallbackId}`} startOffset="50%" textAnchor="middle" dominantBaseline="middle">
                 E D O T
               </textPath>
             </text>
           </svg>
         </div>

         {/* Center Logo Shield */}
         <div className="absolute z-30 top-[103px] left-[103px] w-[54px] h-[54px] bg-white rounded-full flex flex-col items-center justify-center shadow-[0_0_25px_rgba(0,0,0,0.9)] border-[3px] transition-transform duration-500 group-hover:scale-110" style={{ borderColor: color }}>
           <img src={edotLogo} alt="EDOT" className="w-[40px] h-[40px] object-contain rounded-full" onError={(e) => e.target.style.display='none'} />
         </div>

         {/* SVG Front Ribbon */}
         <div className="absolute inset-0 z-40 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] pointer-events-none transition-transform duration-500 group-hover:-translate-y-1">
           <svg width="100%" height="100%" viewBox="0 0 260 220" className="overflow-visible">
             <defs>
               <linearGradient id={`grad-fb-${fallbackId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor={darkColor || '#4338ca'} />
                 <stop offset="20%" stopColor={color || '#6366f1'} />
                 <stop offset="80%" stopColor={color || '#6366f1'} />
                 <stop offset="100%" stopColor={darkColor || '#4338ca'} />
               </linearGradient>
               <path id={`text-path-fb-${fallbackId}`} d="M 30 130 A 100 100 0 0 1 230 130" fill="transparent" />
             </defs>

             <polygon points="10,130 10,115 50,130" fill="#000000" />
             <polygon points="250,130 250,115 210,130" fill="#000000" />

             <path d="M 50 130 A 80 80 0 0 1 210 130 L 250 130 A 120 120 0 0 0 10 130 Z" fill={`url(#grad-fb-${fallbackId})`} />

             <text className="font-black text-[12.5px] uppercase" fill="#ffffff" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.6))' }}>
               <textPath href={`#text-path-fb-${fallbackId}`} startOffset="50%" textAnchor="middle" dominantBaseline="middle">
                 {ribbon || 'EDOT COURSE'}
               </textPath>
             </text>
           </svg>
         </div>

       </div>
    </div>
  );
};

const CoursePopover = ({ course, rect, onMouseEnter, onMouseLeave, isDarkMode }) => {
  if (!rect) return null;
  
  const categoryInfo = CATEGORY_DETAILS[course.mainCategory] || CATEGORY_DETAILS["Programming & Technology"];
  const catColor = categoryInfo.color;

  const isRightSide = rect.right + 350 > window.innerWidth;
  const leftPos = isRightSide ? rect.left - 330 : rect.right;
  // Adjust top position to align nicely with the card
  const topPos = rect.top - 20;

  return createPortal(
    <div 
      className={`fixed z-[100] w-[330px] border shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-lg p-5 animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'}`}
      style={{ top: topPos, left: leftPos }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
       {/* Theme Top Border inside Popover */}
       <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-lg z-50" style={{ backgroundColor: catColor }}></div>

       {/* Pointer arrow */}
       <div 
         className={`absolute w-4 h-4 rotate-45 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}
         style={{
           top: '50px',
           [isRightSide ? 'right' : 'left']: '-8px',
           borderTop: isRightSide ? `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none',
           borderRight: isRightSide ? `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none',
           borderBottom: isRightSide ? 'none' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
           borderLeft: isRightSide ? 'none' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
         }}
       />

       <h3 className={`text-[18px] font-bold leading-tight mb-2 mt-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
         {course.title}
       </h3>
       
       <div className="flex items-center gap-2 mb-2">
         {course.isBestseller !== false && (
           <span 
             className="text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider"
             style={{ backgroundColor: `${catColor}20`, color: catColor }}
           >
             Bestseller
           </span>
         )}
         <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
           Updated {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
         </span>
       </div>

       <div className={`text-xs mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
         {course.duration || '20.5'} total hours · {course.level || 'All Levels'} · Subtitles
       </div>

       <p className={`text-[13px] mb-4 line-clamp-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
         {course.description || `Dive deep into ${course.title} with the EDOT platform. This comprehensive course provides everything you need to succeed.`}
       </p>

       <ul className="space-y-3 mb-6">
         {(course.learningObjectives || [
           `Master the core concepts of ${course.mainCategory || 'this field'}`,
           "Build practical skills with real-world EDOT projects",
           "Earn an official certificate to boost your career"
         ]).slice(0, 3).map((item, i) => (
           <li key={i} className={`flex items-start gap-3 text-[13px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
             <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: catColor }} />
             <span className="leading-tight">{item}</span>
           </li>
         ))}
       </ul>

       <button 
         className={`w-full font-bold py-3 rounded-full transition-all hover:-translate-y-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
         style={{ backgroundColor: catColor, boxShadow: `0 8px 25px -4px ${catColor}80` }}
         onClick={(e) => { e.preventDefault(); e.stopPropagation(); alert('Enrolled in course!'); }}
       >
         Enroll Now
       </button>
    </div>,
    document.body
  );
};

const CourseCard = ({ course, setHoveredCourse, isDarkMode }) => {
  const categoryInfo = CATEGORY_DETAILS[course.mainCategory] || CATEGORY_DETAILS["Programming & Technology"];
  const catColor = categoryInfo.color;
  const CatIcon = categoryInfo.icon;

  const instructorName = course.instructor?.name || "EDOT Instructor";
  const rating = course.rating || 4.6;
  const reviewsCount = course.reviewsCount || "19,639";
  const currentPrice = course.price ? `$${course.price}` : '$10.99';
  const originalPrice = course.price ? `$${(parseFloat(course.price) * 1.5).toFixed(2)}` : '$59.99';
  const isBestseller = true; 
  const cardRef = useRef(null);
  let hoverTimeout = useRef(null);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setHoveredCourse({ course, rect });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoveredCourse(null);
  };

  return (
    <div 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full py-2" // Add some vertical padding so shadow isn't clipped
    >
      <Link 
        to={`/course/${course.id}`} 
        className={`group flex flex-col h-full border rounded-2xl overflow-hidden transition-all duration-300 w-full relative ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-100 hover:border-slate-200'}`}
        style={{ boxShadow: isHovered ? `0 8px 30px ${catColor}25` : (isDarkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.05)') }}
      >
        {/* Theme Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 z-50" style={{ backgroundColor: catColor || '#6366f1' }}></div>
        
        {/* Thumbnail */}
        {/* Thumbnail */}
        <div className="w-full h-[220px] relative overflow-hidden bg-[#030303]">
          <img 
            src={(course.thumbnail && !imgError && course.thumbnail !== 'default-course.jpg') ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail.startsWith('/') ? '' : '/'}${course.thumbnail}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            onError={(e) => { 
               if (!imgError) {
                 setImgError(true);
                 e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
               }
            }}
          />
        </div>

        {/* Content - Coursera Style */}
        <div className={`p-5 flex flex-col flex-1 relative z-10 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}>
          {/* Logo and Instructor */}
          <div className="flex items-center gap-3 mb-3">
             <div className="w-8 h-8 rounded bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 p-1 overflow-hidden shadow-sm">
                <img src={edotLogo} alt="EDOT" className="w-full h-full object-contain" />
             </div>
             <span className={`text-[13px] font-medium truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>EDOT Platform</span>
          </div>
          
          {/* Title */}
          <h3 
            className={`text-[16px] font-bold leading-snug line-clamp-2 mb-1 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
            style={{ color: isHovered ? catColor : undefined }}
          >
            {course.title}
          </h3>
          
          {/* Subtext */}
          <p className={`text-[13px] mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Course • {course.mainCategory || 'Technology'}</p>
          
          {/* Small Description */}
          <p className={`text-[13px] line-clamp-2 mb-4 leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-800'}`}>
            {course.description || `Comprehensive guide to mastering ${course.title}. Learn the core concepts and real-world applications in this complete EDOT course.`}
          </p>

          {/* Bottom Badge & Price */}
          <div className="mt-auto flex items-center justify-between">
             <span 
               className={`px-3 py-1 border rounded-full text-[12px] font-medium shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}
               style={{ 
                 borderColor: isHovered ? catColor : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'), 
                 color: isHovered ? catColor : (isDarkMode ? '#cbd5e1' : '#475569') 
               }}
             >
                Earn a certificate
             </span>
             <span className={`text-[15px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{currentPrice}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

const COURSE_TABS = MAIN_CATEGORIES;

export default function Courses() {
  const isDarkMode = useThemeMode();
  const [courses, setCourses] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(MAIN_CATEGORIES[0]);
  const scrollContainerRef = React.useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [hoveredCourseData, setHoveredCourseData] = useState(null);
  let globalHoverTimeout = useRef(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/courses/categorized');
        const statsMap = {};
        if (data && data.success && data.data) {
           data.data.forEach(s => {
             statsMap[s.mainCategory] = s;
           });
        }
        setCategoryStats(statsMap);
      } catch (err) {
        console.error('Failed to fetch category stats', err);
      }
    };
    fetchStats();
  }, []);

  const fetchCourses = async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = {
        page: isLoadMore ? page + 1 : 1,
        limit: 9, // Increased limit for grid
      };
      
      if (categoryFilter !== 'All') params.mainCategory = categoryFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const { data } = await api.get('/courses', { params });
      
      if (isLoadMore) {
        setCourses(prev => [...prev, ...data.courses]);
        setPage(page + 1);
      } else {
        setCourses(data.courses);
        setPage(1);
      }
      
      setTotalCount(data.total);
      setHasMore(data.currentPage < data.totalPages);
      setError('');
    } catch (err) {
      console.error('Failed to fetch courses', err);
      setError('Systems currently scaling. Please stand by or check connection.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCourses(false);
  }, [categoryFilter, debouncedSearch]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) fetchCourses(true);
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth > 1024 ? 900 : 320; // Scroll roughly a full view
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [courses]);


  return (
    <div style={{ backgroundColor: isDarkMode ? '#0B1120' : '#ffffff' }} className={`min-h-screen w-full font-sans overflow-x-hidden relative transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>


      {/* 1. HERO SECTION */}
      <section className={`relative w-full pt-40 pb-32 px-6 overflow-hidden flex flex-col items-center text-center border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
         {/* Premium CSS Background */}
         <div className={`absolute inset-0 z-0 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#FAFAFA]'}`}>
            <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]`}></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00D4FF]/10 dark:bg-[#00D4FF]/10 blur-[120px] rounded-full pointer-events-none"></div>
         </div>
         <div className="relative z-10 max-w-[1000px] mx-auto mt-8">
            <h1 className={`text-5xl md:text-6xl lg:text-[4.5rem] font-black mb-8 leading-[1.1] tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1A202C]'}`}>
               Explore Structured <br className="hidden md:block" />
               <span className="text-[#F97316] relative inline-block mt-2 whitespace-nowrap">
                  <span className="relative z-10">Learning Paths</span>
                  {/* Orange Underline */}
                  <div className="absolute w-full h-1.5 bottom-1 left-0 bg-[#F97316] z-0"></div>
               </span>
            </h1>
            <p className={`text-xl md:text-[20px] font-medium max-w-3xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
               From foundational education to advanced professional skills, EDOT provides guided learning designed for real progress and real outcomes.
            </p>
         </div>
      </section>

      {/* 2. LEARNING PHILOSOPHY */}
      <section className={`py-32 px-6 border-y ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="rounded-[40px] overflow-hidden shadow-2xl h-[400px] lg:h-[500px] relative border-8 border-white dark:border-[#111827]">
               <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80" alt="Students collaborating" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
               <div className="w-16 h-16 bg-[#F97316] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                  <Target className="w-8 h-8" />
               </div>
            <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Not Just Courses — Structured Learning</h2>
            <p className={`text-xl leading-relaxed mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
               EDOT organizes education into clear, guided paths so learners always know what to learn next and how to progress.
            </p>
            <p className={`text-xl leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
               Every course is part of a bigger journey — from beginner to advanced — ensuring clarity, consistency, and real skill development.
            </p>
            </div>
         </div>
      </section>

      <div className="relative z-10">

        {/* TOP CATEGORIES SECTION */}
        <section className={`px-6 py-16 border-y backdrop-blur-3xl relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1120]/60 border-white/5' : 'bg-white/40 border-slate-200'}`}>
           {/* Subtle background tech pattern to enhance the infographic vibe */}
           <div className={`absolute inset-0 bg-[size:40px_40px] pointer-events-none ${isDarkMode ? 'opacity-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]' : 'opacity-30 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]'}`}></div>

           <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-28 md:mb-36 relative z-50">
                 <h2 className={`text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6 drop-shadow-lg text-transparent bg-clip-text ${isDarkMode ? 'bg-gradient-to-r from-white to-slate-400' : 'bg-gradient-to-r from-slate-800 to-slate-500'}`}>
                   Browse by Learning Domains
                 </h2>
                 <p className={`text-lg md:text-xl font-medium max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                   Explore courses across key knowledge areas designed to support academic and professional growth.
                 </p>
              </div>

              <div className="relative mx-auto w-[180px] h-[208px] md:w-[280px] md:h-[324px] mt-40 mb-40 md:mt-72 md:mb-72 scale-[0.85] sm:scale-100 md:scale-105 lg:scale-110">
                 
                 {/* Center Hexagon */}
                 <div className="absolute inset-0 z-20">
                    <CentralEDOTLogo />
                 </div>

                 {/* Surrounding Hexagons */}
                 <style>
                 {`
                   @keyframes orbit {
                     from { transform: rotate(0deg); }
                     to { transform: rotate(-360deg); }
                   }
                   @keyframes counter-orbit {
                     from { transform: rotate(0deg); }
                     to { transform: rotate(360deg); }
                   }
                   .orbit-container {
                     animation: orbit 60s linear infinite;
                   }
                   .orbit-container:hover {
                     animation-play-state: paused;
                   }
                   .counter-orbit-item {
                     animation: counter-orbit 60s linear infinite;
                   }
                   .orbit-container:hover .counter-orbit-item {
                     animation-play-state: paused;
                   }
                 `}
                 </style>
                 <div className="absolute inset-0 orbit-container z-10">
                   {MAIN_CATEGORIES.map((cat, idx) => {
                      const translateMap = [
                        "translate(100%, 0) scale(0.88)",      // 01: Right
                        "translate(50%, -75%) scale(0.88)",    // 02: Top Right
                        "translate(-50%, -75%) scale(0.88)",   // 03: Top Left
                        "translate(-100%, 0) scale(0.88)",     // 04: Left
                        "translate(-50%, 75%) scale(0.88)",    // 05: Bottom Left
                        "translate(50%, 75%) scale(0.88)"      // 06: Bottom Right
                      ];
                      return (
                         <div 
                            key={cat} 
                            className="absolute inset-0 hover:z-30"
                            style={{ transform: translateMap[idx % 6] }}
                         >
                            <div className="w-full h-full counter-orbit-item">
                               <CategoryHexagon 
                                  cat={cat} 
                                  idx={idx} 
                                  translate="none"
                                  onClick={() => {
                                      setCategoryFilter(cat);
                                      document.getElementById('course-catalog').scrollIntoView({ behavior: 'smooth' });
                                  }} 
                               />
                            </div>
                         </div>
                      )
                   })}
                 </div>
              </div>
           </div>
        </section>

        {/* MAIN COURSE CATALOG */}
        <section id="course-catalog" className={`w-full py-20 border-t transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-slate-100' : 'bg-[#FAFAFA] border-slate-200 text-slate-800'}`}>
          <div className="max-w-7xl mx-auto px-6 min-h-[60vh]">
            
            {/* Header & Filter Tabs */}
            <div className="mb-10">
              <h2 className={`text-3xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Skills to transform your career and life</h2>
              <p className={`text-[16px] mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>From critical skills to technical topics, EDOT supports your professional development.</p>
              
              {/* Modern Pill-based Tabs */}
              <div className={`flex overflow-x-auto hide-scrollbar items-center gap-3 md:gap-4 pb-4 mb-4 border-b snap-x ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                 {COURSE_TABS.map((cat, i) => {
                     const catColor = CATEGORY_DETAILS[cat]?.color || '#6366f1';
                     const isSelected = categoryFilter === cat;
                     return (
                       <button 
                         key={i}
                         onClick={() => setCategoryFilter(cat)}
                         className={`px-5 py-2.5 rounded-full text-[14px] font-bold transition-all duration-300 relative whitespace-nowrap outline-none focus:outline-none snap-start shrink-0 flex items-center gap-2 shadow-sm ${
                           isSelected 
                                ? (isDarkMode ? 'text-white hover:-translate-y-0.5' : 'text-slate-900 hover:-translate-y-0.5') 
                                : (isDarkMode ? 'bg-[#0B1120] border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/30 hover:shadow-md hover:-translate-y-0.5' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5')
                         }`}
                         style={{
                            backgroundColor: isSelected ? catColor : undefined,
                            boxShadow: isSelected ? `0 8px 20px -6px ${catColor}90` : undefined,
                            borderColor: isSelected ? catColor : undefined
                         }}
                       >
                         {isSelected && <Check size={16} strokeWidth={3} className="opacity-90" />}
                         {cat} 
                       </button>
                     );
                 })}
              </div>
            </div>

            {/* Grid Content */}
            {loading ? (
               <div className="flex flex-col justify-center items-center h-64 gap-4">
                 <div className={`w-12 h-12 border-4 border-t-white rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
                 <span className={`font-bold text-xs animate-pulse ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading amazing content...</span>
               </div>
            ) : error ? (
               <div className="bg-red-500/10 text-red-500 font-medium p-8 rounded-3xl text-center border border-red-500/20 max-w-2xl mx-auto flex flex-col items-center gap-4">
                 <Shield className="w-10 h-10" />
                 <p>{error}</p>
               </div>
            ) : courses.length === 0 ? (
               <div className={`text-center py-24 rounded-2xl border ${isDarkMode ? 'bg-[#0B1120]/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                 <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                 <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No courses found</h3>
                 <p className={`font-medium max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>We couldn't find any courses matching your search or filter. Try a different term or browse all categories.</p>
                 <button onClick={() => {setSearchTerm(''); setCategoryFilter('All');}} className={`mt-8 px-8 py-3 border rounded-xl font-bold text-sm transition-colors ${isDarkMode ? 'bg-white border-white text-[#0B1120] hover:bg-slate-200' : 'bg-[#0B1120] border-slate-800 text-white hover:bg-slate-700'}`}>
                   Clear Filters
                 </button>
               </div>
            ) : (
               <div className="flex flex-col">
                   <div className="relative group animate-in fade-in duration-700">
                     {/* Left Scroll Button */}
                     {showLeftScroll && (
                       <button 
                          onClick={() => scroll('left')}
                          className={`absolute left-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0B1120] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-[#1a202c] hover:scale-105 transition-all border z-10 hidden lg:flex opacity-0 group-hover:opacity-100 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
                       >
                          <ChevronRight className="w-6 h-6 rotate-180" strokeWidth={2.5} />
                       </button>
                     )}

                     <div 
                        ref={scrollContainerRef} 
                        onScroll={checkScrollability}
                        className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                     >
                       {courses.map((course) => (
                           <div key={course.id} className="w-[80vw] md:w-[280px] lg:w-[300px] shrink-0 snap-start flex">
                             <CourseCard 
                               course={course} 
                               isDarkMode={isDarkMode}
                               setHoveredCourse={(data) => {
                                 if (globalHoverTimeout.current) clearTimeout(globalHoverTimeout.current);
                                 if (!data) {
                                   globalHoverTimeout.current = setTimeout(() => setHoveredCourseData(null), 100);
                                 } else {
                                   setHoveredCourseData(data);
                                 }
                               }} 
                             />
                           </div>
                       ))}
                     </div>
                     
                     {/* Right Scroll Button */}
                     {showRightScroll && (
                       <button 
                          onClick={() => scroll('right')}
                          className={`absolute right-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 bg-[#0B1120] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-[#1a202c] hover:scale-105 transition-all border z-10 hidden lg:flex opacity-0 group-hover:opacity-100 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
                       >
                          <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
                       </button>
                     )}
                   </div>

                   <div className="mt-8 mb-8 flex items-center justify-between">
                     <button 
                       className="font-bold text-[15px] flex items-center gap-2 hover:opacity-80 transition-opacity"
                       style={{ color: (CATEGORY_DETAILS[categoryFilter] || CATEGORY_DETAILS["Programming & Technology"]).color }}
                     >
                       Show all {categoryFilter} courses <ArrowRight className="w-4 h-4" />
                     </button>
                   </div>

                   {hasMore && (
                     <div className="flex justify-center mt-6">
                       <button 
                         onClick={handleLoadMore}
                         disabled={loadingMore}
                         className={`px-10 py-3.5 rounded-full font-bold text-[15px] transition-all flex items-center justify-center gap-3 min-w-[200px] border ${isDarkMode ? 'bg-[#0B1120] text-white border-white/10 hover:border-white/30 hover:bg-white/5' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'}`}
                       >
                         {loadingMore ? 'Loading More...' : `Show More Courses (${totalCount - courses.length})`}
                         {!loadingMore && <ChevronDown className="w-4 h-4" />}
                       </button>
                     </div>
                   )}
               </div>
            )}
          </div>
        </section>

        {/* LEARNING EXPERIENCE */}
        <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
           <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="grid grid-cols-2 gap-6">
                 {[
                   { title: "Self-paced learning", desc: "with structured modules" },
                   { title: "Live interactive", desc: "sessions with instructors" },
                   { title: "Group-based", desc: "collaborative learning" },
                   { title: "Exam-focused", desc: "preparation with past questions" }
                 ].map((mode, i) => (
                    <div key={i} className={`p-6 rounded-[24px] border ${isDarkMode ? 'bg-[#111827] border-white/10' : 'bg-white border-slate-200 shadow-md'}`}>
                       <h4 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{mode.title}</h4>
                       <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{mode.desc}</p>
                    </div>
                 ))}
              </div>
              <div>
                 <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>How You Learn on EDOT</h2>
                 <p className={`text-xl leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    EDOT offers multiple learning modes to fit different needs and environments. Whether you excel in group dynamics or prefer isolated focus, our ecosystem adapts to your cognitive style.
                 </p>
                 <Link to="/register" className="inline-flex items-center gap-2 font-bold text-[#00D4FF] hover:text-[#00B4D8] transition-colors">
                    Explore Learning Modes <ArrowRight className="w-5 h-5" />
                 </Link>
              </div>
           </div>
        </section>

        {/* COURSE STRUCTURE & PROGRESSION */}
        <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
           <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Built for Real Progress */}
              <div className={`p-10 rounded-[40px] border relative overflow-hidden group ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-[#FFF8F0] border-orange-100'}`}>
                 <div className="relative z-10">
                    <div className="w-16 h-16 bg-[#F97316] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                       <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Built for Real Progress</h3>
                    <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                       Each course is designed with a clear structure to ensure measurable learning outcomes.
                    </p>
                    <ul className="space-y-4">
                       {['Step-by-step modules', 'Video lessons and resources', 'Quizzes and assessments', 'Progress tracking dashboard', 'Instructor support and feedback'].map((item, i) => (
                          <li key={i} className="flex items-center gap-3">
                             <CheckCircle className="w-5 h-5 text-[#F97316]" />
                             <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{item}</span>
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>

              {/* Skill-Based Progression */}
              <div className={`p-10 rounded-[40px] border relative overflow-hidden group ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-[#F0FAFF] border-blue-100'}`}>
                 <div className="relative z-10">
                    <div className="w-16 h-16 bg-[#00D4FF] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                       <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>From Learning to Real Skills</h3>
                    <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                       Courses are designed not just to deliver knowledge, but to build practical, applicable skills.
                    </p>
                    <p className={`text-lg leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                       Learners move from understanding concepts to applying them in real-world scenarios — preparing them for academic success and career opportunities.
                    </p>
                 </div>
              </div>

           </div>
        </section>

        {/* WHO CAN LEARN */}
        <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
           <div className="max-w-[1200px] mx-auto text-center">
              <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Designed for Every Stage of Learning</h2>
              <p className={`text-xl max-w-3xl mx-auto mb-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                 EDOT supports learners across different levels.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { title: "Primary & Secondary", desc: "Build robust foundational knowledge.", icon: GraduationCap },
                   { title: "University & College", desc: "Master advanced academic frameworks.", icon: BookOpen },
                   { title: "Professionals & Self-Learners", desc: "Upskill and dominate the modern market.", icon: Users }
                 ].map((stage, idx) => (
                    <div key={idx} className={`p-10 rounded-[32px] border text-center transition-all hover:-translate-y-2 ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
                       <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-blue-500/20 text-[#00D4FF] flex items-center justify-center mb-6">
                          <stage.icon className="w-8 h-8" />
                       </div>
                       <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stage.title}</h3>
                       <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{stage.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* FINAL CTA */}
        <section className={`py-32 px-6 relative z-20 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'}`}>
           <div className="max-w-[1000px] mx-auto text-center">
              <h2 className={`text-5xl md:text-6xl font-black mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                 Start Your <span className="text-[#F97316]">Learning Journey</span>
              </h2>
              <p className={`text-2xl mb-12 max-w-2xl mx-auto font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                 Choose your path, follow structured learning, and build skills that matter.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6">
                 <button onClick={() => document.getElementById('course-catalog').scrollIntoView({ behavior: 'smooth' })} className="bg-[#0B1120] text-white dark:bg-white dark:text-slate-900 px-10 py-4 rounded-xl font-black text-lg hover:bg-slate-700 dark:hover:bg-slate-200 hover:-translate-y-1 transition-all duration-300 shadow-xl">
                   Explore Courses
                 </button>
                 <Link to="/register" className="bg-[#F97316] text-[#ffffff] px-10 py-4 rounded-full font-black text-lg hover:bg-[#e66a00] hover:-translate-y-1 transition-all duration-300 shadow-[0_15px_30px_rgba(249,115,22,0.3)] flex items-center justify-center gap-3">
                   Start Learning <ChevronRight className="w-5 h-5" />
                 </Link>
              </div>
           </div>
        </section>

      </div>

      {hoveredCourseData && (
        <CoursePopover 
          course={hoveredCourseData.course} 
          rect={hoveredCourseData.rect} 
          isDarkMode={isDarkMode}
          onMouseEnter={() => {
            if (globalHoverTimeout.current) clearTimeout(globalHoverTimeout.current);
          }}
          onMouseLeave={() => {
            globalHoverTimeout.current = setTimeout(() => setHoveredCourseData(null), 100);
          }}
        />
      )}
    </div>
  );
}
