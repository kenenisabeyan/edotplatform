import React, { useState } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { Link } from 'react-router-dom';
import { Phone, Linkedin, Send, Facebook, Youtube, Instagram, MapPin, Mail, ArrowRight, Activity, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';

export default function Footer() {
  const isDarkMode = useThemeMode();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 8000);
    }
  };

  return (
    <footer className={`relative z-20 pt-20 pb-12 border-t transition-all duration-500 overflow-hidden ${
      isDarkMode 
        ? 'bg-[#0B1120] text-slate-350 border-white/10' 
        : 'bg-white text-slate-600 border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.02)]'
    }`} role="contentinfo">
      
      {/* Decorative Blur Orbs for Production Wow-Factor */}
      {isDarkMode && (
        <>
          <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-[#00D4FF]/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-emerald-500/3 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* 1. Production Newsletter Card (Wow Factor CTA) */}
        <div className={`p-8 md:p-10 rounded-[2.5rem] border mb-16 relative overflow-hidden transition-all duration-500 ${
          isDarkMode 
            ? 'bg-[#0B1120]/40 backdrop-blur-xl border-white/5 shadow-2xl hover:border-white/10' 
            : 'bg-slate-50/80 backdrop-blur-xl border-slate-200/60 shadow-lg hover:border-slate-300'
        }`}>
          {/* Internal Glow Effect */}
          <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-[#00D4FF]/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-6 space-y-4 text-left">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                isDarkMode ? 'bg-[#00D4FF]/5 text-[#00D4FF] border-[#00D4FF]/25' : 'bg-[#00D4FF]/10 text-[#00b2d6] border-[#00D4FF]/20'
              }`}>
                ✨ Join the Learning Revolution
              </span>
              <h3 className={`text-2xl md:text-3xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Empowering minds through <br />
                structured, verified pathways.
              </h3>
              <p className={`text-sm max-w-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Subscribe to receive immediate notification on new course launches, student sponsorships, and real-time community achievements.
              </p>
            </div>
            
            <div className="lg:col-span-6 flex flex-col justify-center">
              {newsletterSuccess ? (
                <div className="p-5 bg-emerald-500/10 border border-emerald-500/25 rounded-3xl text-emerald-400 text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-300 shadow-inner">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
                  <div>
                    <span className="block font-bold">Subscription Confirmed!</span>
                    <span className="text-xs opacity-90 font-medium">Welcome to the EDOT ecosystem. Check your email for our catalog guides.</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-xl lg:ml-auto">
                  <div className="relative flex-1">
                    <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your professional email address"
                      className={`w-full !pl-12 !pr-5 !py-4 border rounded-full text-sm font-medium focus:ring-2 focus:ring-[#00D4FF]/20 transition-all ${
                        isDarkMode 
                          ? 'bg-[#0B1120] border-white/10 text-white placeholder-slate-500 focus:border-[#00D4FF]/50' 
                          : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#00D4FF]/50'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#00b2d6] text-slate-900 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-[#00D4FF]/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 shrink-0 cursor-pointer group"
                  >
                    Subscribe
                    <span className="flex items-center justify-center w-5 h-5 rounded-full border border-slate-900 ml-1 transition-colors">
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 2. Structured Multi-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-10 pb-16 border-b border-slate-200 dark:border-white/10 text-left">
          
          {/* Brand Info Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3.5 transition-transform hover:scale-[1.02] group w-max">
              <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-md ${
                isDarkMode ? 'bg-[#0B1120] border border-white/10' : 'bg-white border border-slate-200'
              }`}>
                <img src={edotLogo} alt="EDOT Logo" className="w-8.5 h-8.5 object-contain" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-black text-2xl leading-none tracking-tight bg-gradient-to-r from-[#00D4FF] to-emerald-400 bg-clip-text text-transparent">EDOT</span>
                <span className={`text-[8.5px] font-black tracking-[0.25em] mt-1.5 uppercase ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-500'
                }`}>Education for All</span>
              </div>
            </Link>
            
            <p className={`text-xs leading-relaxed max-w-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              EDOT is a full-stack, enterprise-grade learning management platform linking administrators, instructors, sponsors, parents, and students together in a cohesive dashboard ecosystem.
            </p>

            {/* Pulsing Systems Status (Production Grade Element) */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Column A: Learning Pathways */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className={`text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Pathways
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Social Sciences', to: '/courses', state: { category: 'Social Science' } },
                { label: 'Mathematics & Natural Sciences', to: '/courses', state: { category: 'Mathematics & Natural Science' } },
                { label: 'Languages', to: '/courses', state: { category: 'Natural Language' } },
                { label: 'Technology & Development', to: '/courses', state: { category: 'Programming & Technology' } },
                { label: 'Business & Entrepreneurship', to: '/courses', state: { category: 'Business & Entrepreneurship' } },
                { label: 'Personal Development', to: '/courses', state: { category: 'Personal Development' } }
              ].map((item, idx) => (
                <li key={idx}>
                  <Link 
                    to={item.to} 
                    state={item.state}
                    className={`text-sm font-semibold transition-all duration-300 hover:pl-1 flex items-center gap-1 group ${
                      isDarkMode ? 'text-slate-400 hover:text-[#00D4FF]' : 'text-slate-500 hover:text-[#00b2d6]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column B: Role Gateways */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className={`text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Role Hubs
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Learners Gateway', to: '/login' },
                { label: 'Educators Portal', to: '/register?role=instructor' },
                { label: 'Parent Portal', to: '/register?role=parent' },
                { label: 'Sponsorship Vault', to: '/sponsorship' },
                { label: 'Impact Analytics', to: '/impact' }
              ].map((item, idx) => (
                <li key={idx}>
                  <Link 
                    to={item.to} 
                    className={`text-sm font-semibold transition-all duration-300 hover:pl-1 flex items-center gap-1 group ${
                      isDarkMode ? 'text-slate-400 hover:text-[#00D4FF]' : 'text-slate-500 hover:text-[#00b2d6]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column C: Resources */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className={`text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Public Notices', to: '/about' },
                { label: 'Academic Calendar', to: '/contact' },
                { label: 'Interactive FAQs', to: '/contact' },
                { label: 'Verification Hub', to: '/sponsorship' },
                { label: 'API Reference', to: '/about' }
              ].map((item, idx) => (
                <li key={idx}>
                  <Link 
                    to={item.to} 
                    className={`text-sm font-semibold transition-all duration-300 hover:pl-1 flex items-center gap-1 group ${
                      isDarkMode ? 'text-slate-400 hover:text-[#00D4FF]' : 'text-slate-500 hover:text-[#00b2d6]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column D: Enterprise Trust */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className={`text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Trust & Legal
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Support & Help', to: '/contact' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Security Protocols', to: '/about' }
              ].map((item, idx) => (
                <li key={idx}>
                  <Link 
                    to={item.to} 
                    className={`text-sm font-semibold transition-all duration-300 hover:pl-1 flex items-center gap-1 group ${
                      isDarkMode ? 'text-slate-400 hover:text-[#00D4FF]' : 'text-slate-500 hover:text-[#00b2d6]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* 3. Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10">
          
          {/* Metadata & Coordinates */}
          <div className={`flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4 text-xs font-bold ${
            isDarkMode ? 'text-slate-400' : 'text-slate-650'
          }`}>
            <a href="tel:+251941177566" className="flex items-center gap-2 hover:text-[#00D4FF] transition-colors duration-300"><Phone className="w-3.5 h-3.5 text-[#00D4FF]"/> +251 941 177 566</a>
            <a href="tel:+251962343967" className="flex items-center gap-2 hover:text-[#00D4FF] transition-colors duration-300"><Phone className="w-3.5 h-3.5 text-[#00D4FF]"/> +251 962 343 967</a>
            <span className="flex items-center gap-2 select-none"><MapPin className="w-3.5 h-3.5 text-[#00D4FF]"/> Adama, ASTU Region</span>
          </div>
          
          {/* Footer Copyright Slogan & Socials */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase flex items-center gap-1 select-none">
              Built with <Heart className="w-3.5 h-3.5 text-[#00D4FF] fill-[#00D4FF] animate-pulse" /> for ASTU Communities
            </span>
            
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: '#' },
                { icon: Youtube, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Send, href: '#' }
              ].map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  className={`w-8.5 h-8.5 rounded-full flex items-center justify-center border hover:scale-105 transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-slate-400 border-white/5 hover:border-[#00D4FF] hover:bg-[#00D4FF]/5 hover:text-[#00D4FF]' 
                      : 'text-slate-500 border-slate-200 hover:border-[#00b2d6] hover:bg-[#00D4FF]/10 hover:text-[#00b2d6]'
                  }`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}

