import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useThemeMode from '../hooks/useThemeMode';
import { useAuth } from '../context/AuthContext';
import { getRecentPublicUsers } from '../utils/api';
import { 
  ArrowRight, BookOpen, BrainCircuit, Rocket, LineChart, Laptop, Target, UserCheck, Calculator, Globe, 
  PlayCircle, MessageSquare, Code, Cpu, Shield, Users, Gift, Star, ChevronDown, CheckCircle, Heart, Handshake, 
  LayoutDashboard, Languages, Briefcase, Zap, Newspaper, Quote, GitBranch, AlertTriangle, MonitorPlay, Sparkles, GraduationCap,
  Award, Key, TrendingUp
} from 'lucide-react';

const homePageImg = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/tdqdi93rhrzcnoipobz2';
const heroVideoUrl = 'https://res.cloudinary.com/dacck6udl/video/upload/q_auto:best,f_auto/v1777442042/edot_uploads/gtvmcbs5km7gjwoab7cf.mp4';

export default function Home() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [totalUsers, setTotalUsers] = useState('10k+');

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getRecentPublicUsers();
      if (data && data.success) {
        if (data.totalCount > 10000) {
           setTotalUsers('10k+');
        } else if (data.totalCount >= 15) {
           const roundedFloor = Math.floor(data.totalCount / 5) * 5;
           setTotalUsers(`${roundedFloor}+`);
        } else if (data.totalCount > 0) {
           setTotalUsers(data.totalCount.toString());
        }
      }
    };
    fetchUsers();
  }, []);

  const [formData, setFormData] = useState({ name: '', email: '', role: 'Learner', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoadingSubmit(false);
      setTimeout(() => {
        setFormData({ name: '', email: '', role: 'Learner', subject: '', message: '' });
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* 1. HERO SECTION */}
      <div className="relative w-full">
         <section className={`relative w-full pt-32 pb-32 lg:pt-40 lg:pb-48 flex items-center overflow-visible ${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#FAFAFA]'}`}>
            
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full relative z-20 flex flex-col lg:flex-row items-center gap-10">
               
               {/* LEFT SIDE TEXT */}
               <div className="flex-1 text-left lg:pr-6 lg:max-w-[680px] z-20">

                  {/* Heading */}
                  <h1 className={`font-black text-[3.8rem] md:text-[4.2rem] lg:text-[4.5rem] leading-[1.1] mb-6 tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1A202C]'}`}>
                     Education Should Be <br className="hidden md:block" />
                     Accessible to <br className="hidden md:block" />
                     Everyone — <br className="hidden lg:block" />
                     <span className="text-[#F97316] relative inline-block mt-2 whitespace-nowrap">
                        <span className="relative z-10">Not Just the Privileged</span>
                        {/* Orange Underline */}
                        <div className="absolute w-full h-1.5 bottom-1 left-0 bg-[#F97316] z-0"></div>
                     </span>
                  </h1>

                  {/* Paragraph */}
                  <p className={`text-lg md:text-[19px] max-w-[600px] mb-8 leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                     EDOT is a full-stack learning platform that connects learners, instructors, parents, and sponsors into one powerful ecosystem — delivering structured education, real skills, and real opportunities.
                  </p>

                  {/* Sub paragraph */}
                  <p className="text-[#F97316] font-bold text-lg md:text-xl mb-10 flex items-center gap-2">
                     <Sparkles className="w-5 h-5" /> Learn. Teach. Support. Sponsor a Future.
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                     <Link to="/register?role=student" className="bg-[#F97316] text-white px-8 py-4 rounded-[14px] font-bold text-lg hover:bg-[#e66a00] hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_20px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2">
                        Start Learning <ArrowRight className="w-5 h-5" />
                     </Link>
                     <Link to="/register?role=sponsor" className={`px-8 py-4 rounded-[14px] font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 border ${isDarkMode ? 'border-[#F97316] text-[#F97316] hover:bg-[#F97316]/10' : 'border-[#F97316] text-[#F97316] hover:bg-orange-50'}`}>
                        Sponsor a Student <Heart className="w-5 h-5" />
                     </Link>
                  </div>
               </div>
               
               {/* RIGHT SIDE VIDEO */}
               <div className="flex-1 w-full relative z-10 mt-12 lg:mt-0 flex justify-center lg:justify-end">
                  <div className="relative w-full lg:max-w-[680px] h-full flex flex-col justify-center">
                     {/* Subtle Background Glow */}
                     <div className={`absolute -inset-4 rounded-[32px] blur-3xl opacity-30 ${isDarkMode ? 'bg-[#F97316]' : 'bg-[#F97316]/50'} -z-10`}></div>
                     
                     {/* Video Container */}
                     <div className={`relative rounded-[24px] overflow-hidden border-[6px] transition-transform duration-500 hover:scale-[1.02] ${isDarkMode ? 'border-[#1E293B] shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]'}`}>
                        <video 
                           src={heroVideoUrl}
                           autoPlay 
                           loop 
                           muted 
                           playsInline
                           className="w-full h-[400px] lg:h-[450px] object-cover bg-black"
                        />
                     </div>
                  </div>
               </div>

            </div>
         </section>

         {/* 4-COLUMN FLOATING CARD AT BOTTOM */}
         <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 z-30 px-6">
            <div className={`max-w-[1250px] mx-auto rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 lg:divide-x ${isDarkMode ? 'bg-[#111827] divide-white/10 border border-white/10' : 'bg-white divide-slate-100'}`}>
               {[
                 { title: "Learn", desc: "Access quality courses anytime, anywhere.", icon: BookOpen, color: "bg-[#0940B5]" },
                 { title: "Teach", desc: "Empower others with your knowledge.", icon: Users, color: "bg-[#10B981]" },
                 { title: "Support", desc: "Help learners grow and succeed.", icon: Heart, color: "bg-[#FBBF24]" },
                 { title: "Sponsor", desc: "Sponsor education, change a life.", icon: Gift, color: "bg-[#8B5CF6]" }
               ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-5 p-2 lg:px-8 hover:translate-y-[-2px] transition-transform duration-300">
                     <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0 shadow-md text-white ${item.color}`}>
                        <item.icon className="w-7 h-7" />
                     </div>
                     <div>
                        <h3 className={`font-black text-[19px] mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                        <p className={`text-[14px] leading-snug font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* ABOUT SECTION */}
      <section id="about" className={`relative w-full pt-32 pb-32 px-6 overflow-hidden flex flex-col items-center text-center border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
         {/* Premium CSS Background */}
         <div className={`absolute inset-0 z-0 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#FAFAFA]'}`}>
            <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]`}></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00D4FF]/10 dark:bg-[#00D4FF]/10 blur-[120px] rounded-full pointer-events-none"></div>
         </div>
         <div className="relative z-10 max-w-[1000px] mx-auto mt-8">
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Building a Better Future Through <span className={`${isDarkMode ? 'text-[#00D4FF]' : 'text-blue-600'}`}>Education</span>
            </h1>
            <p className={`text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
               EDOT is more than a learning platform — it is a structured system designed to make education accessible, guided, and impactful for everyone.
            </p>
         </div>
      </section>

      {/* 2. THE REALITY OF EDUCATION TODAY */}
      <section className={`pt-48 pb-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
               <div className={`flex-1 w-full relative rounded-[40px] flex items-center justify-center p-8 h-[500px] border transition-all duration-500 hover:-translate-y-2 ${isDarkMode ? 'bg-[#111827] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'}`}>
                  <img src="/images/problem_3d.png" alt="Educational challenges" className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-transform duration-700" />
                  <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-[85%] max-w-sm backdrop-blur-xl rounded-2xl p-5 shadow-2xl border text-center ${isDarkMode ? 'bg-[#0B1120]/80 border-white/10' : 'bg-white/90 border-slate-100'}`}>
                     <p className={`font-bold text-[15px] leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Millions of bright minds lack the structured resources needed to succeed.</p>
                  </div>
               </div>
               
               <div className="flex-1 text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm mb-6 uppercase tracking-wider">
                     <AlertTriangle className="w-4 h-4" /> The Problem
                  </div>
                  <h2 className={`text-4xl md:text-5xl font-black mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                     Education Is Available <span className="text-red-500">But Not Equal</span>
                  </h2>
                  <p className={`text-xl leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                     Many learners struggle to find clear, structured, and high-quality education. Resources are scattered, guidance is limited, and opportunities are not equally accessible.
                  </p>
                  
                  <div className="space-y-6 mt-8">
                     {[
                       "Inconsistent Tutorials & Content",
                       "No Structured Learning Paths",
                       "Limited Access for Rural Areas"
                     ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-5 h-5" />
                           </div>
                           <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 3. A BETTER WAY TO LEARN */}
      <section id="solution" className={`py-32 px-6 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}>
         <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
               <div className="flex-1 text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm mb-6 uppercase tracking-wider">
                     <Shield className="w-4 h-4" /> The Solution
                  </div>
                  <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                     EDOT Changes How Learning Works
                  </h2>
                  <p className={`text-xl leading-relaxed mb-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                     EDOT transforms education into a structured, guided, and interactive experience, built to support learners at every stage.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {[
                       { title: "Personalized Paths", icon: Target },
                       { title: "Instant Support", icon: MessageSquare },
                       { title: "Continuous Feedback", icon: LineChart },
                       { title: "Skilled Instructors", icon: GraduationCap }
                     ].map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                           <div className="w-10 h-10 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] flex items-center justify-center shrink-0">
                              <item.icon className="w-5 h-5" />
                           </div>
                           <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div className={`flex-1 w-full relative rounded-[40px] flex items-center justify-center p-8 h-[500px] border transition-all duration-500 hover:-translate-y-2 ${isDarkMode ? 'bg-[#111827] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'}`}>
                  <img src="/images/solution_3d.png" alt="Structured Learning Solution" className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-transform duration-700" />
                  <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-[85%] max-w-sm backdrop-blur-xl rounded-2xl p-5 shadow-2xl border text-center ${isDarkMode ? 'bg-[#0B1120]/80 border-white/10' : 'bg-white/90 border-slate-100'}`}>
                     <p className={`font-bold text-[15px] leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>A clear, structured path from foundational concepts to mastery.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 4. EXPLORE LEARNING CATEGORIES */}
      <section id="courses" className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Knowledge That <span className="text-[#F97316]">Grows With You</span>
            </h2>
            <p className={`text-xl mb-16 font-medium max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               From foundational education to professional skills, EDOT supports every stage of learning.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {[
                 { title: "Mathematics & Natural Sciences", icon: Calculator, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
                 { title: "Social Sciences", icon: Globe, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
                 { title: "Languages", icon: Languages, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
                 { title: "Technology & Development", icon: Laptop, color: "text-[#00D4FF]", bg: "bg-[#001030] dark:bg-[#0B1120]" },
                 { title: "Business & Entrepreneurship", icon: Briefcase, color: "text-[#F97316]", bg: "bg-orange-100 dark:bg-orange-900/30" },
                 { title: "Personal Development", icon: Target, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/30" }
               ].map((cat, i) => (
                 <div key={i} className={`flex items-center gap-6 p-6 rounded-[20px] shadow-sm border hover:-translate-y-2 transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-[#111827] border-white/5 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg'}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${cat.bg}`}>
                       <cat.icon className={`w-8 h-8 ${cat.color}`} />
                    </div>
                    <h3 className={`text-xl font-bold text-left leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cat.title}</h3>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. BUILT FOR EVERYONE IN EDUCATION */}
      <section id="audience" className={`py-32 relative z-20 overflow-hidden border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-20">
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  One Platform — <span className="text-[#F97316]">Every Role Connected</span>
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[{
                  title: 'Learners',
                  icon: GraduationCap,
                  description: 'Learn step-by-step, track your progress, and build skills for your future.'
               },{
                  title: 'Instructors',
                  icon: BookOpen,
                  description: 'Create impactful courses and guide learners with structured teaching tools.'
               },{
                  title: 'Parents',
                  icon: Users,
                  description: 'Stay involved with real-time insights into learning progress and performance.'
               },{
                  title: 'Sponsors',
                  icon: Heart,
                  description: 'Support learners in need and track the real impact of your contribution.'
               }].map((item, idx) => (
                  <div key={idx} className={`relative flex flex-col items-center text-center p-10 rounded-[32px] overflow-hidden group border transition-all duration-500 hover:-translate-y-3 ${isDarkMode ? 'bg-[#111827] border-white/10 hover:border-[#F97316]/50' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-[#F97316]/50 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)]'}`}>
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F97316] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white border border-slate-100'}`}>
                        <item.icon className={`w-10 h-10 ${isDarkMode ? 'text-[#00D4FF]' : 'text-[#0940B5]'}`} />
                     </div>
                     <h3 className={`text-2xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                     <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.description}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. SUPPORT A LEARNER. CHANGE A LIFE. */}
      <section id="impact" className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-[#FFF8F0] border-orange-100'}`}>
         <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm mb-6 uppercase tracking-wider">
                     <Handshake className="w-4 h-4" /> Sponsorship
                  </div>
                  <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                     Education Powered by <span className="text-[#F97316]">Opportunity</span>
                  </h2>
                  <p className={`text-xl leading-relaxed mb-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                     EDOT connects learners with sponsors who want to make a difference. Support is not just financial — it’s a pathway to real change.
                  </p>

                  <div className="flex flex-col gap-6 mb-12">
                     {[
                       "Fund education for students who lack access",
                       "Track learning progress and outcomes",
                       "Create long-term opportunities"
                     ].map((point, idx) => (
                       <div key={idx} className={`flex items-center gap-5 p-5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#111827] border-white/5 hover:border-orange-500/30' : 'bg-white border-orange-100 hover:border-orange-200 shadow-sm'}`}>
                          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                             <Heart className="w-6 h-6 text-[#F97316]" />
                          </div>
                          <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{point}</span>
                       </div>
                     ))}
                  </div>

                  <button className="w-full sm:w-auto bg-[#F97316] text-white font-black px-12 py-5 rounded-xl hover:bg-[#e66a00] transition-all text-xl shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:-translate-y-1 duration-300">
                     Become a Sponsor
                  </button>
               </div>

               <div className="flex-1 w-full relative hidden lg:flex justify-center">
                  <div className={`relative w-full max-w-[500px] h-[550px] rounded-[40px] overflow-hidden shadow-2xl border-8 ${isDarkMode ? 'border-[#111827]' : 'border-white'}`}>
                     <img src={homePageImg} alt="Mentor helping student" className="w-full h-full object-cover" />
                     {/* Floating badge */}
                     <div className="absolute bottom-8 right-8 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F97316]/20 rounded-full flex items-center justify-center shrink-0">
                           <Gift className="w-6 h-6 text-[#F97316]" />
                        </div>
                        <div>
                           <div className="font-black text-xl text-slate-900 dark:text-white">Transform</div>
                           <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Communities</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 7. BUILT FOR REAL LEARNING */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               More Than Courses — <span className="text-[#00D4FF]">A Complete Learning System</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto leading-relaxed mb-20 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
               EDOT is designed as a full learning ecosystem, not just a content platform.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { title: "Role-based dashboards for each user", icon: LayoutDashboard },
                 { title: "Structured learning from primary to advanced levels", icon: GitBranch },
                 { title: "Real-time progress tracking", icon: LineChart },
                 { title: "Accessible across devices", icon: Laptop },
                 { title: "Integrated sponsorship system", icon: Handshake },
                 { title: "Verified certificates upon completion", icon: Shield }
               ].map((feature, idx) => (
                 <div key={idx} className={`flex flex-col items-center p-10 rounded-[32px] border transition-all hover:-translate-y-2 ${isDarkMode ? 'bg-[#111827] border-white/5 hover:border-[#00D4FF]/30' : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5'}`}>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-blue-500/20 text-[#00D4FF] flex items-center justify-center mb-6 shadow-sm">
                       <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 8. REAL IMPACT, MEASURABLE GROWTH */}
      <section className={`py-32 px-6 relative overflow-hidden bg-[#0B1120]`}>
         {/* Premium Abstract Background */}
         <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#F97316]/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#00D4FF]/10 blur-[100px] rounded-full pointer-events-none"></div>
         </div>

         <div className="max-w-[1200px] mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">Tracking What Truly Matters</h2>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed mb-20 text-slate-300">
               EDOT focuses on measurable results — not just participation.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
               {[
                 { num: "100+", label: "Active Learners & Instructors" },
                 { num: "95%", label: "Course Completion Rates" },
                 { num: "High", label: "Engagement & Consistency" },
                 { num: "Growing", label: "Sponsorship Support" }
               ].map((stat, idx) => (
                 <div key={idx} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#F97316]/0 to-[#F97316]/20 rounded-[32px] transform scale-90 group-hover:scale-100 transition-transform duration-500"></div>
                    <div className="relative p-6">
                       <div className="text-5xl md:text-6xl font-black text-[#F97316] mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">{stat.num}</div>
                       <div className="text-lg font-bold leading-snug text-slate-200">{stat.label}</div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 9. FROM IDEA TO IMPACT */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[900px] mx-auto text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-[#00D4FF] text-white rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-blue-500/30 transform rotate-3">
               <Zap className="w-10 h-10" />
            </div>
            <h2 className={`text-4xl md:text-5xl font-black mb-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Built Through Innovation and Collaboration
            </h2>
            <p className={`text-xl leading-relaxed mb-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
               EDOT was developed and refined through innovation and capacity-building programs supported by the <strong className={`${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ministry of Innovation and Technology Ethiopia</strong> and partner institutions.
            </p>
            <p className={`text-xl leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               It reflects a commitment to transforming ideas into real solutions that improve education and create opportunities.
            </p>
         </div>
      </section>

      {/* 10. REAL VOICES, REAL CHANGE (TESTIMONIALS) */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-20">
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  What People Are Saying
               </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { role: "Learner", icon: GraduationCap, quote: "EDOT gave me access to learning I couldn’t find before. Now I understand and apply what I learn." },
                 { role: "Parent", icon: Users, quote: "I can clearly see my child’s progress and growth — not just results, but real understanding." },
                 { role: "Instructor", icon: BookOpen, quote: "This platform allows me to truly guide learners, not just upload content." },
                 { role: "Sponsor", icon: Heart, quote: "I can see exactly who I’m helping and how they are improving." }
               ].map((test, idx) => (
                 <div key={idx} className={`p-10 rounded-[32px] shadow-sm border relative overflow-hidden group ${isDarkMode ? 'bg-[#111827] border-white/5 hover:border-[#F97316]/30' : 'bg-slate-50 border-slate-200 hover:border-[#F97316]/30 hover:shadow-xl'}`}>
                    <Quote className="absolute top-8 right-8 w-16 h-16 text-[#F97316] opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
                    <p className={`text-2xl font-medium italic leading-relaxed mb-10 relative z-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>"{test.quote}"</p>
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F97316] to-[#e66a00] flex items-center justify-center text-white shadow-md">
                          <test.icon className="w-6 h-6" />
                       </div>
                       <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{test.role}</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 11. FINAL CALL TO ACTION */}
      <section className={`py-32 px-6 relative z-20 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'}`}>
         <div className="max-w-[1000px] mx-auto text-center">
            <h2 className={`text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Be Part of the <span className="text-[#00D4FF]">Future of Education</span>
            </h2>

            <p className={`text-2xl mb-16 max-w-3xl mx-auto font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
               Whether you want to learn, teach, guide, or support — EDOT gives you the tools to make a real difference.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
               <Link to="/register?role=student" className="w-full sm:w-auto bg-[#F97316] text-[#ffffff] px-12 py-5 rounded-xl font-black text-xl hover:bg-[#e66a00] hover:-translate-y-1 transition-all duration-300 shadow-[0_15px_30px_rgba(249,115,22,0.3)]">
                 Start Learning
               </Link>
               <Link to="/register?role=instructor" className={`w-full sm:w-auto px-12 py-5 rounded-xl font-black text-xl transition-all duration-300 border-2 hover:-translate-y-1 ${isDarkMode ? 'bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white' : 'bg-transparent text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-800'}`}>
                 Teach on EDOT
               </Link>
               <button className={`w-full sm:w-auto px-12 py-5 rounded-xl font-black text-xl transition-all duration-300 border-2 hover:-translate-y-1 ${isDarkMode ? 'bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white' : 'bg-transparent text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-800'}`}>
                 Sponsor a Student
               </button>
            </div>
         </div>
      </section>



    </div>
  );
}