import React from 'react';
import { Link } from 'react-router-dom';
import useThemeMode from '../hooks/useThemeMode';
import { 
  Heart, Users, ShieldCheck, Target, 
  ArrowRight, Activity, LineChart, Handshake,
  CheckCircle, Globe, ChevronRight, Zap
} from 'lucide-react';

export default function Sponsorship() {
  const isDarkMode = useThemeMode();

  return (
    <div className={`min-h-screen w-full font-sans overflow-x-hidden relative transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-[#ffffff] text-slate-800'}`}>
      
      {/* 1. HERO SECTION */}
      <section className={`relative w-full pt-40 pb-32 px-6 overflow-hidden flex flex-col items-center text-center border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
         {/* Premium CSS Background */}
         <div className={`absolute inset-0 z-0 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#FAFAFA]'}`}>
            <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]`}></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00D4FF]/10 dark:bg-[#00D4FF]/10 blur-[120px] rounded-full pointer-events-none"></div>
         </div>
         <div className="relative z-10 max-w-[1000px] mx-auto mt-8">
            <h1 className={`text-5xl md:text-6xl lg:text-[4.5rem] font-black mb-8 leading-[1.1] tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1A202C]'}`}>
               Give the Gift of <br className="hidden md:block" />
               <span className="text-[#F97316] relative inline-block mt-2 whitespace-nowrap">
                  <span className="relative z-10">Education</span>
                  {/* Orange Underline */}
                  <div className="absolute w-full h-1.5 bottom-1 left-0 bg-[#F97316] z-0"></div>
               </span>
            </h1>
            <p className={`text-xl md:text-[20px] font-medium max-w-3xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
               Connect directly with learners in need. Track their progress, see their results, and watch your support transform their future.
            </p>
         </div>
      </section>

      {/* 2. THE NEED SECTION */}
      <section className={`py-32 px-6 border-y ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative rounded-[40px] overflow-hidden shadow-2xl h-[500px]">
               <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80" alt="Students in need" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                  <p className="text-white font-medium text-lg leading-relaxed max-w-md">Financial barriers are the #1 reason talented students leave education.</p>
               </div>
            </div>
            <div className="order-1 lg:order-2">
               <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                  <Target className="w-8 h-8" />
               </div>
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Brilliance is Everywhere. <span className="text-red-500">Opportunity is Not.</span></h2>
               <p className={`text-xl leading-relaxed mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Across communities, thousands of highly capable learners are forced to abandon their education due to financial constraints. They don't lack the will to learn — they just lack the resources.
               </p>
               <p className={`text-xl leading-relaxed font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                  EDOT's Sponsorship program bridges this gap by connecting generous supporters directly with verified students.
               </p>
            </div>
         </div>
      </section>

      {/* 3. HOW IT WORKS (Icons only, step-by-step) */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>How Sponsorship <span className="text-[#00D4FF]">Works</span></h2>
            <p className={`text-xl max-w-3xl mx-auto mb-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
               A transparent, end-to-end system designed to ensure every dollar directly supports learning.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
               <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-slate-200 dark:bg-white/10 -translate-y-1/2 z-0"></div>
               {[
                 { step: "01", title: "Select a Learner", desc: "Browse profiles of verified students who need support.", icon: Users, color: "text-[#00D4FF]", bg: "bg-blue-100 dark:bg-blue-900/30" },
                 { step: "02", title: "Fund Education", desc: "Provide a secure micro-scholarship for their courses.", icon: Handshake, color: "text-[#F97316]", bg: "bg-orange-100 dark:bg-orange-900/30" },
                 { step: "03", title: "Track Progress", desc: "Watch their exam scores and module completions.", icon: Activity, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
                 { step: "04", title: "See the Impact", desc: "Celebrate their graduation and certification.", icon: Zap, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" }
               ].map((item, i) => (
                  <div key={i} className={`relative z-10 p-8 rounded-[32px] border text-center transition-transform hover:-translate-y-2 ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-slate-200 shadow-md'}`}>
                     <div className={`text-[12px] font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Step {item.step}</div>
                     <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner ${item.bg}`}>
                        <item.icon className={`w-8 h-8 ${item.color}`} />
                     </div>
                     <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. TRANSPARENCY & TRACKING */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-[#00D4FF] font-bold text-sm mb-6 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> 100% Transparent
               </div>
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Total Visibility Into Your Impact</h2>
               <p className={`text-xl leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  We don't just ask for funds. We provide a real-time dashboard where you can see exactly how your sponsored students are performing.
               </p>
               <ul className="space-y-4 mb-8">
                  {[
                    "View course completion percentages",
                    "Monitor quiz and exam scores",
                    "See learning consistency and attendance",
                    "Receive updates when milestones are reached"
                  ].map((text, i) => (
                     <li key={i} className="flex items-center gap-4">
                        <CheckCircle className="w-6 h-6 text-[#00D4FF] shrink-0" />
                        <span className={`text-lg font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{text}</span>
                     </li>
                  ))}
               </ul>
            </div>
            <div className={`p-8 rounded-[40px] border relative overflow-hidden shadow-2xl h-[500px] ${isDarkMode ? 'border-white/5 bg-[#111827]' : 'border-slate-200 bg-white'}`}>
               <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Progress Tracking Dashboard" className="w-full h-full object-cover rounded-2xl" />
            </div>
         </div>
      </section>

      {/* 5. IMPACT & SUCCESS */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>The Final <span className="text-green-500">Result</span></h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
               Every sponsorship ends with a life changed.
            </p>
         </div>

         <div className="max-w-[1200px] mx-auto relative rounded-[40px] overflow-hidden shadow-2xl h-[600px]">
            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80" alt="Student Graduation Success" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-10 md:p-16 text-center">
               <h3 className={`text-4xl md:text-5xl font-black mb-4 text-white`}>Empowering the Next Generation</h3>
               <p className="text-xl text-slate-200 max-w-2xl mx-auto">Your support turns potential into actualized professional and academic success.</p>
            </div>
         </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className={`py-32 px-6 relative z-20 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-gradient-to-b from-white to-orange-50 border-slate-200'}`}>
         <div className="max-w-[1000px] mx-auto text-center">
            <h2 className={`text-5xl md:text-6xl font-black mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               Ready to <span className="text-[#F97316]">Change a Life?</span>
            </h2>
            <p className={`text-2xl mb-12 max-w-2xl mx-auto font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
               Join our network of sponsors today and start making a direct, trackable impact on students worldwide.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
               <Link to="/register" className="bg-[#F97316] text-[#ffffff] px-10 py-4 rounded-xl font-black text-lg hover:bg-[#e66a00] hover:-translate-y-1 transition-all duration-300 shadow-[0_15px_30px_rgba(249,115,22,0.3)] flex items-center justify-center gap-3">
                 Become a Sponsor <ChevronRight className="w-5 h-5" />
               </Link>
            </div>
         </div>
      </section>

    </div>
  );
}
