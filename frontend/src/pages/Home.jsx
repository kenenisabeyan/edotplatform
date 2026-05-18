import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useThemeMode from '../hooks/useThemeMode';
import { getRecentPublicUsers } from '../utils/api';
import { motion } from 'framer-motion';
import { 
  ArrowRight, BookOpen, BrainCircuit, Rocket, LineChart, Laptop, Target, UserCheck, Calculator, Globe, 
  PlayCircle, MessageSquare, Code, Cpu, Shield, Users, Gift, Star, ChevronDown, CheckCircle, Heart, Handshake, 
  LayoutDashboard, Languages, Briefcase, Zap, Newspaper, Quote, GitBranch, AlertTriangle, MonitorPlay, GraduationCap,
  Award, Key, TrendingUp, Sparkles, Trophy, Zap as ZapIcon
} from 'lucide-react';
const qanoVideo = 'https://res.cloudinary.com/dacck6udl/video/upload/v1778415967/edot/frontend/videos/yv9rdzpffbitbyumbn41.mov';

export default function Home() {
  const isDarkMode = useThemeMode();
  const [totalUsers, setTotalUsers] = useState('10k+');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.controls = true;
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

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
    <div className="min-h-screen w-full">
      
      {/* ===== PREMIUM HERO SECTION ===== */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#E8FCFC]">
          {/* Subtle dotted pattern on the left */}
          <div className="absolute left-0 top-0 bottom-0 w-[60%] bg-[radial-gradient(circle,#06B6D4_1.5px,transparent_1px)] bg-[size:28px_28px] opacity-[0.08] pointer-events-none [mask-image:linear-gradient(to_right,black_10%,transparent_90%)]"></div>
          
          {/* SVG Waves Background */}
          <svg className="absolute inset-0 w-full h-full object-cover" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#6EE7B7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Back Wave (Lighter, larger sweep) */}
            <path d="M 450 0 C 650 350, 250 650, -100 900 L 1440 900 L 1440 0 Z" fill="url(#waveGrad2)" />

            {/* Middle Wave (Main crisp S-curve) */}
            <path d="M 550 0 C 700 400, 350 700, 50 900 L 1440 900 L 1440 0 Z" fill="url(#waveGrad1)" />

            {/* Bottom Right Wave (Darker anchor) */}
            <path d="M 800 900 C 1000 650, 1200 500, 1440 400 L 1440 900 Z" fill="url(#waveGrad3)" />
          </svg>
        </div>

        <section className="relative z-10 pt-24 pb-20 lg:pt-28 lg:pb-32 px-6 md:px-8 lg:px-12">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">

              {/* LEFT COLUMN */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#22D3EE] text-white shadow-sm mb-8"
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-[13px] font-bold tracking-wide">Building a brighter future through education</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.98] tracking-tight text-[#111827]"
                >
                  Every Learner
                  <br />
                  Deserves a Chance
                  <br />
                  to <span className="text-[#FF7A00]">Succeed.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="max-w-xl text-[17px] leading-relaxed text-slate-600 font-medium mt-6"
                >
                  EDOT brings learners, instructors, parents, and sponsors together in a premium learning ecosystem designed for real growth, community support, and measurable impact.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="mt-10 flex flex-col sm:flex-row gap-4"
                >
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/register?role=student"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00D4FF] px-8 py-3.5 text-base font-bold text-white shadow-lg hover:bg-[#EA580C] transition-all duration-300"
                    >
                      Start Learning
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/register?role=sponsor"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00D4FF] bg-white px-8 py-3.5 text-base font-bold text-[#00D4FF] shadow-sm hover:bg-orange-50 transition-all duration-300"
                    >
                      Sponsor a Student
                      <Heart className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex -space-x-3">
                    <img src="https://i.pravatar.cc/100?img=11" alt="Learner" className="w-11 h-11 rounded-full border-2 border-white object-cover" />
                    <img src="https://i.pravatar.cc/100?img=32" alt="Learner" className="w-11 h-11 rounded-full border-2 border-white object-cover" />
                    <img src="https://i.pravatar.cc/100?img=44" alt="Learner" className="w-11 h-11 rounded-full border-2 border-white object-cover" />
                    <img src="https://i.pravatar.cc/100?img=12" alt="Learner" className="w-11 h-11 rounded-full border-2 border-white object-cover" />
                  </div>
                  <div className="text-[15px]">
                    <p className="font-semibold text-slate-800">Join <span className="text-[#00D4FF]">10,000+</span> learners</p>
                    <p className="text-slate-500 font-medium">growing every day</p>
                  </div>
                </motion.div>


              </motion.div>

              {/* RIGHT COLUMN */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.9 }}
                className="relative"
              >
                <div className="relative mx-auto w-full max-w-[560px] lg:max-w-[620px]">
                  <motion.div
                    whileHover={!isVideoPlaying ? { scale: 1.02, y: -8 } : {}}
                    transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                    className="relative overflow-hidden rounded-[32px] shadow-[0_0_40px_rgba(34,211,238,0.6)] bg-black group"
                  >
                    <video
                      ref={videoRef}
                      src={qanoVideo}
                      autoPlay={!isVideoPlaying}
                      muted={!isVideoPlaying}
                      loop={!isVideoPlaying}
                      playsInline
                      disablePictureInPicture
                      disableRemotePlayback
                      controlsList="nodownload noplaybackrate"
                      className={`w-full h-[540px] object-cover rounded-[24px] transition-all duration-500`}
                      onEnded={() => {
                        setIsVideoPlaying(false);
                        if (videoRef.current) {
                          videoRef.current.controls = false;
                          videoRef.current.muted = true;
                          videoRef.current.play();
                        }
                      }}
                    />

                    {!isVideoPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-transparent group-hover:bg-black/10 transition-all duration-500">
                        <div className="relative flex items-center justify-center">
                          {/* Water ripple movements */}
                          <div className="absolute inset-[-12px] rounded-[32px] bg-white/20 animate-ping" style={{ animationDuration: '3s' }}></div>
                          <div className="absolute inset-[-24px] rounded-[40px] bg-white/10 animate-pulse" style={{ animationDuration: '2s' }}></div>

                          <motion.button
                            onClick={handlePlayVideo}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative flex h-[64px] w-[88px] items-center justify-center rounded-[20px] bg-[#1a1a1a]/90 backdrop-blur-md shadow-xl transition-all duration-300 pl-1 group-hover:bg-[#1a1a1a] group-hover:shadow-2xl"
                            aria-label="Play introduction video"
                          >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-white">
                              <path d="M7 4v16l13-8L7 4z" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </motion.div>

                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== FEATURE CARD STRIP (Now inside Hero Background) ===== */}
        <section className="relative z-10 px-6 md:px-8 lg:px-12 mt-12 pb-24">
          <div className="max-w-[1300px] mx-auto">
            <div className="rounded-[32px] bg-white shadow-xl px-8 py-8 sm:px-12">
              <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 xl:gap-2">
                {[
                  {
                    title: 'Students',
                    desc: 'Learn new skills, track progress and achieve goals.',
                    icon: GraduationCap,
                    cardBg: 'bg-blue-50/70',
                    iconColor: 'text-blue-600',
                  },
                  {
                    title: 'Instructors',
                    desc: 'Create courses, teach and inspire learners.',
                    icon: UserCheck,
                    cardBg: 'bg-green-50/70',
                    iconColor: 'text-green-600',
                  },
                  {
                    title: 'Parents',
                    desc: 'Monitor progress, attendance and achievements.',
                    icon: Users,
                    cardBg: 'bg-purple-50/70',
                    iconColor: 'text-purple-600',
                  },
                  {
                    title: 'Sponsors',
                    desc: 'Support education, empower learners and change lives.',
                    icon: Heart,
                    cardBg: 'bg-orange-50/70',
                    iconColor: 'text-[#00D4FF]',
                  },
                  {
                    title: 'Admins',
                    desc: 'Manage the platform, ensure quality and create opportunities.',
                    icon: Shield,
                    cardBg: 'bg-red-50/70',
                    iconColor: 'text-red-500',
                  }
                ].map((item, idx, arr) => (
                  <React.Fragment key={idx}>
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      whileHover={{ y: -4 }}
                      className={`flex flex-col items-start p-5 xl:p-6 rounded-2xl border border-white/60 ${item.cardBg} flex-1 min-w-[200px] shadow-sm hover:shadow-md transition-all`}
                    >
                      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ${item.iconColor}`}>
                        <item.icon className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-[17px] font-bold text-[#111827] mb-2">{item.title}</h3>
                      <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                    </motion.div>
                    {idx < arr.length - 1 && (
                      <div className="hidden lg:flex items-center justify-center px-1 xl:px-2 text-slate-400 shrink-0">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ABOUT SECTION */}
      <section id="about" className={`relative w-full pt-32 pb-32 px-6 overflow-hidden flex flex-col items-center text-center border-b ${isDarkMode ? 'border-white/10 bg-gradient-to-b from-[#0B1120] to-[#111827]' : 'border-slate-200 bg-gradient-to-b from-[#FAFAFA] to-white'}`}>
         {/* Premium CSS Background */}
         <div className={`absolute inset-0 z-0 ${isDarkMode ? 'bg-gradient-to-b from-[#0B1120]/50 to-[#111827]/50' : 'bg-gradient-to-b from-[#FAFAFA] to-white'}`}>
            <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]`}></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00D4FF]/10 dark:bg-[#00D4FF]/10 blur-[120px] rounded-full pointer-events-none"></div>
         </div>
         <div className="relative z-10 max-w-[1000px] mx-auto mt-8">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
            >
               <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-[1.1] tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Building a Better Future Through <span className={`${isDarkMode ? 'text-[#00D4FF]' : 'text-blue-600'}`}>Education</span>
               </h1>
               <p className={`text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                  EDOT is more than a learning platform — it is a structured system designed to make education accessible, guided, and impactful for everyone.
               </p>
            </motion.div>
         </div>
      </section>

      {/* 2. THE REALITY OF EDUCATION TODAY */}
      <section className={`relative pt-48 pb-32 px-6 border-t ${isDarkMode ? 'bg-gradient-to-b from-[#0B1120] to-[#0B1120] border-white/5' : 'bg-gradient-to-b from-slate-50 to-white border-slate-200'}`}>
         {/* Green accent line divider */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-30"></div>
         <div className="max-w-[1200px] mx-auto">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="flex flex-col lg:flex-row gap-16 items-center"
            >
               <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className={`flex-1 w-full relative rounded-[40px] flex items-center justify-center p-8 h-[500px] border transition-all duration-500 hover:-translate-y-2 ${isDarkMode ? 'bg-[#111827] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'}`}
               >
                  <img src="/images/problem_3d.png" alt="Educational challenges" className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-transform duration-700" />
                  <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-[85%] max-w-sm backdrop-blur-xl rounded-2xl p-5 shadow-2xl border text-center ${isDarkMode ? 'bg-[#0B1120]/80 border-white/10' : 'bg-white/90 border-slate-100'}`}>
                     <p className={`font-bold text-[15px] leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Millions of bright minds lack the structured resources needed to succeed.</p>
                  </div>
               </motion.div>

               <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex-1 text-left"
               >
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
                        <motion.div
                           key={idx}
                           initial={{ opacity: 0, y: 20 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.1 + 0.6, duration: 0.6 }}
                           viewport={{ once: true }}
                           className="flex items-center gap-4"
                        >
                           <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-5 h-5" />
                           </div>
                           <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item}</span>
                        </motion.div>
                     ))}
                  </div>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* 3. A BETTER WAY TO LEARN */}
      <section id="solution" className={`py-32 px-6 ${isDarkMode ? 'bg-gradient-to-b from-[#0B1120] via-[#10B981]/5 to-[#0B1120]' : 'bg-gradient-to-b from-white via-[#10B981]/5 to-white'}`}>
         <div className="max-w-[1200px] mx-auto">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="flex flex-col lg:flex-row gap-16 items-center"
            >
               <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex-1 text-left"
               >
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
                        <motion.div
                           key={idx}
                           initial={{ opacity: 0, y: 20 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.1 + 0.4, duration: 0.6 }}
                           viewport={{ once: true }}
                           className={`flex items-center gap-4 p-4 rounded-2xl border ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-slate-50 border-slate-200'}`}
                        >
                           <div className="w-10 h-10 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] flex items-center justify-center shrink-0">
                              <item.icon className="w-5 h-5" />
                           </div>
                           <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                        </motion.div>
                     ))}
                  </div>
               </motion.div>

               <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className={`flex-1 w-full relative rounded-[40px] flex items-center justify-center p-8 h-[500px] border transition-all duration-500 hover:-translate-y-2 ${isDarkMode ? 'bg-[#111827] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'}`}
               >
                  <img src="/images/solution_3d.png" alt="Structured Learning Solution" className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-transform duration-700" />
                  <div className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-[85%] max-w-sm backdrop-blur-xl rounded-2xl p-5 shadow-2xl border text-center ${isDarkMode ? 'bg-[#0B1120]/80 border-white/10' : 'bg-white/90 border-slate-100'}`}>
                     <p className={`font-bold text-[15px] leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>A clear, structured path from foundational concepts to mastery.</p>
                  </div>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* 4. EXPLORE LEARNING CATEGORIES */}
      <section id="courses" className={`relative py-32 px-6 border-t ${isDarkMode ? 'bg-gradient-to-b from-[#0B1120] to-[#111827] border-white/5' : 'bg-gradient-to-b from-slate-50 to-[#F0FDF4] border-slate-200'}`}>
         {/* Green accent line divider */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-40"></div>
         <div className="max-w-[1200px] mx-auto text-center">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
            >
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Knowledge That <span className="text-[#00D4FF]">Grows With You</span>
               </h2>
               <p className={`text-xl mb-16 font-medium max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  From foundational education to professional skills, EDOT supports every stage of learning.
               </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {[
                 { title: "Mathematics & Natural Sciences", icon: Calculator, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
                 { title: "Social Sciences", icon: Globe, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
                 { title: "Languages", icon: Languages, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
                 { title: "Technology & Development", icon: Laptop, color: "text-[#00D4FF]", bg: "bg-[#001030] dark:bg-[#0B1120]" },
                 { title: "Business & Entrepreneurship", icon: Briefcase, color: "text-[#00D4FF]", bg: "bg-orange-100 dark:bg-orange-900/30" },
                 { title: "Personal Development", icon: Target, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/30" }
               ].map((cat, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1, duration: 0.6 }}
                   viewport={{ once: true }}
                   whileHover={{ y: -8 }}
                   className={`flex items-center gap-6 p-6 rounded-[20px] shadow-sm border hover:-translate-y-2 transition-all duration-300 cursor-pointer ${isDarkMode ? 'bg-[#111827] border-white/5 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg'}`}
                 >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${cat.bg}`}>
                       <cat.icon className={`w-8 h-8 ${cat.color}`} />
                    </div>
                    <h3 className={`text-xl font-bold text-left leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cat.title}</h3>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. BUILT FOR EVERYONE IN EDUCATION */}
      <section id="audience" className={`py-32 relative z-20 overflow-hidden border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto px-6">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="text-center mb-20"
            >
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  One Platform — <span className="text-[#00D4FF]">Every Role Connected</span>
               </h2>
            </motion.div>

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
                  <motion.div
                     key={idx}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1, duration: 0.6 }}
                     viewport={{ once: true }}
                     whileHover={{ y: -12 }}
                     className={`relative flex flex-col items-center text-center p-10 rounded-[32px] overflow-hidden group border transition-all duration-500 hover:-translate-y-3 ${isDarkMode ? 'bg-[#111827] border-white/10 hover:border-[#00D4FF]/50' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-[#00D4FF]/50 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)]'}`}
                  >
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <motion.div
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white border border-slate-100'}`}
                     >
                        <item.icon className={`w-10 h-10 ${isDarkMode ? 'text-[#00D4FF]' : 'text-[#0940B5]'}`} />
                     </motion.div>
                     <h3 className={`text-2xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                     <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.description}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. SUPPORT A LEARNER. CHANGE A LIFE. */}
      <section id="impact" className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-[#FFF8F0] border-orange-100'}`}>
         <div className="max-w-[1200px] mx-auto">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="flex flex-col lg:flex-row items-center gap-16"
            >
               <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="flex-1 text-center lg:text-left"
               >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm mb-6 uppercase tracking-wider">
                     <Handshake className="w-4 h-4" /> Sponsorship
                  </div>
                  <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                     Education Powered by <span className="text-[#00D4FF]">Opportunity</span>
                  </h2>
                  <p className={`text-xl leading-relaxed mb-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                     EDOT connects learners with sponsors who want to make a difference. Support is not just financial — it's a pathway to real change.
                  </p>

                  <div className="flex flex-col gap-6 mb-12">
                     {[
                       "Fund education for students who lack access",
                       "Track learning progress and outcomes",
                       "Create long-term opportunities"
                     ].map((point, idx) => (
                        <motion.div
                           key={idx}
                           initial={{ opacity: 0, y: 20 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.1 + 0.4, duration: 0.6 }}
                           viewport={{ once: true }}
                           className={`flex items-center gap-5 p-5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#111827] border-white/5 hover:border-[#00D4FF]/30' : 'bg-white border-orange-100 hover:border-orange-200 shadow-sm'}`}
                        >
                           <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                              <Heart className="w-6 h-6 text-[#00D4FF]" />
                           </div>
                           <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{point}</span>
                        </motion.div>
                     ))}
                  </div>

                  <motion.button
                     whileHover={{ scale: 1.05, y: -2 }}
                     whileTap={{ scale: 0.98 }}
                     className="w-full sm:w-auto bg-[#00D4FF] text-white font-black px-12 py-5 rounded-full hover:bg-[#e66a00] transition-all text-xl shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:-translate-y-1 duration-300"
                  >
                     Become a Sponsor
                  </motion.button>
               </motion.div>

               <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex-1 w-full relative hidden lg:flex justify-center"
               >
                  <div className={`relative w-full max-w-[500px] h-[550px] rounded-[40px] overflow-hidden shadow-2xl border-8 ${isDarkMode ? 'border-[#111827]' : 'border-white'}`}>
                     <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80" alt="Mentor helping student" className="w-full h-full object-cover" />
                     {/* Floating badge */}
                     <div className="absolute bottom-8 right-8 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#00D4FF]/20 rounded-full flex items-center justify-center shrink-0">
                           <Gift className="w-6 h-6 text-[#00D4FF]" />
                        </div>
                        <div>
                           <div className="font-black text-xl text-slate-900 dark:text-white">Transform</div>
                           <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Communities</div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* 7. BUILT FOR REAL LEARNING */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto text-center">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
            >
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  More Than Courses — <span className="text-[#00D4FF]">A Complete Learning System</span>
               </h2>
               <p className={`text-xl max-w-3xl mx-auto leading-relaxed mb-20 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  EDOT is designed as a full learning ecosystem, not just a content platform.
               </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { title: "Role-based dashboards for each user", icon: LayoutDashboard },
                 { title: "Structured learning from primary to advanced levels", icon: GitBranch },
                 { title: "Real-time progress tracking", icon: LineChart },
                 { title: "Accessible across devices", icon: Laptop },
                 { title: "Integrated sponsorship system", icon: Handshake },
                 { title: "Verified certificates upon completion", icon: Shield }
               ].map((feature, idx) => (
                  <motion.div
                     key={idx}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1, duration: 0.6 }}
                     viewport={{ once: true }}
                     whileHover={{ y: -8 }}
                     className={`flex flex-col items-center p-10 rounded-[32px] border transition-all hover:-translate-y-2 ${isDarkMode ? 'bg-[#111827] border-white/5 hover:border-[#00D4FF]/30' : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5'}`}
                  >
                     <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-blue-500/20 text-[#00D4FF] flex items-center justify-center mb-6 shadow-sm">
                        <feature.icon className="w-8 h-8" />
                     </div>
                     <h3 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 8. REAL IMPACT, MEASURABLE GROWTH */}
      <section className={`py-32 px-6 relative overflow-hidden bg-[#0B1120]`}>
         {/* Premium Abstract Background */}
         <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#00D4FF]/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#00D4FF]/10 blur-[100px] rounded-full pointer-events-none"></div>
         </div>

         <div className="max-w-[1200px] mx-auto text-center relative z-10">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
            >
               <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">Tracking What Truly Matters</h2>
               <p className="text-xl max-w-2xl mx-auto leading-relaxed mb-20 text-slate-300">
                  EDOT focuses on measurable results — not just participation.
               </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
               {[
                 { num: "100+", label: "Active Learners & Instructors" },
                 { num: "95%", label: "Course Completion Rates" },
                 { num: "High", label: "Engagement & Consistency" },
                 { num: "Growing", label: "Sponsorship Support" }
               ].map((stat, idx) => (
                  <motion.div
                     key={idx}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1, duration: 0.6 }}
                     viewport={{ once: true }}
                     className="relative group"
                  >
                     <div className="absolute inset-0 bg-gradient-to-b from-[#00D4FF]/0 to-[#00D4FF]/20 rounded-[32px] transform scale-90 group-hover:scale-100 transition-transform duration-500"></div>
                     <div className="relative p-6">
                        <div className="text-5xl md:text-6xl font-black text-[#00D4FF] mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">{stat.num}</div>
                        <div className="text-lg font-bold leading-snug text-slate-200">{stat.label}</div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 9. FROM IDEA TO IMPACT */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[900px] mx-auto text-center">
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-[#00D4FF] text-white rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-blue-500/30 transform rotate-3"
            >
               <Zap className="w-10 h-10" />
            </motion.div>
            <motion.h2
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2, duration: 0.8 }}
               viewport={{ once: true }}
               className={`text-4xl md:text-5xl font-black mb-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            >
               Built Through Innovation and Collaboration
            </motion.h2>
            <motion.p
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.8 }}
               viewport={{ once: true }}
               className={`text-xl leading-relaxed mb-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
            >
               EDOT was developed and refined through innovation and capacity-building programs supported by the <strong className={`${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ministry of Innovation and Technology Ethiopia</strong> and partner institutions.
            </motion.p>
            <motion.p
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4, duration: 0.8 }}
               viewport={{ once: true }}
               className={`text-xl leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
               It reflects a commitment to transforming ideas into real solutions that improve education and create opportunities.
            </motion.p>
         </div>
      </section>

      {/* 10. REAL VOICES, REAL CHANGE (TESTIMONIALS) */}
      <section className={`py-32 px-6 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="text-center mb-20"
            >
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  What People Are Saying
               </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { role: "Learner", icon: GraduationCap, quote: "EDOT gave me access to learning I couldn't find before. Now I understand and apply what I learn." },
                 { role: "Parent", icon: Users, quote: "I can clearly see my child's progress and growth — not just results, but real understanding." },
                 { role: "Instructor", icon: BookOpen, quote: "This platform allows me to truly guide learners, not just upload content." },
                 { role: "Sponsor", icon: Heart, quote: "I can see exactly who I'm helping and how they are improving." }
               ].map((test, idx) => (
                  <motion.div
                     key={idx}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1, duration: 0.6 }}
                     viewport={{ once: true }}
                     whileHover={{ y: -8 }}
                     className={`p-10 rounded-[32px] shadow-sm border relative overflow-hidden group ${isDarkMode ? 'bg-[#111827] border-white/5 hover:border-[#00D4FF]/30' : 'bg-slate-50 border-slate-200 hover:border-[#00D4FF]/30 hover:shadow-xl'}`}
                  >
                     <Quote className="absolute top-8 right-8 w-16 h-16 text-[#00D4FF] opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
                     <p className={`text-2xl font-medium italic leading-relaxed mb-10 relative z-10 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>"{test.quote}"</p>
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#e66a00] flex items-center justify-center text-white shadow-md">
                           <test.icon className="w-6 h-6" />
                        </div>
                        <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{test.role}</span>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 11. FINAL CALL TO ACTION */}
      <section className={`py-32 px-6 relative z-20 border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'}`}>
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 0.55, scale: 1 }}
               transition={{ duration: 1.2, ease: 'easeOut' }}
               className="absolute -left-24 top-8 w-72 h-72 rounded-full bg-[#00D4FF]/20 blur-3xl"
            />
            <motion.div
               initial={{ opacity: 0, x: 20, scale: 0.9 }}
               animate={{ opacity: 0.45, x: 0, scale: 1 }}
               transition={{ duration: 1.4, ease: 'easeOut', delay: 0.1 }}
               className="absolute right-0 top-20 w-80 h-80 rounded-full bg-[#00D4FF]/20 blur-3xl"
            />
            <motion.div
               initial={{ opacity: 0, y: 20, scale: 0.95 }}
               animate={{ opacity: 0.35, y: 0, scale: 1 }}
               transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
               className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#A855F7]/10 blur-[140px]"
            />
         </div>
         <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-[1000px] mx-auto text-center relative"
         >
            <motion.h2
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1, duration: 0.8 }}
               viewport={{ once: true }}
               className={`text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            >
               Be Part of the <span className="text-[#00D4FF]">Future of Education</span>
            </motion.h2>

            <motion.p
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2, duration: 0.8 }}
               viewport={{ once: true }}
               className={`text-2xl mb-16 max-w-3xl mx-auto font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
            >
               Whether you want to learn, teach, guide, or support — EDOT gives you the tools to make a real difference.
            </motion.p>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.8 }}
               viewport={{ once: true }}
               className="flex flex-col sm:flex-row justify-center items-center gap-6"
            >
               <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/register?role=student" className="w-full sm:w-auto bg-[#00D4FF] text-[#ffffff] px-12 py-5 rounded-full font-black text-xl hover:bg-[#e66a00] hover:-translate-y-1 transition-all duration-300 shadow-[0_15px_30px_rgba(249,115,22,0.3)]">
                    Start Learning
                  </Link>
               </motion.div>
               <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/register?role=instructor" className={`w-full sm:w-auto px-12 py-5 rounded-full font-black text-xl transition-all duration-300 border-2 hover:-translate-y-1 ${isDarkMode ? 'bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white' : 'bg-transparent text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-800'}`}>
                    Teach on EDOT
                  </Link>
               </motion.div>
               <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                  <button className={`w-full sm:w-auto px-12 py-5 rounded-full font-black text-xl transition-all duration-300 border-2 hover:-translate-y-1 ${isDarkMode ? 'bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white' : 'bg-transparent text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-800'}`}>
                    Sponsor a Student
                  </button>
               </motion.div>
            </motion.div>
         </motion.div>
      </section>

      {/* 12. FOOTER - SUPPORTED BY */}
      <footer className={`border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto px-6 py-16">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="text-center mb-12"
            >
               <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                  Supported By Innovation
               </p>
               <h3 className={`text-2xl md:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Built for Impact
               </h3>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1, duration: 0.8 }}
               viewport={{ once: true }}
               className={`text-center p-8 rounded-[24px] border backdrop-blur-sm ${isDarkMode ? 'bg-[#111827]/50 border-white/5' : 'bg-white/80 border-slate-200'}`}
            >
               <p className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  EDOT is proudly developed and supported by the <strong>Ministry of Innovation and Technology Ethiopia</strong> and partner institutions committed to transforming education.
               </p>
               <div className="flex justify-center items-center gap-6 flex-wrap">
                  <motion.div
                     whileHover={{ scale: 1.1 }}
                     className={`px-6 py-3 rounded-full font-semibold text-sm ${isDarkMode ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-100 text-slate-800 border border-slate-300'}`}
                  >
                     🇪🇹 Made in Ethiopia
                  </motion.div>
                  <motion.div
                     whileHover={{ scale: 1.1 }}
                     className={`px-6 py-3 rounded-full font-semibold text-sm ${isDarkMode ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-100 text-slate-800 border border-slate-300'}`}
                  >
                     ✨ Built for Impact
                  </motion.div>
                  <motion.div
                     whileHover={{ scale: 1.1 }}
                     className={`px-6 py-3 rounded-full font-semibold text-sm ${isDarkMode ? 'bg-white/10 text-white border border-white/20' : 'bg-slate-100 text-slate-800 border border-slate-300'}`}
                  >
                     🚀 Future-Ready
                  </motion.div>
               </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               transition={{ delay: 0.3, duration: 0.8 }}
               viewport={{ once: true }}
               className={`mt-12 pt-8 border-t text-center ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}
            >
               <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                  © 2024 EDOT — Education for All. Transforming learning, creating opportunities.
               </p>
            </motion.div>
         </div>
      </footer>

    </div>
  );
}