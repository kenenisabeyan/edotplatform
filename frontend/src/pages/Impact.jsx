import React from 'react';
import { Link } from 'react-router-dom';
import useThemeMode from '../hooks/useThemeMode';
import { 
  Globe, TrendingUp, Users, Target, BookOpen, Zap,
  BarChart, Layers, CheckCircle, XCircle, ArrowRight, Lightbulb, 
  ShieldCheck, Network, Award, Milestone, GraduationCap, ChevronRight
} from 'lucide-react';
import CTA from '../components/CTA';

export default function Impact() {
  const isDarkMode = useThemeMode();

  return (
    <div className={`min-h-screen w-full font-sans overflow-x-hidden relative transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-[#ffffff] text-slate-800'}`}>
      
      {/* 1. HERO SECTION */}
      <section className={`relative w-full pt-40 pb-32 px-6 overflow-hidden flex flex-col items-center text-center border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
         <div className={`absolute inset-0 z-0 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-orange-50'}`}>
            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80" alt="Students learning" className={`w-full h-full object-cover ${isDarkMode ? 'opacity-30 mix-blend-overlay' : 'opacity-[0.05] mix-blend-multiply'}`} />
            <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-[#0f48b9]/40 via-[#0B1120]/80 to-[#0B1120]' : 'from-white/40 via-orange-50/80 to-orange-50'}`}></div>
         </div>
         <div className="relative z-10 max-w-[1000px] mx-auto mt-8">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 font-bold text-sm tracking-wider uppercase ${isDarkMode ? 'bg-white/10 border-white/20 text-white shadow-lg backdrop-blur-md' : 'bg-white/80 border-slate-300 text-slate-800 shadow-sm backdrop-blur-md'}`}>
               <Globe className="w-4 h-4" /> Global Impact
            </div>
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Transforming Education Into <span className="text-[#F97316]">Real Opportunity</span>
            </h1>
            <p className={`text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
               EDOT is built to close the gap between learning and opportunity — making education structured, accessible, and impactful for everyone.
            </p>
         </div>
      </section>

      {/* 2. THE REALITY WE ARE CHANGING */}
      <section className={`py-32 px-6 border-y ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative rounded-[40px] overflow-hidden shadow-2xl h-[500px]">
               <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80" alt="Education inequality" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                  <p className="text-white font-medium text-lg leading-relaxed max-w-md">Millions face limited support and structure, preventing them from reaching their true potential.</p>
               </div>
            </div>
            <div className="order-1 lg:order-2">
               <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                  <Target className="w-8 h-8" />
               </div>
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>A System That Leaves Too Many Behind</h2>
               <p className={`text-xl leading-relaxed mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Across the world, millions of learners are unable to reach their full potential — not because they lack ability, but because they lack access, structure, and support.
               </p>
               
               <div className={`p-8 rounded-[32px] border mt-8 ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
                  <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Education is often:</h3>
                  <ul className="space-y-4">
                     {[
                       "Unstructured and difficult to follow",
                       "Disconnected from real-world outcomes",
                       "Limited by financial and geographic barriers"
                     ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4">
                           <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                           <span className={`text-lg font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* 3. WHAT EDOT CHANGES */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>From Fragmented Learning to <span className="text-[#00D4FF]">Structured Growth</span></h2>
            <p className={`text-xl max-w-3xl mx-auto mb-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
               EDOT introduces a new approach — where learning is guided, progress is visible, and opportunity is built into the system. Instead of isolated courses, EDOT creates a connected ecosystem.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { title: "Learners", desc: "Follow clear learning paths", icon: BookOpen, color: "text-[#00D4FF]", bg: "bg-[#00D4FF]/20" },
                 { title: "Instructors", desc: "Provide structured guidance", icon: Users, color: "text-blue-500", bg: "bg-blue-500/20" },
                 { title: "Parents", desc: "Stay informed and engaged", icon: ShieldCheck, color: "text-[#F97316]", bg: "bg-[#F97316]/20" },
                 { title: "Sponsors", desc: "Enable access and track real impact", icon: Award, color: "text-green-500", bg: "bg-green-500/20" }
               ].map((item, i) => (
                  <div key={i} className={`p-8 rounded-[32px] border text-center transition-transform hover:-translate-y-2 ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                     <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${item.bg}`}>
                        <item.icon className={`w-8 h-8 ${item.color}`} />
                     </div>
                     <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. BEFORE AND AFTER EDOT */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-[#f8fafc] border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto">
            <h2 className={`text-4xl md:text-5xl font-black text-center mb-16 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>A Shift in How Education Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Before EDOT */}
               <div className={`p-10 rounded-[40px] border ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-red-100 shadow-lg'}`}>
                  <h3 className={`text-3xl font-black mb-8 text-red-500 flex items-center gap-3`}><XCircle className="w-8 h-8" /> Before EDOT</h3>
                  <ul className="space-y-6">
                     {[
                       "Random, disconnected learning resources",
                       "No clear progression path",
                       "Limited support systems",
                       "No visibility into outcomes"
                     ].map((text, i) => (
                        <li key={i} className="flex items-center gap-4">
                           <div className="w-2 h-2 rounded-full bg-red-500"></div>
                           <span className={`text-lg font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{text}</span>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* With EDOT */}
               <div className={`p-10 rounded-[40px] border ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-[#F0FAFF] border-blue-100 shadow-xl'}`}>
                  <h3 className={`text-3xl font-black mb-8 text-[#00D4FF] flex items-center gap-3`}><CheckCircle className="w-8 h-8" /> With EDOT</h3>
                  <ul className="space-y-6">
                     {[
                       "Structured, guided learning paths",
                       "Clear progression from basic to advanced",
                       "Integrated support from instructors and parents",
                       "Transparent tracking of progress and results"
                     ].map((text, i) => (
                        <li key={i} className="flex items-center gap-4">
                           <div className="w-2 h-2 rounded-full bg-[#00D4FF]"></div>
                           <span className={`text-lg font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{text}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* 5. MEASURING IMPACT */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className={`rounded-[40px] border relative overflow-hidden shadow-2xl h-[500px] ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
               <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Analytics Dashboard" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-10">
                  <h3 className={`text-3xl font-black mb-4 text-white`}>Key Metrics Tracked</h3>
                  <ul className="space-y-3">
                     {[
                       "Growth in active learners and instructors",
                       "Course completion and retention rates",
                       "Number of supported (sponsored) learners",
                       "Progress tracking and performance improvement"
                     ].map((metric, i) => (
                        <li key={i} className="flex items-start gap-3">
                           <TrendingUp className="w-5 h-5 text-[#00D4FF] shrink-0" />
                           <span className={`font-medium text-slate-200`}>{metric}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
            <div>
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-[#00D4FF] font-bold text-sm mb-6 uppercase tracking-wider">
                  <BarChart className="w-4 h-4" /> Data-Driven
               </div>
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Impact You Can See</h2>
               <p className={`text-xl leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  EDOT focuses on measurable outcomes — not just participation. We build education systems that generate actionable data to ensure students are actually learning.
               </p>
               <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                     <div className="text-4xl font-black text-[#F97316] mb-2">94%</div>
                     <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Completion Rate</div>
                  </div>
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                     <div className="text-4xl font-black text-[#00D4FF] mb-2">50k+</div>
                     <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Learners</div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. EXPANDING ACCESS & SPONSORSHIP */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Opportunity, <span className="text-[#00D4FF]">Not Just Access</span></h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
               One of the biggest barriers to education is financial limitation. EDOT addresses this through a sponsorship system that connects learners with supporters.
            </p>
         </div>

         <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className={`order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-6`}>
               {[
                 { title: "Underserved Learners", desc: "Gain access to premium education.", icon: Users },
                 { title: "Accountability", desc: "Through detailed progress tracking.", icon: Target },
                 { title: "Real Outcomes", desc: "Generated directly from financial support.", icon: Award },
                 { title: "Community Focus", desc: "Empowering entire regions.", icon: Globe }
               ].map((item, idx) => (
                  <div key={idx} className={`p-8 rounded-[32px] border text-center transition-transform hover:-translate-y-2 ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-slate-200 shadow-md'}`}>
                     <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-blue-500/20 text-[#00D4FF] flex items-center justify-center mb-4">
                        <item.icon className="w-7 h-7" />
                     </div>
                     <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                  </div>
               ))}
            </div>
            <div className="order-1 lg:order-2 rounded-[40px] overflow-hidden shadow-2xl h-[500px]">
               <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80" alt="Mentorship and support" className="w-full h-full object-cover" />
            </div>
         </div>
      </section>

      {/* 7. LONG-TERM VISION & SCALABILITY */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Long-Term Vision */}
            <div className={`p-10 rounded-[40px] border relative overflow-hidden group ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-[#FFF8F0] border-orange-100'}`}>
               <div className="relative z-10">
                  <div className="w-16 h-16 bg-[#F97316] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                     <Milestone className="w-8 h-8" />
                  </div>
                  <h3 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Building a Future Through Education</h3>
                  <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                     The impact of EDOT goes beyond individual learners. It contributes to:
                  </p>
                  <ul className="space-y-4">
                     {['Reducing educational inequality', 'Developing practical, job-ready skills', 'Strengthening communities through knowledge', 'Supporting innovation and economic growth'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                           <CheckCircle className="w-5 h-5 text-[#F97316]" />
                           <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{item}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* Scalable by Design */}
            <div className={`p-10 rounded-[40px] border relative overflow-hidden group ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-[#F0FAFF] border-blue-100'}`}>
               <div className="relative z-10">
                  <div className="w-16 h-16 bg-[#00D4FF] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                     <Network className="w-8 h-8" />
                  </div>
                  <h3 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Built to Grow and Expand</h3>
                  <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                     EDOT is designed as a scalable digital platform that can expand across regions and adapt to different educational needs.
                  </p>
                  <ul className="space-y-4">
                     {['Support diverse learning levels', 'Integrate new courses and domains', 'Connect more learners, instructors, and sponsors', 'Grow into a global education ecosystem'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                           <CheckCircle className="w-5 h-5 text-[#00D4FF]" />
                           <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>{item}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

         </div>
      </section>

      {/* 8. BUILT THROUGH INNOVATION (MiNT) */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1000px] mx-auto text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#00D4FF] to-blue-600 text-white rounded-full flex items-center justify-center mb-8 shadow-xl">
               <Lightbulb className="w-10 h-10" />
            </div>
            <h2 className={`text-4xl md:text-5xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Aligned With Broader Educational Goals</h2>
            <p className={`text-xl leading-relaxed max-w-3xl mx-auto mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
               EDOT was developed and refined through innovation and capacity-building programs supported by the <strong>Ministry of Innovation and Technology Ethiopia</strong> and partner institutions.
            </p>
            <p className={`text-xl leading-relaxed max-w-3xl mx-auto font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
               This foundation reflects a commitment to using technology and education to create meaningful, scalable impact.
            </p>
         </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className={`py-32 px-6 relative z-20 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'}`}>
         <div className="max-w-[1000px] mx-auto text-center">
            <h2 className={`text-5xl md:text-6xl font-black mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Impact Starts With Access — <span className="text-[#F97316]">And Grows With Opportunity</span>
            </h2>
            <p className={`text-2xl mb-12 max-w-2xl mx-auto font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
               EDOT is not just about improving how people learn. It is about ensuring that learning leads to opportunity — and that opportunity is accessible to everyone.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
               <Link to="/courses" className="bg-[#0B1120] text-white dark:bg-white dark:text-slate-900 px-10 py-4 rounded-xl font-black text-lg hover:bg-slate-700 dark:hover:bg-slate-200 hover:-translate-y-1 transition-all duration-300 shadow-xl">
                 Explore the Ecosystem
               </Link>
               <Link to="/register" className="bg-[#F97316] text-[#ffffff] px-10 py-4 rounded-xl font-black text-lg hover:bg-[#e66a00] hover:-translate-y-1 transition-all duration-300 shadow-[0_15px_30px_rgba(249,115,22,0.3)] flex items-center justify-center gap-3">
                 Join the Impact <ChevronRight className="w-5 h-5" />
               </Link>
            </div>
         </div>
      </section>

    </div>
  );
}
