import React from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { Link } from 'react-router-dom';
import { Phone, Linkedin, Github, Send, GraduationCap, Facebook, Youtube, Instagram, MapPin } from 'lucide-react';

export default function Footer() {
  const isDarkMode = useThemeMode();
  return (
    <footer className={`relative z-20 bg-gradient-to-b py-10 border-t transition-colors duration-300 ${isDarkMode ? 'from-[#0B1120] to-[#0A1930] text-slate-300 border-white/10' : 'from-slate-50 to-white text-slate-600 border-slate-200'}`} role="contentinfo">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-10">
          
          {/* Logo & Copyright */}
          <div className="flex flex-col max-w-xs">
            <Link to="/" className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-white flex items-center justify-center rounded-[14px] shadow-sm">
                <GraduationCap className="w-8 h-8 text-[#0B1120] stroke-[2.5]" />
              </div>
              <div className="flex flex-col justify-center text-left">
                <span className="font-black text-[28px] leading-none tracking-wide bg-gradient-to-r from-[#00D4FF] to-teal-500 bg-clip-text text-transparent">EDOT</span>
                <span className={`text-[11px] font-bold tracking-[0.2em] mt-1 ${isDarkMode ? 'text-blue-200' : 'text-slate-500'}`}>PLATFORM</span>
              </div>
            </Link>
            <p className={`text-xs mt-2 leading-relaxed text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Copyright &copy; {new Date().getFullYear()}<br/>
              EDOT (Educational Digital Online Tools).<br/>
              All rights reserved.
            </p>
          </div>
 
          {/* Links Grid */}
          <div className="flex flex-wrap gap-x-12 gap-y-6 flex-1 justify-center">
            <div className="flex flex-col gap-3 border-l-2 border-[#00D4FF] pl-4 text-left">
               <Link to="/courses?cat=SocialScience" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>Social Science</Link>
               <Link to="/courses?cat=MathScience" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>Math & Science</Link>
               <Link to="/courses?cat=Programming" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>Programming</Link>
               <Link to="/courses?cat=Business" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>Business</Link>
            </div>
            <div className="flex flex-col gap-3 border-l-2 border-[#00D4FF] pl-4 text-left">
               <Link to="/about" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>About EDOT</Link>
               <Link to="/courses" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>Full Catalog</Link>
               <Link to="/register" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>Join Platform</Link>
               <Link to="/register?role=instructor" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>Teach With Us</Link>
            </div>
            <div className="flex flex-col gap-3 border-l-2 border-[#00D4FF] pl-4 text-left">
               <Link to="/contact" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>Contact Us</Link>
               <Link to="/contact" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>FAQ</Link>
               <Link to="/privacy" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>Privacy Policy</Link>
               <Link to="/terms" className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-350 hover:text-white' : 'text-slate-600 hover:text-teal-600'}`}>Terms of Service</Link>
            </div>
          </div>
 
          {/* Action Button */}
          <div className="shrink-0">
            <Link to="/contact" className="inline-flex items-center justify-center px-6 py-2.5 bg-[#00D4FF] text-slate-900 rounded-full text-sm font-bold hover:bg-[#00c5eb] transition-all shadow-md hover:-translate-y-0.5 duration-200">
              Contact Us
            </Link>
          </div>
          
        </div>
 
        {/* Divider */}
        <div className="w-full h-1 bg-[#00D4FF] rounded-full mb-6"></div>
 
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className={`flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <a href="tel:+251941177566" className="flex items-center gap-2 hover:text-[#00D4FF] transition-colors"><Phone className="w-3.5 h-3.5"/> +251 941 177 566</a>
            <a href="tel:+251962343967" className="flex items-center gap-2 hover:text-[#00D4FF] transition-colors"><Phone className="w-3.5 h-3.5"/> +251 962 343 967</a>
            <span className="flex items-center gap-2 hover:text-[#00D4FF] transition-colors"><MapPin className="w-3.5 h-3.5"/> ADAMA near ASTU</span>
          </div>
          
          <div className="flex items-center gap-3">
            <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}><Facebook className="w-4 h-4"/></a>
            <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}><Youtube className="w-4 h-4"/></a>
            <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}><Linkedin className="w-4 h-4"/></a>
            <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}><Instagram className="w-4 h-4"/></a>
            <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}><Send className="w-4 h-4"/></a>
          </div>
        </div>
 
      </div>
    </footer>
  );
}
