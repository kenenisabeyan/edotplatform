import React from 'react';
import { Link } from 'react-router-dom';
import useThemeMode from '../hooks/useThemeMode';
import { CheckCircle, Globe, Award, Shield, Zap, TrendingUp, Users, Target, BookOpen, AlertTriangle, MonitorPlay, GitBranch, Handshake, ChevronRight } from 'lucide-react';

// Team Images
const kenoImg = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/rifthsjvrxwmgpxtzgvt';
const firoImg = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/qnrx8kq1sziidvmjzg9q';
const bettyImg = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/ck7q0lfhh2zrvb3kbrxh';
const yobsanImg = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/jkfj4e7i9e9to6zefltj';
const mahiImg = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/ndfiy86p0ppwtjr0f3wx';
const joImg = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/lcnh2cdmdjuer2t1vxpr';
const hayleImg = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/g50bitwixscmxpwzm9wk';
const chalaImg = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/xdz1ioziqj7kt4ovhhs9';

export default function About() {
  const isDarkMode = useThemeMode();

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* 1. HERO SECTION */}
      <section className={`relative w-full pt-40 pb-32 px-6 overflow-hidden flex flex-col items-center text-center border-b transition-colors duration-500 ${
        isDarkMode ? 'bg-[#0B1120] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'
      }`}>
         
         {/* Dynamic Bold Sharp Geometric Zigzag Structures cutting bottom-left to top-right */}
         <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
           <svg className="absolute w-full h-full" viewBox="0 0 1440 850" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
             {/* Cyan Dynamic Sharp Zigzag */}
             <path d="M-100 900 L320 680 L200 480 L800 280 L680 160 L1500 -120 L1600 -120 L1600 1000 Z" fill="url(#cyanGeometricGrad)" opacity={isDarkMode ? "0.65" : "0.48"}/>
             {/* Orange Dynamic Sharp Zigzag */}
             <path d="M-200 1000 L270 760 L140 560 L740 360 L620 240 L1420 -60 L1500 -60 L1500 1100 Z" fill="url(#orangeGeometricGrad)" opacity={isDarkMode ? "0.60" : "0.42"}/>
             
             <defs>
               <linearGradient id="cyanGeometricGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#19C2E8" />
                 <stop offset="60%" stopColor="#00D4FF" stopOpacity="0.85" />
                 <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
               </linearGradient>
               <linearGradient id="orangeGeometricGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#FF6A00" />
                 <stop offset="60%" stopColor="#FFB700" stopOpacity="0.85" />
                 <stop offset="100%" stopColor="#FFB700" stopOpacity="0" />
               </linearGradient>
             </defs>
           </svg>
         </div>

         <div className="relative z-10 max-w-[1000px] mx-auto mt-8">
            <h1 className={`text-5xl md:text-6xl lg:text-[4.5rem] font-black mb-8 leading-[1.1] tracking-tight text-[#0F172A] dark:text-white`}>
               Building a Better Future Through <br className="hidden md:block" />
               <span className="text-[#FF6A00] relative inline-block mt-2 whitespace-nowrap">
                  <span className="relative z-10">Education</span>
                  {/* Underline */}
                  <div className="absolute w-full h-1.5 bottom-1 left-0 bg-[#FF6A00]/20 z-0"></div>
               </span>
            </h1>
            <p className={`text-xl md:text-[20px] font-semibold max-w-3xl mx-auto leading-relaxed text-slate-700 dark:text-slate-300`}>
               EDOT is more than a learning platform, it is a structured system designed to make education accessible, guided, and impactful for everyone.
            </p>
         </div>
      </section>

      {/* 2. OUR STORY */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 w-full relative">
               <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className={`rounded-[32px] aspect-[4/5] overflow-hidden shadow-2xl transform -translate-y-8 ${isDarkMode ? 'border-4 border-[#111827]' : 'border-4 border-white'}`}>
                     <img src={kenoImg} alt="Keno" className="w-full h-full object-cover filter hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <div className={`rounded-[32px] aspect-[4/5] overflow-hidden shadow-2xl transform translate-y-8 ${isDarkMode ? 'border-4 border-[#111827]' : 'border-4 border-white'}`}>
                     <img src={mahiImg} alt="Mahi" className="w-full h-full object-cover filter hover:grayscale-0 transition-all duration-500" />
                  </div>
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-[#19C2E8]/5 rounded-full blur-[100px] z-0 pointer-events-none"></div>
            </div>
            
            <div className="flex-1 text-left">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm mb-6 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" /> Our Story
               </div>
               <h2 className={`text-4xl md:text-5xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Where EDOT Began
               </h2>
               <div className={`space-y-6 text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <p>
                     EDOT started from a simple observation: many learners struggle not because they lack ability, but because they lack access to structured, high-quality education.
                  </p>
                  <p>
                     Learning resources are often scattered, unclear, and difficult to follow. At the same time, many talented students are held back by financial limitations and lack of support.
                  </p>
                  <p className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                     Through innovation training and collaboration, this idea evolved into EDOT, a platform designed to solve these challenges by connecting learning, guidance, and opportunity in one system.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* 3. THE PROBLEM WE SAW */}
      <section className={`py-32 px-6 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}>
         <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="rounded-[40px] overflow-hidden shadow-2xl h-[500px] relative border-8 border-white dark:border-[#111827]">
               <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80" alt="Education inequality" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Why Change Was <span className="text-red-500">Needed</span>
               </h2>
               <p className={`text-xl leading-relaxed mb-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Education today faces several key challenges. These gaps create barriers that prevent many learners from reaching their full potential.
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: "Scattered Quality", icon: MonitorPlay },
                    { title: "No Direction", icon: GitBranch },
                    { title: "Isolated Learning", icon: Users },
                    { title: "Financial Barriers", icon: AlertTriangle }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-6 rounded-[24px] border transition-all hover:-translate-y-2 ${isDarkMode ? 'bg-[#111827] border-red-500/20 hover:border-red-500/40 shadow-lg shadow-red-900/10' : 'bg-white border-red-100 hover:border-red-200 shadow-xl shadow-slate-200/50'}`}>
                       <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mb-4">
                          <item.icon className="w-6 h-6" />
                       </div>
                       <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 4. OUR SOLUTION */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row-reverse gap-16 items-center">
            <div className="flex-1 text-left">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm mb-6 uppercase tracking-wider">
                  <Shield className="w-4 h-4" /> Our Solution
               </div>
               <h2 className={`text-4xl md:text-5xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  A System, Not Just a Platform
               </h2>
               <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  EDOT is designed as a complete learning ecosystem, not just a place to watch courses. It brings together learners, instructors, parents, and sponsors into one connected system where education is guided, measurable, and meaningful.
               </p>
               
               <div className="space-y-4">
                  {[
                     "Structured learning paths from basic to advanced levels",
                     "Personalized learning experiences based on pace and level",
                     "Real-time support and interaction",
                     "Progress tracking for accountability and improvement",
                     "Sponsorship integration to support learners in need"
                  ].map((point, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                       <div className="w-6 h-6 mt-0.5 rounded-full bg-[#19C2E8]/20 text-[#19C2E8] flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4" />
                       </div>
                       <span className={`text-[16px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{point}</span>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="flex-1 w-full rounded-[40px] overflow-hidden shadow-2xl border-[6px] border-[#19C2E8]/10 h-[500px]">
               <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Platform Dashboard Interface" className="w-full h-full object-cover" />
            </div>
         </div>
      </section>

      {/* 5. MISSION & VISION */}
      <section className={`py-32 px-6 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}>
         <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`relative p-12 rounded-[40px] overflow-hidden group ${isDarkMode ? 'bg-[#111827]' : 'bg-[#FFF8F0]'}`}>
               <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                  <Target className="w-48 h-48 text-[#19C2E8]" />
               </div>
               <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#19C2E8] text-white flex items-center justify-center mb-8 shadow-lg">
                     <Target className="w-8 h-8" />
                  </div>
                  <h3 className={`text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Our Mission</h3>
                  <p className={`text-xl leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                     To improve the quality of education by providing structured, accessible, and inclusive learning systems that empower individuals to grow academically and professionally.
                  </p>
               </div>
            </div>

            <div className={`relative p-12 rounded-[40px] overflow-hidden group ${isDarkMode ? 'bg-[#111827]' : 'bg-[#F0FAFF]'}`}>
               <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                  <Globe className="w-48 h-48 text-[#19C2E8]" />
               </div>
               <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#19C2E8] text-white flex items-center justify-center mb-8 shadow-lg">
                     <Globe className="w-8 h-8" />
                  </div>
                  <h3 className={`text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Our Vision</h3>
                  <p className={`text-xl leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                     A future where education is not limited by location, cost, or background, but becomes a powerful tool that creates opportunity for everyone.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* 6. WHAT MAKES EDOT DIFFERENT */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Our <span className="text-[#19C2E8]">Unique Approach</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed mb-20 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
               EDOT stands out by combining education with real-world impact. This combination creates a system where learning is not only accessible, but also meaningful and transformative.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { title: "Inclusive Reach", desc: "Built to serve urban, semi-urban, and rural communities.", icon: Globe },
                 { title: "Accessible Excellence", desc: "Focuses on affordability without compromising quality.", icon: Award },
                 { title: "Continuous Evolution", desc: "Integrates feedback to continuously improve learning.", icon: TrendingUp },
                 { title: "Impact Driven", desc: "Connects education with opportunity through sponsorship.", icon: Handshake }
               ].map((item, idx) => {
                 const isOddCard = idx % 2 === 0;
                 const outerGradient = isOddCard 
                    ? 'from-[#d9c7ff] via-white to-[#ffdcb8] dark:from-purple-500/50 dark:via-transparent dark:to-orange-500/50'
                    : 'from-[#bce1ff] via-white to-[#b8ffea] dark:from-blue-500/50 dark:via-transparent dark:to-teal-500/50';
                 const innerCircle = isOddCard
                    ? 'from-[#e0d4ff] to-[#ffebd4] dark:from-purple-900/50 dark:to-orange-900/50 text-[#19C2E8]'
                    : 'from-[#d4eeff] to-[#d4ffec] dark:from-blue-900/50 dark:to-teal-900/50 text-[#19C2E8]';

                 return (
                 <div key={idx} className={`relative p-[1px] rounded-[32px] bg-gradient-to-br ${outerGradient} shadow-[0_10px_40px_rgba(0,0,0,0.08)] group hover:-translate-y-2 transition-transform duration-300`}>
                    <div className={`h-full w-full rounded-[31px] flex flex-col items-center text-center p-8 ${isDarkMode ? 'bg-gradient-to-br from-[#1c182b] to-[#241a13]' : 'bg-gradient-to-br from-[#fcfaff] to-[#fffdfa]'}`}>
                       <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${innerCircle} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                          <item.icon className="w-8 h-8" />
                       </div>
                       <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                       <p className={`text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                    </div>
                 </div>
                 );
               })}
            </div>
         </div>
      </section>

       {/* 7. BUILT THROUGH INNOVATION */}
       <section className={`py-32 px-6 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}>
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="text-left">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-[#19C2E8] text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/30 transform rotate-3">
                   <Zap className="w-10 h-10" />
                </div>
               <h2 className={`text-4xl md:text-5xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  From Idea to Real-World Solution
               </h2>
               <p className={`text-xl leading-relaxed mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  EDOT was developed and refined through innovation and capacity-building programs supported by the <strong className={`${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ministry of Innovation and Technology Ethiopia</strong> and partner institutions.
               </p>
               <p className={`text-xl leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  This experience helped shape EDOT into a solution aligned with broader goals of improving education, building skills, and fostering innovation.
               </p>
            </div>
            <div className="rounded-[40px] overflow-hidden shadow-2xl h-[500px] relative border-8 border-white dark:border-[#111827]">
               <img src="https://images.unsplash.com/photo-1531496730074-83b638c0a7ac?auto=format&fit=crop&w=800&q=80" alt="Tech training and collaboration" className="w-full h-full object-cover" />
            </div>
         </div>
      </section>

       {/* 8. OUR TEAM & FOUNDERS */}
       <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-[#F8FAFC] border-slate-200'}`}>
          <div className="max-w-[1200px] mx-auto">
             <div className="text-center mb-24">
                <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                   The People Behind <span className="text-[#19C2E8]">EDOT</span>
                </h2>
               <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  EDOT is built by a team passionate about education, technology, and creating opportunities. Each member contributes to developing a platform that is not only functional, but also impactful and scalable.
               </p>
            </div>
            
            {/* Founders */}
            <div className="mb-16">
               <h3 className={`text-3xl font-black mb-10 text-center uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>The Founders</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                      { name: 'Kenenisa Beyan', role: 'Chief Executive Officer (CEO)', image: kenoImg },
                      { name: 'Mahlet Zena', role: 'Chief Operations Officer (COO)', image: mahiImg },
                      { name: 'Firomsa Guteta', role: 'Chief Technology Officer (CTO)', image: firoImg },
                      { name: 'Yobsan Girma', role: 'Chief Financial Officer (CFO)', image: yobsanImg }
                   ].map((member, i) => (
                      <div key={i} className="flex flex-col items-center group">
                         <div className={`w-48 h-48 rounded-[2rem] overflow-hidden mb-6 shadow-2xl transition-transform duration-500 group-hover:-translate-y-4 ${isDarkMode ? 'border-4 border-slate-800' : 'border-4 border-white'}`}>
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                         </div>
                         <h4 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{member.name}</h4>
                         <p className="text-[#19C2E8] font-bold text-center">{member.role}</p>
                      </div>
                   ))}
               </div>
            </div>

            {/* Core Team */}
            <div>
               <h3 className={`text-3xl font-black mb-10 text-center uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Core Team</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                      { name: 'Yohannes Belete', role: 'Lead Frontend Engineer', image: joImg },
                      { name: 'Haylemekot Bantealem', role: 'Head of Education Content', image: hayleImg },
                      { name: 'Bethelhem Yehuala', role: 'UI/UX & Design Lead', image: bettyImg },
                      { name: 'Chala Temesgen', role: 'Backend Infrastructure Lead', image: chalaImg }
                   ].map((member, i) => (
                      <div key={i} className="flex flex-col items-center group">
                         <div className={`w-40 h-40 rounded-[2rem] overflow-hidden mb-6 shadow-xl transition-transform duration-500 group-hover:-translate-y-3 ${isDarkMode ? 'border-4 border-slate-800' : 'border-4 border-white'}`}>
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                         </div>
                         <h4 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{member.name}</h4>
                         <p className="text-[#19C2E8] font-bold text-center text-sm">{member.role}</p>
                      </div>
                   ))}
               </div>
            </div>
         </div>
      </section>

       {/* 9. CLOSING SECTION */}
       <section className={`py-32 px-6 relative z-20 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'}`}>
          <div className="max-w-[1000px] mx-auto text-center">
             <h2 className={`text-5xl md:text-6xl lg:text-7xl font-black mb-10 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Education That Creates <span className="text-[#FF6A00]">Opportunity</span>
             </h2>
             <p className={`text-2xl mb-16 max-w-3xl mx-auto font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                EDOT is not just about learning, it is about unlocking potential, reducing inequality, and building a future where everyone has the chance to succeed.
             </p>
 
             <div className="flex justify-center">
                <Link to="/register" className="bg-gradient-to-r from-[#19C2E8] to-[#00D4FF] text-slate-900 px-12 py-5 rounded-xl font-black text-xl hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-cyan-500/10 flex items-center gap-3">
                  Join the Mission <ChevronRight className="w-6 h-6" />
                </Link>
             </div>
          </div>
       </section>

      {/* FOOTER PADDING */}
      <div className="pb-12"></div>
    </div>
  );
}
