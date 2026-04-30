import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useThemeMode from '../hooks/useThemeMode';
import { useAuth } from '../context/AuthContext';
import { getRecentPublicUsers } from '../utils/api';
import { 
  ArrowRight, BookOpen, BrainCircuit, Rocket, LineChart, Laptop, Target, UserCheck, Calculator, Globe, 
  PlayCircle, MessageSquare, Code, Cpu, Shield, Users, Gift, Star, ChevronDown, CheckCircle, Heart, Handshake, 
  LayoutDashboard, Languages, Briefcase, Zap, Newspaper, Quote, GitBranch, AlertTriangle, MonitorPlay, Sparkles, GraduationCap
} from 'lucide-react';

const homePageImg = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/tdqdi93rhrzcnoipobz2';
const heroVideoUrl = 'https://res.cloudinary.com/dacck6udl/video/upload/v1777442042/edot_uploads/gtvmcbs5km7gjwoab7cf.mp4';

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

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[95vh] flex items-center overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-[#020b1f] via-[#0f48b9] to-[#00d4ff] z-0"></div>
         <div className={`absolute right-0 top-0 bottom-0 w-[45%] z-0 hidden lg:block ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`} style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)' }}></div>
         <div className="absolute top-[15%] right-[10%] text-white/40 text-9xl font-black font-mono tracking-widest z-10 rotate-12 hidden lg:block opacity-30">&lt;/&gt;</div>
         
         <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full relative z-20 flex flex-col lg:flex-row items-center pt-32 pb-20 gap-16">
            <div className="flex-1 text-left lg:pr-10">
               <div className={`inline-flex items-center gap-3 mb-8 px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-lg`}>
                  <div className="flex items-center gap-1 text-[#FF7A00]">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#FF7A00] text-[#FF7A00]" />)}
                  </div>
                  <span className={`text-sm font-bold ml-2 text-white/95`}>Trusted by {totalUsers} learners worldwide</span>
               </div>

               <h1 className="text-white font-black text-5xl md:text-6xl lg:text-[4.2rem] leading-[1.1] mb-8 tracking-tight">
                  Education Should Be Accessible to Everyone — <span className="text-[#00D4FF] relative whitespace-nowrap">
                     <span className="relative z-10">Not Just the Privileged</span>
                     <svg className="absolute w-full h-4 -bottom-1 left-0 text-[#FF7A00] opacity-80 z-0" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="transparent" />
                     </svg>
                  </span>
               </h1>
               <p className="text-white/90 text-xl max-w-[650px] mb-6 leading-relaxed font-medium">
                  EDOT is a full-stack learning platform that connects learners, instructors, parents, and sponsors into one powerful ecosystem — delivering structured education, real skills, and real opportunities.
               </p>
               <p className="text-[#FF7A00] font-bold text-2xl mb-12 flex items-center gap-3">
                  <Sparkles className="w-6 h-6" /> Learn. Teach. Support. Sponsor a Future.
               </p>
               <div className="flex gap-5 flex-wrap">
                  <Link to="/register?role=student" className="bg-[#F97316] text-white border-2 border-[#F97316] px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#e66a00] hover:border-[#e66a00] hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_30px_rgba(249,115,22,0.3)] flex items-center gap-2">
                     Start Learning <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button className="bg-transparent text-white border-2 border-white/60 px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 hover:border-white transition-all duration-300 flex items-center gap-2">
                     Sponsor a Student <Heart className="w-5 h-5" />
                  </button>
               </div>
            </div>
            
            <div className="flex-1 w-full mt-16 lg:mt-0 flex justify-center relative">
               <div className="relative w-full max-w-[550px] lg:max-w-[600px] aspect-[4/5] rounded-[32px] flex items-center justify-center overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)] border-[6px] border-white/10 group">
                  <video 
                    src={heroVideoUrl} 
                    autoPlay loop muted playsInline 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#F97316]/20 to-[#00D4FF]/20 mix-blend-overlay pointer-events-none"></div>
                  
                  {/* Floating badge */}
                  <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm text-slate-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
                     <div className="w-12 h-12 bg-[#00D4FF]/20 rounded-full flex items-center justify-center">
                        <MonitorPlay className="w-6 h-6 text-[#0940B5]" />
                     </div>
                     <div>
                        <div className="font-black text-xl">100%</div>
                        <div className="text-sm font-semibold text-slate-600">Structured Learning</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 2. THE REALITY OF EDUCATION TODAY */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0F172A] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
               <div className="flex-1 w-full relative rounded-[40px] overflow-hidden shadow-2xl h-[500px]">
                  <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80" alt="Rural classroom" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                     <p className="text-white font-medium text-lg leading-relaxed max-w-md">Millions of bright minds lack the structured resources needed to succeed.</p>
                  </div>
               </div>
               
               <div className="flex-1 text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm mb-6 uppercase tracking-wider">
                     <AlertTriangle className="w-4 h-4" /> The Problem
                  </div>
                  <h2 className={`text-4xl md:text-5xl font-black mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                     Education Is Available — <span className="text-red-500">But Not Equal</span>
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
                     EDOT transforms education into a structured, guided, and interactive experience — built to support learners at every stage.
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
               
               <div className="flex-1 w-full rounded-[40px] overflow-hidden shadow-2xl border-[6px] border-[#00D4FF]/10">
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Dashboard UI" className="w-full h-auto object-cover" />
               </div>
            </div>
         </div>
      </section>

      {/* 4. EXPLORE LEARNING CATEGORIES */}
      <section id="courses" className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0F172A] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
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
                 { title: "Technology & Development", icon: Laptop, color: "text-[#00D4FF]", bg: "bg-[#001030] dark:bg-slate-800" },
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
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-slate-100'}`}>
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
      <section id="impact" className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0F172A] border-white/5' : 'bg-[#FFF8F0] border-orange-100'}`}>
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
                     <div className="absolute bottom-8 right-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
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
      <section className={`py-32 px-6 border-t relative overflow-hidden ${isDarkMode ? 'bg-[#0F172A] border-white/5' : 'bg-slate-900 border-slate-800'}`}>
         {/* Background Image */}
         <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80" alt="Students celebrating" className="w-full h-full object-cover opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/90 to-[#0F172A]/95"></div>
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
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0F172A] border-white/5' : 'bg-white border-slate-200'}`}>
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

      {/* 12. FOOTER */}
      <footer className={`py-16 px-6 border-t ${isDarkMode ? 'bg-[#0F172A] border-white/10' : 'bg-slate-900 text-white'}`}>
         <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
               <div className="text-3xl font-black text-[#00D4FF] tracking-tighter mb-6">EDOT.</div>
               <p className="text-slate-400 leading-relaxed font-medium">Delivering structured education, real skills, and real opportunities for everyone.</p>
            </div>
            
            <div>
               <h4 className="font-bold text-lg mb-6 text-white uppercase tracking-wider">Platform</h4>
               <ul className="space-y-4">
                  <li><Link to="/about" className="text-slate-400 hover:text-[#00D4FF] transition-colors font-medium">About EDOT</Link></li>
                  <li><Link to="/courses" className="text-slate-400 hover:text-[#00D4FF] transition-colors font-medium">Courses</Link></li>
                  <li><a href="#impact" className="text-slate-400 hover:text-[#00D4FF] transition-colors font-medium">Impact</a></li>
               </ul>
            </div>
            
            <div>
               <h4 className="font-bold text-lg mb-6 text-white uppercase tracking-wider">Support</h4>
               <ul className="space-y-4">
                  <li><Link to="/contact" className="text-slate-400 hover:text-[#00D4FF] transition-colors font-medium">Contact Us</Link></li>
                  <li><Link to="/help" className="text-slate-400 hover:text-[#00D4FF] transition-colors font-medium">Help Center</Link></li>
                  <li><Link to="/privacy" className="text-slate-400 hover:text-[#00D4FF] transition-colors font-medium">Privacy & Terms</Link></li>
               </ul>
            </div>
            
            <div>
               <h4 className="font-bold text-lg mb-6 text-white uppercase tracking-wider">Contact</h4>
               <ul className="space-y-4 text-slate-400 font-medium">
                  <li>+251 900 000 000</li>
                  <li>support@edot.com</li>
                  <li className="pt-4 flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F97316] transition-colors cursor-pointer"><Globe className="w-5 h-5" /></div>
                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F97316] transition-colors cursor-pointer"><MessageSquare className="w-5 h-5" /></div>
                  </li>
               </ul>
            </div>
         </div>
         <div className="max-w-[1200px] mx-auto pt-8 border-t border-white/10 text-center text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} EDOT Platform. All rights reserved.
         </div>
      </footer>

      {/* Floating Action Button (Chat) */}
      <div className="fixed bottom-8 right-8 z-50">
         <button className="w-16 h-16 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-[0_15px_30px_rgba(249,115,22,0.4)] hover:scale-110 transition-transform duration-300">
            <MessageSquare className="w-7 h-7" />
         </button>
      </div>

    </div>
  );
}