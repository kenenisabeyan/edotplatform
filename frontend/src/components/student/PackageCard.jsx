import React, { useState } from 'react';
import useThemeMode from '../../hooks/useThemeMode';
import { Globe, ShoppingCart, Lock, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';

const CATEGORY_DESCRIPTIONS = {
  "Social Science": "Understand how society works through subjects like History, Geography, Sociology, and Economics. These courses help learners analyze human behavior, social systems, and global issues with critical thinking.",
  "Mathematics & Natural Science": "Build strong analytical and scientific skills with Mathematics, Physics, Chemistry, and Biology. Designed to develop problem-solving ability and a deep understanding of the natural world.",
  "Natural Language": "Enhance communication and expression through English, Literature, Linguistics, and more. These courses improve reading, writing, speaking, and creative thinking for academic and real-life success.",
  "Programming & Technology": "Master modern tech skills including Programming, Web Development, AI, and Cybersecurity. Learn to build real-world applications, solve problems, and prepare for careers in the digital world.",
  "Business & Entrepreneurship": "Learn how to create, manage, and grow successful businesses. Covering Entrepreneurship, Marketing, Finance, and Management, these courses turn ideas into real opportunities.",
  "Personal Development": "Develop essential life skills like Leadership, Time Management, and Public Speaking. These courses focus on self-growth, productivity, and building a successful personal and professional life."
};

const PackageCard = ({ pkg, isEnrolled, isDarkMode }) => {
  const navigate = useNavigate();
  const [showCourses, setShowCourses] = useState(false);

  // Extract the raw category name by removing " Courses" from the end of the title if present
  const categoryKey = pkg.title.replace(" Courses", "").trim();
  const description = CATEGORY_DESCRIPTIONS[categoryKey] || pkg.description;

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.3)]' : 'bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} rounded-[24px] flex flex-col w-full hover:shadow-md transition-all hover:-translate-y-1 duration-300 relative overflow-hidden group border`}>
      {/* Theme Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 z-50" style={{ backgroundColor: pkg.color || '#6366f1' }}></div>
      {/* Top Graphic */}
      <div className="p-4 pt-5 pb-0">
        <div className="relative h-[220px] w-full rounded-2xl overflow-hidden shadow-inner bg-[#030303] group">
          
          {/* Coordinate Lock Wrapper: Ensures absolute positioning and SVG viewBox perfectly align regardless of card width */}
          <div className="relative w-[260px] h-[220px] mx-auto">
            
            {/* Background Glow (z-0) */}
            <div className="absolute w-[150px] h-[150px] rounded-full blur-[60px] opacity-30 top-[55px] left-[55px]" style={{ backgroundColor: pkg.color }}></div>

            {/* SVG Back Tails (z-10) - Deepest layer, tucked far behind rings */}
            <div className="absolute inset-0 z-10 pointer-events-none transition-transform duration-500 group-hover:-translate-y-1">
              <svg width="100%" height="100%" viewBox="0 0 260 220" className="overflow-visible">
                {/* Left Back Tail */}
                <path d="M 50 115 L 20 75 L 0 90 L -20 75 L 10 115 Z" fill={pkg.darkColor || '#4338ca'} />
                {/* Right Back Tail */}
                <path d="M 210 115 L 240 75 L 260 90 L 280 75 L 250 115 Z" fill={pkg.darkColor || '#4338ca'} />
              </svg>
            </div>

            {/* 3D Metallic Rings (z-20) - In front of tails, behind front ribbon */}
            <div className="absolute z-20 w-[160px] h-[160px] top-[50px] left-[50px] rounded-full border-[8px] opacity-60 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-105" 
                 style={{ borderColor: pkg.color, borderTopColor: pkg.darkColor, borderBottomColor: pkg.darkColor }}></div>
            
            <div className="absolute z-20 w-[130px] h-[130px] top-[65px] left-[65px] rounded-full border-[4px] opacity-80 shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-transform duration-700 group-hover:scale-110" 
                 style={{ borderColor: pkg.darkColor, borderLeftColor: pkg.color, borderRightColor: pkg.color }}></div>
            
            <div className="absolute z-20 w-[106px] h-[106px] top-[77px] left-[77px] rounded-full border-[6px] shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-95" 
                 style={{ borderColor: pkg.color }}></div>

            {/* Curved Text (EDOT) (z-20) - Placed permanently on TOP half circle */}
            <div className="absolute z-20 w-[160px] h-[160px] top-[50px] left-[50px]">
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                {/* Left-to-Right sweep=0 guarantees a SMILE (Bottom Half) and upright text on the inside of the curve! */}
                {/* Radius 25 perfectly maps to the NEW expanded gap between the White Shield and Inner Ring */}
                <path id={`curve-${pkg.id}`} d="M 25 50 A 25 25 0 0 0 75 50" fill="transparent" />
                <text className="text-[12px] font-black tracking-[0.3em]" style={{ fill: pkg.color }}>
                  <textPath href={`#curve-${pkg.id}`} startOffset="50%" textAnchor="middle" dominantBaseline="middle">
                    E D O T
                  </textPath>
                </text>
              </svg>
            </div>

            {/* Center Logo Shield (z-30) */}
            <div className="absolute z-30 top-[103px] left-[103px] w-[54px] h-[54px] bg-white rounded-full flex flex-col items-center justify-center shadow-[0_0_25px_rgba(0,0,0,0.9)] border-[3px] transition-transform duration-500 group-hover:scale-110" style={{ borderColor: pkg.color }}>
              <img src={edotLogo} alt="EDOT" className="w-[40px] h-[40px] object-contain rounded-full" onError={(e) => e.target.style.display='none'} />
            </div>

            {/* SVG Front Ribbon (z-40) - Topmost layer, seamlessly extending from the outer ring */}
            <div className="absolute inset-0 z-40 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] pointer-events-none transition-transform duration-500 group-hover:-translate-y-1">
              <svg width="100%" height="100%" viewBox="0 0 260 220" className="overflow-visible">
                <defs>
                  <linearGradient id={`grad-${pkg.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={pkg.darkColor || '#4338ca'} />
                    <stop offset="20%" stopColor={pkg.color || '#6366f1'} />
                    <stop offset="80%" stopColor={pkg.color || '#6366f1'} />
                    <stop offset="100%" stopColor={pkg.darkColor || '#4338ca'} />
                  </linearGradient>
                  {/* Left-to-Right sweep=1 draws a SMILE (Bottom Half) for right-side up text */}
                  <path id={`text-path-${pkg.id}`} d="M 30 130 A 100 100 0 0 1 230 130" fill="transparent" />
                </defs>

                {/* Dark Folds connecting front to back tails */}
                <polygon points="10,130 10,115 50,130" fill="#000000" />
                <polygon points="250,130 250,115 210,130" fill="#000000" />

                {/* Main Front Ribbon (Perfect SMILE Bottom Crescent) */}
                {/* Inner: Left-to-Right sweep=1 (SMILE). Outer: Right-to-Left sweep=0 (SMILE). */}
                <path d="M 50 130 A 80 80 0 0 1 210 130 L 250 130 A 120 120 0 0 0 10 130 Z" fill={`url(#grad-${pkg.id})`} />

                {/* Category Text */}
                <text className="font-black text-[12.5px] uppercase" fill="#ffffff" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.6))' }}>
                  <textPath href={`#text-path-${pkg.id}`} startOffset="50%" textAnchor="middle" dominantBaseline="middle">
                    {pkg.title.toUpperCase()}
                  </textPath>
                </text>
              </svg>
            </div>

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 flex flex-col">
        <h3 className="text-[14px] font-bold mb-1" style={{ color: isDarkMode ? '#f8fafc' : (pkg.color || '#1e293b') }}>{pkg.title}</h3>
        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: pkg.color || '#6366f1' }}>{pkg.category}</p>
        
        {/* Course Description */}
        <p className={`text-[11.5px] leading-relaxed mb-5 line-clamp-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {description}
        </p>
        
        {/* Available courses pills */}
        <div className={`mb-3 p-4 rounded-xl border flex-1 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-[#f8fafc] border-slate-100'}`}>
          <div 
            className="flex items-center justify-between mb-3 cursor-pointer group"
            onClick={() => setShowCourses(!showCourses)}
          >
            <div className="flex items-center gap-1.5">
               <Globe className="w-3.5 h-3.5" style={{ color: pkg.color || '#6366f1' }} />
               <span className={`text-[11px] font-bold transition-colors ${isDarkMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800'}`}>Available courses</span>
            </div>
            {((pkg.courses && pkg.courses.length > 0) || (pkg.languages && pkg.languages.length > 0)) && (
              <div className="bg-slate-200/50 p-1 rounded-full group-hover:bg-slate-200 transition-colors">
                {showCourses ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
              </div>
            )}
          </div>
          
          {/* Courses & Languages List Container - Animated */}
          <div className={`transition-all duration-300 overflow-hidden ${showCourses ? 'max-h-[350px] opacity-100 overflow-y-auto pr-1' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col gap-4 pt-2 pb-1">
              
              {/* Courses Section */}
              <div className="flex flex-wrap gap-2">
                {pkg.courses && pkg.courses.length > 0 ? (
                  pkg.courses.map((c, i) => (
                     <div 
                       key={c.id || i}
                       onClick={() => {
                         if (isEnrolled) navigate('/courses');
                       }}
                       className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${isEnrolled ? 'cursor-pointer' : 'cursor-pointer'}`}
                       style={{ 
                         background: `linear-gradient(135deg, ${pkg.color || '#6366f1'}, ${pkg.darkColor || '#4338ca'})`,
                         color: '#ffffff'
                       }}
                     >
                       <span>{c.title || c}</span>
                     </div>
                  ))
                ) : (
                   <span className={`text-[11px] italic p-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>New courses coming soon...</span>
                )}
              </div>

              {/* Languages Section */}
              <div>
                <div className="flex items-center gap-1.5 mb-2 mt-1">
                   <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Available Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pkg.languages && pkg.languages.length > 0 && (
                    pkg.languages.map((lang, i) => (
                       <div 
                         key={i}
                         className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-sm cursor-default`}
                         style={{ 
                           background: `linear-gradient(135deg, ${pkg.color || '#6366f1'}, ${pkg.darkColor || '#4338ca'})`,
                           color: '#ffffff',
                           opacity: 0.9
                         }}
                       >
                         <span>{lang}</span>
                       </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={`w-full h-px my-5 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

        {/* Button */}
        <div className="flex justify-center mt-auto pt-2">
          {isEnrolled ? (
            <button 
              onClick={() => navigate('/courses')}
              className={`px-8 py-2.5 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 text-white`}
              style={{ 
                backgroundColor: pkg.color || '#3B82F6',
                boxShadow: `0 8px 25px -4px ${pkg.color || '#3B82F6'}80`
              }}
            >
              <Globe className="w-4 h-4" /> Continue Learning
            </button>
          ) : (
            <button 
              onClick={() => navigate('/courses')}
              className={`px-8 py-2.5 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-1 text-white`}
              style={{ 
                backgroundColor: pkg.color || '#3B82F6',
                boxShadow: `0 8px 25px -4px ${pkg.color || '#3B82F6'}80`
              }}
            >
              <ShoppingCart className="w-4 h-4" /> Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageCard;


