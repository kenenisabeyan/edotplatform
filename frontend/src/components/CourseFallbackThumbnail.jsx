import React from 'react';

const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/jpw8g8m6spazsktyizdw';

export default function CourseFallbackThumbnail({ color, darkColor, ribbon, fallbackId }) {
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
}
