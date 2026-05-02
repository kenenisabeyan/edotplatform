import React from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { Link } from 'react-router-dom';
import { Phone, Linkedin, Github, Send, GraduationCap, Facebook, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  const isDarkMode = useThemeMode();
  return (
    <footer className={`relative z-20 bg-gradient-to-b from-[#11151F] to-[#0A1930] py-10 border-t ${isDarkMode ? 'text-slate-200 border-white/10' : 'text-slate-600 border-slate-200'}`} role="contentinfo">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-10">
          
          {/* Logo & Copyright */}
          <div className="flex flex-col max-w-xs">
            <Link to="/" className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-white flex items-center justify-center rounded-[14px]">
                <GraduationCap className="w-8 h-8 text-[#0B1120] stroke-[2.5]" />
              </div>
              <div className="flex flex-col justify-center">
                <span className={`font-black text-[28px] leading-none tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ textShadow: '-1.5px 0px 0px rgba(255,0,0,0.8), 1.5px 0px 0px rgba(0,255,255,0.8)' }}>EDOT</span>
                <span className="text-[11px] text-blue-200 font-bold tracking-[0.2em] mt-1">PLATFORM</span>
              </div>
            </Link>
            <p className={`text-xs mt-2 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
              Copyright &copy; {new Date().getFullYear()}<br/>
              EDOT (Educational Digital Online Tools).<br/>
              All rights reserved.
            </p>
          </div>

          {/* Links Grid */}
          <div className="flex flex-wrap gap-x-12 gap-y-6 flex-1 justify-center">
            <div className="flex flex-col gap-3 border-l-2 border-[#00D4FF] pl-4">
               <Link to="/courses?cat=SocialScience" className="text-sm font-bold hover:text-white transition-colors">Social Science</Link>
               <Link to="/courses?cat=MathScience" className="text-sm font-bold hover:text-white transition-colors">Math & Science</Link>
               <Link to="/courses?cat=Programming" className="text-sm font-bold hover:text-white transition-colors">Programming</Link>
               <Link to="/courses?cat=Business" className="text-sm font-bold hover:text-white transition-colors">Business</Link>
            </div>
            <div className="flex flex-col gap-3 border-l-2 border-[#00D4FF] pl-4">
               <Link to="/about" className="text-sm font-bold hover:text-white transition-colors">About EDOT</Link>
               <Link to="/courses" className="text-sm font-bold hover:text-white transition-colors">Full Catalog</Link>
               <Link to="/register" className="text-sm font-bold hover:text-white transition-colors">Join Platform</Link>
               <Link to="/register?role=instructor" className="text-sm font-bold hover:text-white transition-colors">Teach With Us</Link>
            </div>
            <div className="flex flex-col gap-3 border-l-2 border-[#00D4FF] pl-4">
               <Link to="/contact" className="text-sm font-bold hover:text-white transition-colors">Contact Us</Link>
               <Link to="/contact" className="text-sm font-bold hover:text-white transition-colors">FAQ</Link>
               <Link to="/privacy" className="text-sm font-bold hover:text-white transition-colors">Privacy Policy</Link>
               <Link to="/terms" className="text-sm font-bold hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            <Link to="/contact" className={`px-6 py-2.5 border border-[#00D4FF] bg-[#00D4FF] rounded text-sm font-bold hover:bg-[#00A3CC] transition-colors shadow-md ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Contact Us
            </Link>
          </div>
          
        </div>

        {/* Divider */}
        <div className="w-full h-1 bg-[#00D4FF] rounded-full mb-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className={`flex flex-wrap items-center gap-6 text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <a href="tel:+251941177566" className="flex items-center gap-2 hover:text-[#00D4FF] transition-colors"><Phone className="w-3.5 h-3.5"/> +251 941 177 566</a>
            <a href="tel:+251962343967" className="flex items-center gap-2 hover:text-[#00D4FF] transition-colors"><Phone className="w-3.5 h-3.5"/> +251 962 343 967</a>
          </div>
          
          <div className="flex items-center gap-3">
            <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><Facebook className="w-4 h-4"/></a>
            <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><Youtube className="w-4 h-4"/></a>
            <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><Linkedin className="w-4 h-4"/></a>
            <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><Instagram className="w-4 h-4"/></a>
            <a href="#" className={`w-8 h-8 rounded-full flex items-center justify-center hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><Send className="w-4 h-4"/></a>
          </div>
        </div>

      </div>
    </footer>
  );
}
