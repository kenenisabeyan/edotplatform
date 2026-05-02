import React from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTA({ 
  title = "Ready to redefine your potential?", 
  description = "Join thousands of learners and elite instructors on the EDOT Platform today. Fast, secure, and built for your success.",
  buttonText = "Create Your Free Account",
  buttonLink = "/register"
}) {
  const isDarkMode = useThemeMode();
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto relative z-20">
      <div className={`backdrop-blur-2xl border rounded-[3rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden group ${isDarkMode ? 'bg-[#1E293B]/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
        
        <h2 className={`text-2xl md:text-3xl font-bold leading-tight mb-8 tracking-tight relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h2>
        <p className={`text-base font-normal max-w-2xl mx-auto mb-12 relative z-10 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
          {description}
        </p>

        <Link to={buttonLink} className={`inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-xs transition-all hover:-translate-y-1 relative z-10 bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {buttonText} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
