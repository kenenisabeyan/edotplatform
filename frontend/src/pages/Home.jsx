import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useThemeMode from '../hooks/useThemeMode';
import '../components/HeroSection.css';
import { getRecentPublicUsers } from '../utils/api';
import { motion } from 'framer-motion';
import { 
  ArrowRight, BookOpen, BrainCircuit, Rocket, LineChart, Laptop, Target, UserCheck, Calculator, Globe, 
  PlayCircle, MessageSquare, Code, Cpu, Shield, Users, Gift, Star, ChevronDown, CheckCircle, Heart, Handshake, 
  LayoutDashboard, Languages, Briefcase, Zap, Newspaper, Quote, GitBranch, AlertTriangle, MonitorPlay, GraduationCap,
  Award, Key, TrendingUp, Sparkles, Trophy, Zap as ZapIcon, School
} from 'lucide-react';
const qanoVideo = 'https://res.cloudinary.com/dacck6udl/video/upload/v1778415967/edot/frontend/videos/yv9rdzpffbitbyumbn41.mov';

export default function Home() {
  const isDarkMode = useThemeMode();
  const [totalUsers, setTotalUsers] = useState('10k+');
  const [recentUsers, setRecentUsers] = useState([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeRole, setActiveRole] = useState('learner');
  const videoRef = useRef(null);

  const frameStyle = isDarkMode ? {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: '0px',
    overflow: 'hidden',
    zIndex: 15,
    color: '#ffffff',
  } : {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: '0px',
    overflow: 'hidden',
    zIndex: 15,
    color: '#0F3057',
  };

  const surfaceStyle = isDarkMode ? {
    position: 'relative',
    background: 'transparent',
    padding: '3rem 0rem',
    overflow: 'hidden',
  } : {
    position: 'relative',
    background: 'transparent',
    padding: '3rem 0rem',
    overflow: 'hidden',
    border: 'none',
  };

  const slotStyle = isDarkMode ? {
    position: 'relative',
    background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(3, 7, 18, 0.95))',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    boxShadow: 'inset 0 12px 24px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(255, 255, 255, 0.04)',
    borderRadius: '28px',
    padding: '1.75rem 1.5rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    overflow: 'hidden',
    color: '#ffffff',
  } : {
    position: 'relative',
    background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
    border: '1.5px solid rgba(203, 213, 225, 0.8)',
    boxShadow: 'inset 0 6px 12px rgba(15, 23, 42, 0.03), 0 4px 10px rgba(0, 0, 0, 0.02)',
    borderRadius: '28px',
    padding: '1.75rem 1.5rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    overflow: 'hidden',
    color: '#0F3057',
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.controls = true;
      videoRef.current.loop = false;
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
      }).catch(err => {
        console.error("Play failed:", err);
      });
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getRecentPublicUsers();
      if (data && data.success) {
        if (data.users && data.users.length > 0) {
           setRecentUsers(data.users);
        }
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
      
      {/* ===== REDESIGNED PREMIUM HERO CONSOLE WORKSPACE ===== */}
      <div className={`relative w-full overflow-hidden transition-colors duration-500 pb-16 ${
        isDarkMode ? 'bg-[#0B1120] text-white' : 'bg-slate-50 text-slate-900'
      }`}>

        {/* Ambient Wall Neon Glow Strips */}
        <div className="ambient-neon-left"></div>
        <div className="ambient-neon-right"></div>

        {/* Dynamic Geometric Zigzag SVG Background across full hero section */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <svg className="absolute w-full h-full" viewBox="0 0 1440 850" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M-100 900 L320 680 L200 480 L800 280 L680 160 L1500 -120 L1600 -120 L1600 1000 Z" fill="url(#cyanGeometricGrad)" opacity={isDarkMode ? "0.22" : "0.14"}/>
            <path d="M-200 1000 L270 760 L140 560 L740 360 L620 240 L1420 -60 L1500 -60 L1500 1100 Z" fill="url(#orangeGeometricGrad)" opacity={isDarkMode ? "0.18" : "0.12"}/>
            
            <defs>
              <linearGradient id="cyanGeometricGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#19C2E8" />
                <stop offset="60%" stopColor="#00D4FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="orangeGeometricGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6A00" />
                <stop offset="60%" stopColor="#FFB700" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFB700" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Ambient background grid layer across full hero section */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

        <div className="curved-monitor-wrapper max-w-[1320px] mx-auto pt-24 pb-8 px-4 md:px-8">
          
          {/* Simulated Curved Monitor Frame */}
          <div className="curved-monitor">

            {/* Simulated screen hero section content grid */}
            <section className="relative z-10 pt-10 pb-10 lg:pt-14 lg:pb-14 px-6 md:px-10 lg:px-14">
              <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
                
                {/* Left side: Tag, title, micro-cards grid */}
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col items-start text-left"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#19C2E8]/10 border border-[#19C2E8]/20 text-[#19C2E8] mb-6 shadow-sm select-none"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-black tracking-wider">Building a brighter future through education</span>
                  </motion.div>

                  <h1 className="text-3xl md:text-4xl lg:text-[45px] font-black leading-[1.12] tracking-tight text-[#0F3057] dark:text-white mb-6">
                    Every Learner Deserves <br />
                    <span className="text-[#FF6A00]">a Chance to Succeed</span>
                  </h1>

                  <p className={`text-base md:text-lg font-semibold leading-relaxed mb-8 max-w-xl ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    EDOT is a premium digital learning ecosystem dedicated to delivering education for all. By offering personalized learning pathways, highly curated courses, and interactive real-world projects, we connect students with top-tier education and a global network of sponsors.
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <Link 
                      to="/courses" 
                      className="bg-[#19C2E8] hover:bg-[#00c5eb] text-white px-8 py-3.5 rounded-full font-black text-[13px] tracking-wider uppercase transition-all shadow-lg hover:shadow-cyan-400/20 transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      Explore Courses <ArrowRight className="w-4.5 h-4.5" />
                    </Link>
                    <Link 
                      to="/about" 
                      className={`px-8 py-3.5 rounded-full font-black text-[13px] tracking-wider uppercase transition-all border ${
                        isDarkMode 
                          ? 'border-white/10 hover:bg-white/5 text-white' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Learn More
                    </Link>
                  </div>
                </motion.div>

                {/* Right side: Premium Video Player in monitor bezel overlay */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.9 }}
                  className="relative flex flex-col justify-center items-center w-full"
                >
                  <div className="relative w-full max-w-[500px]">
                    
                    {/* Pulsing visual glow under player */}
                    <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-r from-[#19C2E8] to-[#FF6A00] opacity-15 blur-2xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
                    
                    {/* Realistic video monitor structure */}
                    <motion.div
                      whileHover={!isVideoPlaying ? { scale: 1.015, y: -4 } : {}}
                      className={`relative overflow-hidden rounded-[24px] aspect-[16/10] flex flex-col justify-between transition-all duration-500 shadow-2xl video-monitor-gold-border ${isDarkMode ? 'bg-[#070b13]' : 'bg-[#f1f5f9]'}`}
                    >
                      <video
                        ref={videoRef}
                        src={qanoVideo}
                        autoPlay
                        muted={!isVideoPlaying}
                        loop={!isVideoPlaying}
                        playsInline
                        className="w-full h-full object-cover transition-all duration-500"
                        onPlay={() => {
                          if (videoRef.current && videoRef.current.muted === false) {
                            setIsVideoPlaying(true);
                          }
                        }}
                        onPause={() => {
                          if (videoRef.current && videoRef.current.muted === false) {
                            setIsVideoPlaying(false);
                            if (videoRef.current) {
                              videoRef.current.controls = false;
                              videoRef.current.muted = true;
                              videoRef.current.loop = true;
                              videoRef.current.play().catch(() => {});
                            }
                          }
                        }}
                        onEnded={() => {
                          setIsVideoPlaying(false);
                          if (videoRef.current) {
                            videoRef.current.controls = false;
                            videoRef.current.muted = true;
                            videoRef.current.loop = true;
                            videoRef.current.play().catch(() => {});
                          }
                        }}
                      />

                      {/* Cyan custom neon play button */}
                      {!isVideoPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all duration-500">
                          <motion.button
                            onClick={handlePlayVideo}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#19C2E8] shadow-[0_0_20px_rgba(25,194,232,0.5)] transition-all duration-300 cursor-pointer pl-1"
                            aria-label="Play introduction video"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-slate-900">
                              <path d="M7 4v16l13-8L7 4z" />
                            </svg>
                          </motion.button>
                        </div>
                      )}
                    </motion.div>

                    {/* Coordinates bar underneath video player */}
                    <div className="mt-4 flex justify-between items-center text-[9px] font-black uppercase tracking-widest px-3 select-none text-slate-650">
                      <Link to="/register?role=sponsor" className="hover:text-[#FF6A00] transition-colors">Sponsor a Student (Full Details)</Link>
                      <div className="flex items-center gap-1">
                        <span>Scroll for More</span>
                        <ChevronDown className="w-3 h-3 text-[#19C2E8] animate-bounce" />
                      </div>
                      <Link to="/contact" className="hover:text-[#19C2E8] transition-colors font-bold">FAQ</Link>
                      <span>© 2024 EDOT Platform</span>
                    </div>

                  </div>
                </motion.div>

              </div>
            </section>

          </div>

          {/* Curved Monitor Stand Base Removed */}

        </div>

        {/* ===== PREMIUM REDESIGNED FUTURISTIC DECK INTERACTIVE CONSOLE ===== */}
        <section className="relative z-20 px-6 md:px-8 lg:px-16 pb-12">
          <div className="max-w-[1300px] mx-auto">
            <div 
              className="control-deck-frame"
              style={frameStyle}
            >
              
              {/* Cyan/Orange Neon LED strip ambient lights split glow */}
              <div className="led-strip-glow led-cyan"></div>
              <div className="led-strip-glow led-orange"></div>

              <div 
                className="control-deck-surface"
                style={surfaceStyle}
              >
                
                {/* Keyboard keycaps dots decorations */}
                <div className="absolute top-3 right-6 flex gap-1.5 opacity-60 pointer-events-none select-none">
                  <span className="w-3.5 h-3.5 rounded bg-[#FF6A00] block shadow-sm border border-black/10"></span>
                  <span className="w-3.5 h-3.5 rounded bg-[#19C2E8] block shadow-sm border border-black/10"></span>
                  <span className="w-3.5 h-3.5 rounded bg-[#FF6A00] block shadow-sm border border-black/10"></span>
                  <span className="w-3.5 h-3.5 rounded bg-[#19C2E8] block shadow-sm border border-black/10"></span>
                </div>

                {/* 4 Recess slots console grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                  
                  {/* Modular Slot 1: Diverse Education */}
                  <div className="flex flex-col">
                    <motion.div 
                      whileHover={{ y: -6 }}
                      className="console-slot console-slot-cyan"
                      style={slotStyle}
                    >
                      {/* Floating glowing Glass Pedestal and holographic Classical greek temple icon */}
                      <div className="relative h-24 flex items-center justify-center">
                        <div className="absolute hologram-glow-cyan blur-md opacity-45 w-16 h-16 rounded-full"></div>
                        <div className="hologram-float-icon-cyan relative z-10">
                          {/* Greek Temple Column Glowing SVG */}
                          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-[#19C2E8] filter drop-shadow-[0_0_8px_#19C2E8]">
                            <path d="M6 22 L32 6 L58 22 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="rgba(25,194,232,0.1)"/>
                            <rect x="8" y="22" width="48" height="4" rx="1" fill="currentColor"/>
                            <rect x="13" y="28" width="5" height="24" rx="1" stroke="currentColor" strokeWidth="2" fill="rgba(25,194,232,0.15)"/>
                            <rect x="24" y="28" width="5" height="24" rx="1" stroke="currentColor" strokeWidth="2" fill="rgba(25,194,232,0.15)"/>
                            <rect x="35" y="28" width="5" height="24" rx="1" stroke="currentColor" strokeWidth="2" fill="rgba(25,194,232,0.15)"/>
                            <rect x="46" y="28" width="5" height="24" rx="1" stroke="currentColor" strokeWidth="2" fill="rgba(25,194,232,0.15)"/>
                            <rect x="4" y="52" width="56" height="6" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="hologram-pedestal-cyan mb-4"></div>

                      <div className="text-left mt-2">
                        <h4 className={`text-[15px] font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#0F3057]'}`}>Diverse Education</h4>
                        <p className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Find courses that match your interests.</p>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-[#19C2E8] uppercase tracking-wider">
                        <span>Interactive Unit</span>
                        <span className="h-2 w-2 rounded-full bg-[#19C2E8] animate-ping"></span>
                      </div>
                    </motion.div>

                    {/* Rotary dial knob */}
                    <div className="rotary-knob-container knob-cyan">
                      <div className="rotary-knob-bezel">
                        <div className="rotary-knob-dial"></div>
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-500 mt-1.5 tracking-widest">FREQ SELECT</span>
                    </div>
                  </div>

                  {/* Modular Slot 2: Global Community */}
                  <div className="flex flex-col">
                    <motion.div 
                      whileHover={{ y: -6 }}
                      className="console-slot console-slot-cyan"
                      style={slotStyle}
                    >
                      {/* Floating glowing Glass Pedestal and holographic Digital wireframe earth globe */}
                      <div className="relative h-24 flex items-center justify-center">
                        <div className="absolute hologram-glow-cyan blur-md opacity-45 w-16 h-16 rounded-full"></div>
                        <div className="hologram-float-icon-cyan relative z-10" style={{ animationDelay: '0.5s' }}>
                          {/* Earth Globe Wireframe with orbiting neon ring SVG */}
                          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-[#19C2E8] filter drop-shadow-[0_0_8px_#19C2E8]">
                            <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" fill="rgba(25,194,232,0.05)"/>
                            <ellipse cx="32" cy="32" rx="18" ry="7" stroke="currentColor" strokeWidth="1.5"/>
                            <ellipse cx="32" cy="32" rx="7" ry="18" stroke="currentColor" strokeWidth="1.5"/>
                            <ellipse cx="32" cy="32" rx="25" ry="4" stroke="currentColor" strokeWidth="2" transform="rotate(-22 32 32)" strokeLinecap="round" fill="none"/>
                            <circle cx="12" cy="22" r="2.5" fill="#19C2E8"/>
                            <circle cx="52" cy="42" r="2.5" fill="#19C2E8"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="hologram-pedestal-cyan mb-4"></div>

                      <div className="text-left mt-2">
                        <h4 className={`text-[15px] font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#0F3057]'}`}>Global Community</h4>
                        <p className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Connect with learners from around the world.</p>
                      </div>

                      {/* Diagnostic green LCD screen */}
                      <div className={`text-[6px] ${isDarkMode ? 'console-slot-lcd' : 'console-slot-lcd-light'}`}>
                        <div className="flex justify-between items-center text-[7px]">
                          <span>SYS.NODE: ACTIVE</span>
                          <span>98.2%</span>
                        </div>
                        <div className={`text-[5.5px] truncate mt-0.5 ${isDarkMode ? 'text-[#10B981]/60' : 'text-[#059669]/60'}`}>&gt; CONNECTING SECURE SENSORS...</div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-[#19C2E8] uppercase tracking-wider">
                        <span>Active Node</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      </div>
                    </motion.div>

                    {/* Rotary dial knob */}
                    <div className="rotary-knob-container knob-cyan">
                      <div className="rotary-knob-bezel">
                        <div className="rotary-knob-dial"></div>
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-500 mt-1.5 tracking-widest">NODE GAIN</span>
                    </div>
                  </div>

                  {/* Modular Slot 3: Certified Courses */}
                  <div className="flex flex-col">
                    <motion.div 
                      whileHover={{ y: -6 }}
                      className="console-slot console-slot-orange"
                      style={slotStyle}
                    >
                      {/* Floating glowing Glass Pedestal and holographic A+ Ribbon medal */}
                      <div className="relative h-24 flex items-center justify-center">
                        <div className="absolute hologram-glow-orange blur-md opacity-45 w-16 h-16 rounded-full"></div>
                        <div className="hologram-float-icon-orange relative z-10" style={{ animationDelay: '1s' }}>
                          {/* Glowing A+ Badge Emblem SVG */}
                          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-[#FF6A00] filter drop-shadow-[0_0_8px_#FF6A00]">
                            <path d="M22 36 L16 58 L28 50 L34 56 L30 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,106,0,0.1)"/>
                            <path d="M42 36 L48 58 L36 50 L30 56 L34 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,106,0,0.1)"/>
                            <circle cx="32" cy="25" r="17" stroke="currentColor" strokeWidth="2.5" fill="rgba(255,106,0,0.15)" />
                            <circle cx="32" cy="25" r="13" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                            <path d="M25 30 L29 18 L33 30 M26 26 L32 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                            <path d="M36 22 L40 22 M38 20 L38 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="hologram-pedestal-orange mb-4"></div>

                      <div className="text-left mt-2">
                        <h4 className={`text-[15px] font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#0F3057]'}`}>Certified Courses</h4>
                        <p className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Earn recognized credentials for your future.</p>
                      </div>

                      {/* Diagnostic green LCD screen */}
                      <div className={`text-[6px] ${isDarkMode ? 'console-slot-lcd' : 'console-slot-lcd-light'}`}>
                        <div className="flex justify-between items-center text-[7px]">
                          <span>CERT.AUTH: APPROVED</span>
                          <span>SEALED</span>
                        </div>
                        <div className={`text-[5.5px] truncate mt-0.5 ${isDarkMode ? 'text-[#10B981]/60' : 'text-[#059669]/60'}`}>&gt; GENERATING SHIELD HASH...</div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider">
                        <span>Credential Core</span>
                        <span className="h-2 w-2 rounded-full bg-[#FF6A00]"></span>
                      </div>
                    </motion.div>

                    {/* Rotary dial knob */}
                    <div className="rotary-knob-container knob-orange">
                      <div className="rotary-knob-bezel">
                        <div className="rotary-knob-dial"></div>
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-500 mt-1.5 tracking-widest">CRED MATRIX</span>
                    </div>
                  </div>

                  {/* Modular Slot 4: Support a Cause */}
                  <div className="flex flex-col">
                    <motion.div 
                      whileHover={{ y: -6 }}
                      className="console-slot console-slot-orange"
                      style={slotStyle}
                    >
                      {/* Floating glowing Glass Pedestal and holographic Hands holding heart */}
                      <div className="relative h-24 flex items-center justify-center">
                        <div className="absolute hologram-glow-orange blur-md opacity-45 w-16 h-16 rounded-full"></div>
                        <div className="hologram-float-icon-orange relative z-10" style={{ animationDelay: '1.5s' }}>
                          {/* Glowing cradling hands cradling pulsing neon heart SVG */}
                          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-[#FF6A00] filter drop-shadow-[0_0_8px_#FF6A00]">
                            <path d="M12 38 C14 44, 20 48, 28 48 C30 48, 32 46, 32 46 C32 46, 34 48, 36 48 C44 48, 50 44, 52 38 C54 34, 52 30, 48 30 C45 30, 43 32, 42 34 L32 42 L22 34 C21 32, 19 30, 16 30 C12 30, 10 34, 12 38 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" fill="rgba(255,106,0,0.1)"/>
                            <path d="M32 30 C32 30, 27 25, 27 21.5 C27 18.5, 29.5 16, 32.5 16 C34 16, 35.5 17, 36 18 C36.5 17, 38 16, 39.5 16 C42.5 16, 45 18.5, 45 21.5 C45 25, 40 30, 40 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="rgba(255,106,0,0.2)"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="hologram-pedestal-orange mb-4"></div>

                      <div className="text-left mt-2">
                        <h4 className={`text-[15px] font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#0F3057]'}`}>Support a Cause</h4>
                        <p className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Help others on their learning path.</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider">
                        <span>Sponsor Hub</span>
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                      </div>
                    </motion.div>

                    {/* Rotary dial knob */}
                    <div className="rotary-knob-container knob-orange">
                      <div className="rotary-knob-bezel">
                        <div className="rotary-knob-dial"></div>
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-500 mt-1.5 tracking-widest">SPONS LEVEL</span>
                    </div>
                  </div>

                </div>


                {/* physical keyboard, dials, mouse, low-poly mountains desk setup */}
                <div className="relative mt-12 pt-10 flex flex-col lg:flex-row items-center justify-between gap-8 z-10">
                  {/* Glowing Brand Gradient Divider Line */}
                  <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#19C2E8]/40 dark:via-[#19C2E8]/20 to-transparent"></div>
                  
                  {/* Accessory dials / wires on the left */}
                  <div className="flex items-center gap-3 select-none shrink-0 z-10">
                    <div className="charcoal-cable-brick">
                      <div className="cable-led-group">
                        <span className="cable-led-green"></span>
                        <span className="cable-led-red animate-pulse"></span>
                      </div>
                      <span className="text-[5px] font-black text-slate-500 uppercase tracking-widest leading-none">SPLIT 1</span>
                    </div>
                    <div className="charcoal-cable-brick">
                      <div className="cable-led-group">
                        <span className="cable-led-green"></span>
                        <span className="cable-led-green"></span>
                      </div>
                      <span className="text-[5px] font-black text-slate-500 uppercase tracking-widest leading-none">SPLIT 2</span>
                    </div>

                    {/* Concentric square silver controller module with glowing blue dial */}
                    <div className="silver-console-module">
                      <div className="silver-dial"></div>
                    </div>
                  </div>

                  {/* Physical central mechanical push-button switch */}
                  <div className="scroll-button-container">
                    <div className="scroll-button-halo"></div>
                    <div className="scroll-button-bezel">
                      <button 
                        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                        className="scroll-button-dial"
                        title="Press to scroll down"
                      >
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">Scroll</span>
                        <span className="text-[8px] font-bold text-[#FF6A00] tracking-widest uppercase mb-1">For</span>
                        <span className="text-[9px] font-black uppercase text-slate-400 leading-none">More</span>
                      </button>
                    </div>
                  </div>

                  {/* mechanical keyboard mockup */}
                  <div className="mechanical-keyboard-grid select-none hidden lg:grid">
                    {/* Row 1 (15 keys) */}
                    <div className="keyboard-keycap keycap-orange">esc</div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>!</span>
                      <span>1</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>@</span>
                      <span>2</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>#</span>
                      <span>3</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>$</span>
                      <span>4</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>%</span>
                      <span>5</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>^</span>
                      <span>6</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>{"&"}</span>
                      <span>7</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>*</span>
                      <span>8</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>(</span>
                      <span>9</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>)</span>
                      <span>0</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>_</span>
                      <span>-</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>+</span>
                      <span>=</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal font-bold" style={{ gridColumn: 'span 2' }}>back</div>

                    {/* Row 2 (15 keys equivalent) */}
                    <div className="keyboard-keycap keycap-charcoal font-bold" style={{ gridColumn: 'span 1.5' }}>tab</div>
                    <div className="keyboard-keycap keycap-cyan">q</div>
                    <div className="keyboard-keycap keycap-cream">w</div>
                    <div className="keyboard-keycap keycap-cream">e</div>
                    <div className="keyboard-keycap keycap-cream">r</div>
                    <div className="keyboard-keycap keycap-cream">t</div>
                    <div className="keyboard-keycap keycap-cream">y</div>
                    <div className="keyboard-keycap keycap-cream">u</div>
                    <div className="keyboard-keycap keycap-cream">i</div>
                    <div className="keyboard-keycap keycap-cream">o</div>
                    <div className="keyboard-keycap keycap-cream">p</div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>{"{"}</span>
                      <span>{"["}</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>{"}"}</span>
                      <span>{"]"}</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none" style={{ gridColumn: 'span 1.5' }}>
                      <span>|</span>
                      <span>\</span>
                    </div>

                    {/* Row 3 (15 keys equivalent) */}
                    <div className="keyboard-keycap keycap-charcoal font-bold" style={{ gridColumn: 'span 1.75' }}>caps</div>
                    <div className="keyboard-keycap keycap-cream">a</div>
                    <div className="keyboard-keycap keycap-cream">s</div>
                    <div className="keyboard-keycap keycap-cream">d</div>
                    <div className="keyboard-keycap keycap-cream">f</div>
                    <div className="keyboard-keycap keycap-cream">g</div>
                    <div className="keyboard-keycap keycap-cream">h</div>
                    <div className="keyboard-keycap keycap-cream">j</div>
                    <div className="keyboard-keycap keycap-cream">k</div>
                    <div className="keyboard-keycap keycap-cream">l</div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>:</span>
                      <span>;</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>"</span>
                      <span>'</span>
                    </div>
                    <div className="keyboard-keycap keycap-cyan font-bold" style={{ gridColumn: 'span 2.25' }}>enter</div>

                    {/* Row 4 (Letter row: Z, X, C, V, B, N, M & Symbols) */}
                    <div className="keyboard-keycap keycap-orange font-bold" style={{ gridColumn: 'span 2.25' }}>shift</div>
                    <div className="keyboard-keycap keycap-cream">z</div>
                    <div className="keyboard-keycap keycap-cream">x</div>
                    <div className="keyboard-keycap keycap-cream">c</div>
                    <div className="keyboard-keycap keycap-cream">v</div>
                    <div className="keyboard-keycap keycap-cream">b</div>
                    <div className="keyboard-keycap keycap-cream">n</div>
                    <div className="keyboard-keycap keycap-cream">m</div>
                    <div className="keyboard-keycap keycap-cream flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>{"<"}</span>
                      <span>,</span>
                    </div>
                    <div className="keyboard-keycap keycap-cream flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>{">"}</span>
                      <span>.</span>
                    </div>
                    <div className="keyboard-keycap keycap-charcoal flex flex-col items-center justify-center text-[5.5px] leading-none">
                      <span>?</span>
                      <span>/</span>
                    </div>
                    <div className="keyboard-keycap keycap-orange font-bold" style={{ gridColumn: 'span 2.75' }}>shift</div>

                    {/* Row 5 (Spacebar and mod keys) */}
                    <div className="keyboard-keycap keycap-orange font-bold" style={{ gridColumn: 'span 2' }}>ctrl</div>
                    <div className="keyboard-keycap keycap-charcoal font-bold" style={{ gridColumn: 'span 1.5' }}>alt</div>
                    <div className="keyboard-keycap keycap-cream font-bold text-[6px]" style={{ gridColumn: 'span 6.5' }}>space</div>
                    <div className="keyboard-keycap keycap-cyan font-bold" style={{ gridColumn: 'span 1.5' }}>alt</div>
                    <div className="keyboard-keycap keycap-charcoal font-bold">fn</div>
                    <div className="keyboard-keycap keycap-orange font-bold" style={{ gridColumn: 'span 2.5' }}>ctrl</div>
                  </div>

                  {/* Trackball Mouse and low-poly mountains on the right */}
                  <div className="flex items-center gap-5 shrink-0 select-none">
                    {/* Ergonomic mouse representation */}
                    <div className={`w-10 h-14 rounded-full border-2 shadow-md relative flex flex-col justify-start pt-2 items-center cursor-pointer transition-all duration-300 ${isDarkMode ? 'bg-[#1e293b] border-slate-700 hover:border-[#19C2E8] shadow-black/50' : 'bg-[#e2e8f0] border-slate-300 hover:border-[#FF6A00] shadow-slate-300/40'}`}>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-slate-300 border-slate-400'}`}>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#19C2E8] shadow-[0_0_6px_#19C2E8]"></div>
                      </div>
                      <div className="w-0.5 h-3 rounded-full mt-1 bg-[#FF6A00] shadow-[0_0_4px_#FF6A00]"></div>
                    </div>

                    {/* Multi-layered low-poly mountain ornament */}
                    <div className="flex items-end gap-0.5 h-14 shrink-0 relative z-10">
                      <svg viewBox="0 0 70 45" className="w-20 h-14 text-[#19C2E8] filter drop-shadow-[0_2px_6px_rgba(25,194,232,0.3)]">
                        {/* Small green peak in front */}
                        <polygon points="5,45 20,28 35,45" fill="#10B981" opacity="0.55"/>
                        {/* Large cyan peak in back */}
                        <polygon points="12,45 32,15 52,45" fill="#19C2E8" opacity="0.85"/>
                        {/* Medium orange peak in middle */}
                        <polygon points="30,45 48,8 65,45" fill="#FF6A00" opacity="0.7"/>
                        {/* Glowing diamond/star in front */}
                        <polygon points="48,32 51,26 54,32 60,35 54,38 51,44 48,38 42,35" fill="white" className="animate-pulse" />
                      </svg>
                    </div>
                  </div>

                </div>

                {/* Lower control deck toolbar bar */}
                <div className="mt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-4 select-none border-t pt-6 control-deck-toolbar">
                  <Link to="/register?role=sponsor" className="hover:text-[#FF6A00] transition-colors">Sponsor a Student (Full Details)</Link>
                  <Link to="/impact" className="hover:text-[#19C2E8] transition-colors">Impact Reports</Link>
                  <Link to="/contact" className="hover:text-[#19C2E8] transition-colors font-bold">FAQ</Link>
                  <span>© 2024 EDOT Platform</span>
                </div>

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
                 { title: "Technology & Development", icon: Laptop, color: "text-[#00D4FF]", bg: "bg-cyan-100 dark:bg-cyan-900/30" },
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
      <section id="audience" className={`py-32 relative z-20 overflow-hidden border-t ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         <div className="max-w-[1200px] mx-auto px-6">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="text-center mb-16"
            >
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  One Platform — <span className="text-[#00D4FF]">Every Role Connected</span>
               </h2>
               <p className={`text-lg md:text-xl font-medium max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Click a role below to preview how our premium, secure workspaces are uniquely tailored to guide, support, and accelerate their learning journey.
               </p>
            </motion.div>

            {/* Premium Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
               {[
                 { id: 'learner', title: 'Learners', icon: GraduationCap, color: 'text-cyan-400 border-cyan-400 bg-cyan-400/10' },
                 { id: 'instructor', title: 'Instructors', icon: BookOpen, color: 'text-emerald-400 border-emerald-400 bg-emerald-400/10' },
                 { id: 'parent', title: 'Parents', icon: Users, color: 'text-indigo-400 border-indigo-400 bg-indigo-400/10' },
                 { id: 'sponsor', title: 'Sponsors', icon: Heart, color: 'text-rose-400 border-rose-400 bg-rose-400/10' }
               ].map((role) => {
                  const isActive = activeRole === role.id;
                  const Icon = role.icon;
                  return (
                     <motion.button
                       key={role.id}
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={() => setActiveRole(role.id)}
                       className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm border-2 cursor-pointer transition-all duration-300 ${
                         isActive 
                           ? `${role.color} shadow-lg shadow-[#00D4FF]/10` 
                           : (isDarkMode ? 'border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/20' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-350 hover:shadow-sm')
                       }`}
                     >
                       <Icon className="w-5 h-5" />
                       {role.title}
                     </motion.button>
                  );
               })}
            </div>

            {/* Sandbox Container */}
            <div className={`rounded-3xl border p-8 md:p-12 relative overflow-hidden transition-all duration-500 shadow-2xl ${isDarkMode ? 'bg-[#111827] border-white/5 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
               
               {/* Ambient Glow behind sandbox */}
               <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
                 {activeRole === 'learner' && <div className="absolute -right-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-cyan-500 blur-[100px]" />}
                 {activeRole === 'instructor' && <div className="absolute -right-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-emerald-500 blur-[100px]" />}
                 {activeRole === 'parent' && <div className="absolute -right-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-indigo-500 blur-[100px]" />}
                 {activeRole === 'sponsor' && <div className="absolute -right-20 -bottom-20 w-[400px] h-[400px] rounded-full bg-rose-500 blur-[100px]" />}
               </div>

               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
                  
                  {/* LEFT COLUMN: Features & Explanations */}
                  <div className="text-left">
                     {activeRole === 'learner' && (
                        <motion.div
                          key="learner-left"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                           <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-3.5 py-1.5 rounded-full border border-cyan-400/20 mb-6 inline-block">Premium Student Workspace</span>
                           <h3 className={`text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>A Structured Path from Curiosity to Mastery</h3>
                           <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-650'}`}>
                              Students on EDOT enjoy a highly immersive workspace. Instead of viewing isolated videos, learners follow structured curriculum tracks, practice with interactive quizzes, and receive verified credentials that boost their academic and professional goals.
                           </p>
                           <div className="space-y-4 mb-10">
                              {[
                                "Linear lesson progressions with rich media players",
                                "Embedded smart testing modules for immediate feedback",
                                "Direct socket communication with subject-matter mentors",
                                "Encrypted student portfolio and completion certificates"
                              ].map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                                       <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={`text-[15px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item}</span>
                                 </div>
                              ))}
                           </div>
                           <Link to="/register?role=student" className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold px-8 py-4 text-[14px] shadow-lg shadow-cyan-500/10 hover:-translate-y-0.5 transition-all duration-300">
                              Register as a Learner <ArrowRight className="w-4 h-4" />
                           </Link>
                        </motion.div>
                     )}

                     {activeRole === 'instructor' && (
                        <motion.div
                          key="instructor-left"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                           <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3.5 py-1.5 rounded-full border border-emerald-400/20 mb-6 inline-block">Educator Command Center</span>
                           <h3 className={`text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Complete Teaching Autonomy & Insights</h3>
                           <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-650'}`}>
                              Instructors have absolute authority to design curricula and publish lessons. With built-in analytical metrics, teachers can easily audit attendance, monitor overall class performance, and deliver personalized guidance directly.
                           </p>
                           <div className="space-y-4 mb-10">
                              {[
                                "Seamless drag-and-drop dynamic course builder",
                                "Student attendance matrices and automated progress charts",
                                "Admin-instructor course approval and publishing workflows",
                                "Direct video lecture uploads powered by Cloudinary and Multer"
                              ].map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                                       <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={`text-[15px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item}</span>
                                 </div>
                              ))}
                           </div>
                           <Link to="/register?role=instructor" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-8 py-4 text-[14px] shadow-lg shadow-emerald-500/10 hover:-translate-y-0.5 transition-all duration-300">
                              Join as an Instructor <ArrowRight className="w-4 h-4" />
                           </Link>
                        </motion.div>
                     )}

                     {activeRole === 'parent' && (
                        <motion.div
                          key="parent-left"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                           <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-400/10 px-3.5 py-1.5 rounded-full border border-indigo-400/20 mb-6 inline-block">Parent Insight Portal</span>
                           <h3 className={`text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Active Progress Tracking & Connection</h3>
                           <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-650'}`}>
                              EDOT connects parents directly to their child's academic journey. By establishing a secure connection through unique credentials, parents gain absolute visibility into their children's daily progress, study goals, and overall performance.
                           </p>
                           <div className="space-y-4 mb-10">
                              {[
                                "Instant linking using highly secure, encrypted connection keys",
                                "Real-time updates of child's course completion timelines",
                                "Direct access to instructors and study achievement notices",
                                "Comprehensive overview of daily, weekly, and yearly attendance"
                              ].map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] flex items-center justify-center shrink-0">
                                       <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={`text-[15px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item}</span>
                                 </div>
                              ))}
                           </div>
                           <Link to="/register?role=parent" className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-650 text-white font-bold px-8 py-4 text-[14px] shadow-lg shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300">
                              Connect as a Parent <ArrowRight className="w-4 h-4" />
                           </Link>
                        </motion.div>
                     )}

                     {activeRole === 'sponsor' && (
                        <motion.div
                          key="sponsor-left"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                           <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-400/10 px-3.5 py-1.5 rounded-full border border-rose-400/20 mb-6 inline-block">Transparent Sponsorship Board</span>
                           <h3 className={`text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Fund Futures, Track Outcomes</h3>
                           <p className={`text-lg leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-650'}`}>
                              Sponsors can support bright minds directly. The system ensures complete transparency, allowing you to fund education for students in need, authorize connections securely, and track progress metrics in real time.
                           </p>
                           <div className="space-y-4 mb-10">
                              {[
                                "Verifiable student profiles and background connection systems",
                                "Explicit agreement terms and active/pending status trackers",
                                "Direct messaging and study milestone achievement feeds",
                                "Verified outcome reports to measure real social impact"
                              ].map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                                       <CheckCircle className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={`text-[15px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item}</span>
                                 </div>
                              ))}
                           </div>
                           <Link to="/register?role=sponsor" className="inline-flex items-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold px-8 py-4 text-[14px] shadow-lg shadow-rose-500/10 hover:-translate-y-0.5 transition-all duration-300">
                              Become a Sponsor <ArrowRight className="w-4 h-4" />
                           </Link>
                        </motion.div>
                     )}
                  </div>

                  {/* RIGHT COLUMN: Interactive Mockup Card */}
                  <div className="flex justify-center items-center">
                     {activeRole === 'learner' && (
                        <motion.div
                          key="learner-right"
                          initial={{ opacity: 0, scale: 0.9, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                          className={`w-full max-w-[420px] rounded-3xl border p-6 shadow-2xl relative overflow-hidden ${
                            isDarkMode ? 'bg-[#0B1120]/90 border-white/10 shadow-black/80' : 'bg-white border-slate-200 shadow-slate-300/40'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Student Course Progress</span>
                            <span className="text-[10px] bg-cyan-400/20 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold">In Progress</span>
                          </div>
                          <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Python & Data Science Mastery</h4>
                          <p className={`text-xs mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Instructor: Kenenisa Beyan</p>
                          
                          {/* Animating Progress Bar */}
                          <div className={`w-full rounded-full h-2.5 mb-2 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '80%' }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="bg-cyan-500 h-2.5 rounded-full"
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-400 font-bold mb-6">
                            <span>80% Completed</span>
                            <span>12/15 Lessons</span>
                          </div>

                          {/* Next up item */}
                          <div className={`rounded-xl p-3.5 border flex justify-between items-center ${isDarkMode ? 'bg-slate-900/60 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="text-left">
                              <span className="text-[9px] uppercase font-bold text-slate-500">Next Lesson</span>
                              <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>13. Machine Learning Foundations</p>
                            </div>
                            <button className="h-8 w-8 bg-cyan-500 text-slate-900 rounded-full flex items-center justify-center font-bold hover:scale-110 transition-transform cursor-pointer shadow-md pl-0.5">
                              ▶
                            </button>
                          </div>
                        </motion.div>
                     )}

                     {activeRole === 'instructor' && (
                        <motion.div
                          key="instructor-right"
                          initial={{ opacity: 0, scale: 0.9, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                          className={`w-full max-w-[420px] rounded-3xl border p-6 shadow-2xl relative overflow-hidden ${
                            isDarkMode ? 'bg-[#0B1120]/90 border-white/10 shadow-black/80' : 'bg-white border-slate-200 shadow-slate-300/40'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Educator Command Center</span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">Active Auditing</span>
                          </div>
                          
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className={`rounded-2xl p-4 border text-left ${isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                              <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Total Enrolled</span>
                              <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>2,480</span>
                              <span className="text-[9px] text-emerald-400 font-bold block mt-1">↑ 12% this week</span>
                            </div>
                            <div className={`rounded-2xl p-4 border text-left ${isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                              <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Avg. Quiz Score</span>
                              <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>92%</span>
                              <span className="text-[9px] text-emerald-400 font-bold block mt-1">Verified Success</span>
                            </div>
                          </div>

                          {/* Activity list */}
                          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-2.5 text-left">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">AB</div>
                              <div>
                                <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Abebe Demise</p>
                                <p className="text-[9px] text-slate-500">Submitted Quiz 4</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400">Graded (10/10)</span>
                          </div>
                        </motion.div>
                     )}

                     {activeRole === 'parent' && (
                        <motion.div
                          key="parent-right"
                          initial={{ opacity: 0, scale: 0.9, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                          className={`w-full max-w-[420px] rounded-3xl border p-6 shadow-2xl relative overflow-hidden ${
                            isDarkMode ? 'bg-[#0B1120]/90 border-white/10 shadow-black/80' : 'bg-white border-slate-200 shadow-slate-300/40'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Parent Insight Portal</span>
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full font-bold">Encrypted E2E Link</span>
                          </div>

                          <div className={`rounded-2xl p-4 border text-left mb-4 ${isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-slate-500">Child's Attendance Today</span>
                              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">100% Present</span>
                            </div>
                            <div className={`w-full rounded-full h-2 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                              <div className="bg-indigo-500 h-2 rounded-full w-full"></div>
                            </div>
                          </div>

                          <div className={`rounded-2xl p-4 border text-left ${isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                            <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Encrypted Connection Key</span>
                            <div className={`flex justify-between items-center p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                              <code className="text-[11px] font-mono text-emerald-500 dark:text-emerald-400 font-bold">E2E-CONN-PARENT-89A2</code>
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">Linked</span>
                            </div>
                          </div>
                        </motion.div>
                     )}

                     {activeRole === 'sponsor' && (
                        <motion.div
                          key="sponsor-right"
                          initial={{ opacity: 0, scale: 0.9, y: 15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                          className={`w-full max-w-[420px] rounded-3xl border p-6 shadow-2xl relative overflow-hidden ${
                            isDarkMode ? 'bg-[#0B1120]/90 border-white/10 shadow-black/80' : 'bg-white border-slate-200 shadow-slate-300/40'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Sponsor Impact Board</span>
                            <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded-full font-bold">Active Support</span>
                          </div>

                          <div className={`rounded-2xl p-4 border text-left mb-4 ${isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Marta Girma</span>
                              <span className="text-xs font-bold text-rose-500 dark:text-rose-400">Funded 85%</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mb-3 text-left">Goal: Software Engineering Track</p>
                            <div className={`w-full rounded-full h-2 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                              <div className="bg-rose-500 h-2 rounded-full w-[85%]"></div>
                            </div>
                          </div>

                          <div className={`p-3 rounded-xl border flex items-center gap-3 text-left ${isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold text-sm shrink-0">🎓</div>
                            <div>
                              <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Milestone Achieved</p>
                              <p className="text-[9px] text-slate-500 leading-tight">Marta completed Advanced Algorithms quiz</p>
                            </div>
                          </div>
                        </motion.div>
                     )}
                  </div>

               </div>
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

                  <Link
                     to="/register?role=sponsor"
                     className="inline-flex items-center justify-center w-full sm:w-auto bg-[#00D4FF] text-white font-black px-12 py-5 rounded-full hover:bg-[#00c5eb] transition-all text-xl shadow-[0_15px_30px_rgba(0,212,255,0.3)] hover:-translate-y-1 duration-300"
                  >
                     Become a Sponsor
                  </Link>
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
      <section className={`py-32 px-6 relative overflow-hidden border-t transition-colors duration-500 ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
         {/* Premium Abstract Background */}
         <div className="absolute inset-0 z-0">
            <div className={`absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] ${isDarkMode ? 'bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)]'}`}></div>
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
               <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-[#0F3057]'}`}>Tracking What Truly Matters</h2>
               <p className={`text-xl max-w-2xl mx-auto leading-relaxed mb-20 ${isDarkMode ? 'text-slate-300' : 'text-slate-650'}`}>
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
                        <div className={`text-lg font-bold leading-snug ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{stat.label}</div>
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
                  <Link to="/register?role=sponsor" className={`inline-flex items-center justify-center w-full sm:w-auto px-12 py-5 rounded-full font-black text-xl transition-all duration-300 border-2 hover:-translate-y-1 ${isDarkMode ? 'bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white' : 'bg-transparent text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-800'}`}>
                    Sponsor a Student
                  </Link>
               </motion.div>
            </motion.div>
         </motion.div>
      </section>
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