import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useThemeMode from '../hooks/useThemeMode';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, BookOpen, Award, Users, Play, Pause, 
  Volume2, VolumeX, Maximize, Settings, MapPin, Sparkles, Star,
  ArrowRight
} from 'lucide-react';
import { getRecentPublicUsers } from '../utils/api';
import "./HeroSection.css";

const qanoVideo = 'https://res.cloudinary.com/dacck6udl/video/upload/v1778415967/edot/frontend/videos/yv9rdzpffbitbyumbn41.mov';

export default function HeroSection() {
  const isDarkMode = useThemeMode();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(6); // Default 6 seconds video
  const [controlsHovered, setControlsHovered] = useState(false);
  const [recentUsers, setRecentUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(1000);
  
  const videoRef = useRef(null);

  // Fetch actual database users dynamically & pad with stunning Unsplash profiles matching target mockup
  useEffect(() => {
    let active = true;
    const fetchUsers = async () => {
      try {
        const data = await getRecentPublicUsers();
        if (active) {
          const dbUsers = (data && data.success) ? (data.users || []) : [];
          const placeholders = [
            { id: 'p1', name: 'Kenenisa Beyan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120' },
            { id: 'p2', name: 'Chala Desta', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120' },
            { id: 'p3', name: 'Marta Alemu', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120&h=120' },
            { id: 'p4', name: 'Lensa Tolosa', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120' }
          ];
          const merged = [...dbUsers];
          for (let i = merged.length; i < 4; i++) {
            merged.push(placeholders[i - dbUsers.length]);
          }
          setRecentUsers(merged);
          setTotalCount((data && data.totalCount) ? data.totalCount : 1000);
        }
      } catch (err) {
        console.error("Failed to fetch public users in hero:", err);
      }
    };
    fetchUsers();
    return () => { active = false; };
  }, []);

  // Sync video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 6);
    }
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoPause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      handleVideoPause();
    } else {
      handleVideoPlay();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimelineClick = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="premium-hero-wrap animate-fade-in">
      {/* Dynamic backdrop gradient canvas mirroring the screenshot */}
      <div className="premium-hero-bg"></div>
      
      {/* Glowing Digital Mesh Grid */}
      <div className="digital-grid-overlay"></div>

      {/* ================= STUNNING 3D ZIGZAG CENTERPIECE BACKGROUND ELEMENT ================= */}
      {/* Mounted at the root parent level so it spans the entire hero layout behind columns */}
      <div className="zigzag-arrow-backdrop">
        <svg 
          viewBox="0 0 580 400" 
          width="100%"
          height="100%"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-95 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
        >
          {/* Volumetric Gradients & Filters */}
          <defs>
            {/* Neon Glow Filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* 3D Arrow Gradients (Glossy Metallic/Glass finishes) */}
            <linearGradient id="arrowOrangeFront" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff5e00" />
              <stop offset="35%" stopColor="#ff8f44" />
              <stop offset="50%" stopColor="#ffd3b0" />
              <stop offset="65%" stopColor="#ff8f44" />
              <stop offset="100%" stopColor="#d34000" />
            </linearGradient>
            <linearGradient id="arrowOrangeSide" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b23c00" />
              <stop offset="50%" stopColor="#d34c00" />
              <stop offset="100%" stopColor="#7f2700" />
            </linearGradient>
            
            <linearGradient id="arrowTealFront" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00a2d0" />
              <stop offset="35%" stopColor="#19c2e8" />
              <stop offset="50%" stopColor="#e0f7fa" />
              <stop offset="65%" stopColor="#19c2e8" />
              <stop offset="100%" stopColor="#007a9b" />
            </linearGradient>
            <linearGradient id="arrowTealSide" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#006c88" />
              <stop offset="50%" stopColor="#008ea4" />
              <stop offset="100%" stopColor="#004558" />
            </linearGradient>

            <linearGradient id="neonCyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#19C2E8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Glowing Ambient Light Trail behind 3D arrow */}
          <path 
            d="M -30 393 L 110 207 L 160 277 L 260 167 L 310 217 L 410 97 L 460 147 L 530 72" 
            stroke="url(#neonCyanGlow)" 
            strokeWidth="36" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="opacity-30 blur-lg"
            filter="url(#neonGlow)"
          />

          {/* ==========================================
             VOLUMETRIC CONTINUOUS 3D ZIGZAG RIBBON (7 segments + 3D Arrowhead)
             ========================================== */}

          {/* --- 1. 3D Side/Extrusion Faces (Underneath) --- */}
          {/* Side Face 1 (Orange, Rising) */}
          <path d="M -30 407 L 110 221 L 110 241 L -30 427 Z" fill="url(#arrowOrangeSide)" />
          
          {/* Side Face 2 (Teal, Falling) */}
          <path d="M 110 221 L 160 291 L 160 311 L 110 241 Z" fill="url(#arrowTealSide)" />
          
          {/* Side Face 3 (Orange, Rising) */}
          <path d="M 160 291 L 260 181 L 260 201 L 160 311 Z" fill="url(#arrowOrangeSide)" />
          
          {/* Side Face 4 (Teal, Falling) */}
          <path d="M 260 181 L 310 231 L 310 251 L 260 201 Z" fill="url(#arrowTealSide)" />
          
          {/* Side Face 5 (Orange, Rising) */}
          <path d="M 310 231 L 410 111 L 410 131 L 310 251 Z" fill="url(#arrowOrangeSide)" />
          
          {/* Side Face 6 (Teal, Falling) */}
          <path d="M 410 111 L 460 161 L 460 181 L 410 131 Z" fill="url(#arrowTealSide)" />
          
          {/* Side Face 7 (Orange, Rising) */}
          <path d="M 460 161 L 530 86 L 530 106 L 460 181 Z" fill="url(#arrowOrangeSide)" />

          {/* --- 2. 3D Arrowhead Extrusion Faces --- */}
          {/* Left Arrowhead Side Face */}
          <path d="M 501 45 L 580 15 L 580 35 L 501 65 Z" fill="url(#arrowTealSide)" />
          {/* Right Arrowhead Side Face */}
          <path d="M 559 99 L 580 15 L 580 35 L 559 119 Z" fill="url(#arrowTealSide)" />

          {/* --- 3. Front Glossy Top Faces --- */}
          {/* Segment 1 Top Face (Orange) */}
          <path d="M -30 379 L 110 193 L 110 221 L -30 407 Z" fill="url(#arrowOrangeFront)" />
          
          {/* Segment 2 Top Face (Teal) */}
          <path d="M 110 193 L 160 263 L 160 291 L 110 221 Z" fill="url(#arrowTealFront)" />
          
          {/* Segment 3 Top Face (Orange) */}
          <path d="M 160 263 L 260 153 L 260 181 L 160 291 Z" fill="url(#arrowOrangeFront)" />
          
          {/* Segment 4 Top Face (Teal) */}
          <path d="M 260 153 L 310 203 L 310 231 L 260 181 Z" fill="url(#arrowTealFront)" />
          
          {/* Segment 5 Top Face (Orange) */}
          <path d="M 310 203 L 410 83 L 410 111 L 310 231 Z" fill="url(#arrowOrangeFront)" />
          
          {/* Segment 6 Top Face (Teal) */}
          <path d="M 410 83 L 460 133 L 460 161 L 410 111 Z" fill="url(#arrowTealFront)" />
          
          {/* Segment 7 Top Face (Orange) */}
          <path d="M 460 133 L 530 58 L 530 86 L 460 161 Z" fill="url(#arrowOrangeFront)" />

          {/* --- 4. Arrowhead Top Face --- */}
          <path 
            d="M 501 45 L 580 15 L 559 99 Z" 
            fill="url(#arrowTealFront)" 
            stroke="#19C2E8" 
            strokeWidth="1.5" 
            filter="url(#neonGlow)"
          />

          {/* Volumetric 3D Trailing Smaller Arrow (styled exactly like the larger arrow) */}
          {/* --- 1. 3D Side/Extrusion Faces (Underneath) --- */}
          <path d="M 385 252 L 455 162 L 455 174 L 385 264 Z" fill="url(#arrowTealSide)" opacity="0.8" />
          <path d="M 455 162 L 480 188 L 480 200 L 455 174 Z" fill="url(#arrowOrangeSide)" opacity="0.8" />
          <path d="M 480 188 L 535 122 L 535 134 L 480 200 Z" fill="url(#arrowTealSide)" opacity="0.8" />

          {/* --- 2. 3D Arrowhead Extrusion Faces --- */}
          <path d="M 520 101 L 556 90 L 556 102 L 520 113 Z" fill="url(#arrowTealSide)" opacity="0.8" />
          <path d="M 550 127 L 556 90 L 556 102 L 550 139 Z" fill="url(#arrowTealSide)" opacity="0.8" />

          {/* --- 3. Front Glossy Top Faces --- */}
          <path d="M 385 236 L 455 146 L 455 162 L 385 252 Z" fill="url(#arrowTealFront)" opacity="0.8" filter="url(#neonGlow)" />
          <path d="M 455 146 L 480 172 L 480 188 L 455 162 Z" fill="url(#arrowOrangeFront)" opacity="0.8" />
          <path d="M 480 172 L 535 106 L 535 122 L 480 188 Z" fill="url(#arrowTealFront)" opacity="0.8" filter="url(#neonGlow)" />

          {/* --- 4. Arrowhead Top Face --- */}
          <path 
            d="M 520 101 L 556 90 L 550 127 Z" 
            fill="url(#arrowTealFront)" 
            stroke="#19C2E8" 
            strokeWidth="1.2" 
            opacity="0.8"
            filter="url(#neonGlow)"
          />

          {/* ==========================================
             EXTRA GROWTH/FIN-TECH METRIC INDICATORS
             ========================================== */}
          <rect x="60" y="320" width="8" height="24" rx="2" fill="#19C2E8" opacity="0.65" filter="url(#neonGlow)" />
          <rect x="74" y="296" width="8" height="48" rx="2" fill="#EBC176" opacity="0.85" />
          <rect x="88" y="310" width="8" height="34" rx="2" fill="#FF6A00" opacity="0.7" />

          <circle cx="120" cy="210" r="4.5" fill="#19C2E8" filter="url(#neonGlow)" />
          <circle cx="280" cy="240" r="3.5" fill="#FF6A00" />
          <circle cx="430" cy="180" r="4" fill="#EBC176" />
          
          <line x1="120" y1="210" x2="160" y2="250" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="280" y1="240" x2="340" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>

        {/* Floating anti-gravity particles and neon blue sparks breaking off arrow tip */}
        <div className="spark-particle spark-1" style={{ top: "15%", right: "8%", width: "9px", height: "9px" }}></div>
        <div className="spark-particle spark-2" style={{ top: "12%", right: "5%", width: "6px", height: "6px" }}></div>
        <div className="spark-particle spark-3" style={{ top: "18%", right: "3%", width: "7px", height: "7px" }}></div>
        <div className="spark-particle spark-1" style={{ top: "8%", right: "12%", width: "5px", height: "5px" }}></div>
        <div className="spark-particle spark-2" style={{ top: "20%", right: "7%", width: "8px", height: "8px" }}></div>
      </div>

      <div className="premium-hero-grid">
        
        {/* ================= LEFT-HAND CONTENT ================= */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start"
        >
          {/* Tagline Pill - Exact text matching the screenshot */}
          <div className="tagline-badge-pill">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Channelling beautiful flow through education</span>
          </div>

          {/* Heading */}
          <h1 className="premium-hero-title">
            Every Learner Deserves <br />
            <span className="premium-title-gradient">a Chance to Succeed</span>
          </h1>

          {/* Subtitle below main heading */}
          <p className="premium-hero-subtitle">
            EDOT is a unified educational ecosystem designed to bridge structural gaps in learning. We empower students with personalized pathways, expert-led interactive courses, real-time parent tracking, and direct sponsorship networks to guarantee academic opportunity for every single learner.
          </p>

          {/* Speech bubbles 2x2 Grid - Direct matching to screenshot layout and content */}
          <div className="speech-bubble-grid">
            
            {/* Card 1: Personalized Pathways */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="speech-bubble-card bubble-pathways"
              >
                <div className="bubble-icon-wrap icon-blue">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="bubble-text-wrap">
                  <h4 className="bubble-title">Personalized Pathways</h4>
                  <p className="bubble-desc">Tailored learning for your unique journey.</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Card 2: Curated Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
                className="speech-bubble-card bubble-courses"
              >
                <div className="bubble-icon-wrap icon-red">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="bubble-text-wrap">
                  <h4 className="bubble-title">Curated Courses</h4>
                  <p className="bubble-desc">Explore thousands of expert-led courses.</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Card 3: Interactive Learning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 1 }}
                className="speech-bubble-card bubble-interactive"
              >
                <div className="bubble-icon-wrap icon-orange">
                  <Award className="w-5 h-5" />
                </div>
                <div className="bubble-text-wrap">
                  <h4 className="bubble-title">Interactive Learning</h4>
                  <p className="bubble-desc">Engage with real-world projects.</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Card 4: Community Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 1.5 }}
                className="speech-bubble-card bubble-community"
              >
                <div className="bubble-icon-wrap icon-green">
                  <Users className="w-5 h-5" />
                </div>
                <div className="bubble-text-wrap">
                  <h4 className="bubble-title">Community Support</h4>
                  <p className="bubble-desc">Learn with peers and mentors.</p>
                </div>
              </motion.div>
            </motion.div>

          </div>

          {/* Brand Call-To-Action (CTA) Buttons below 2x2 grid */}
          <div className="hero-cta-button-group">
            <Link 
              to="/register" 
              className="hero-cta-btn btn-cyan-glowing"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/register?role=sponsor" 
              className="hero-cta-btn btn-orange-glowing"
            >
              <span>Sponsor a Student</span>
              <Sparkles className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* ================= RIGHT-HAND VISUALS ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="premium-hero-visuals"
        >
          {/* System Growth tracker overlay */}
          <div className="system-growth-widget select-none">
            <span className="system-growth-text">System <span>Growth</span></span>
            <div className="system-growth-bar">
              <div className="system-growth-bar-fill"></div>
            </div>
          </div>

          {/* Gold EDOT Arrowhead Badge */}
          <div className="edot-arrowhead-badge select-none">
            <GraduationCap className="w-4.5 h-4.5 fill-current" />
            <span className="edot-arrowhead-text">EDOT</span>
          </div>

          {/* Interactive Course Trailer Video Player */}
          <div 
            className="premium-video-wrapper"
            onMouseEnter={() => setControlsHovered(true)}
            onMouseLeave={() => setControlsHovered(false)}
          >
            <div className="premium-video-card">
              <video
                ref={videoRef}
                src={qanoVideo}
                loop
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className={!isPlaying ? "video-dimmed" : ""}
                onClick={togglePlay}
              />

              {/* Play Overlay when video is paused */}
              {!isPlaying && (
                <div className="video-play-overlay" onClick={handleVideoPlay}>
                  <button className="video-play-btn" aria-label="Play Course Trailer">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </button>
                </div>
              )}

              {/* Premium overlay controls */}
              <AnimatePresence>
                {(controlsHovered || !isPlaying) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3 }}
                    className="video-controls-bar"
                  >
                    {/* Seeker timeline bar */}
                    <div className="video-timeline-wrap" onClick={handleTimelineClick}>
                      <div 
                        className="video-timeline-fill" 
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      ></div>
                      <div 
                        className="video-timeline-knob"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                      ></div>
                    </div>

                    <div className="video-controls-row">
                      {/* Left: Play/Pause, Volume, Timer */}
                      <div className="video-controls-left">
                        {isPlaying ? (
                          <Pause className="video-ctrl-icon" onClick={handleVideoPause} />
                        ) : (
                          <Play className="video-ctrl-icon fill-current" onClick={handleVideoPlay} />
                        )}
                        
                        <div onClick={toggleMute} className="flex items-center">
                          {isMuted ? (
                            <VolumeX className="video-ctrl-icon" />
                          ) : (
                            <Volume2 className="video-ctrl-icon" />
                          )}
                        </div>

                        <span className="video-time-text">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      {/* Right: Settings, Fullscreen */}
                      <div className="video-controls-right">
                        <Settings className="video-ctrl-icon" />
                        <Maximize 
                          className="video-ctrl-icon" 
                          onClick={() => {
                            if (videoRef.current) {
                              if (videoRef.current.requestFullscreen) {
                                videoRef.current.requestFullscreen();
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Glowing Corner Star Badge Ornament */}
            <div className="video-star-ornament">
              <Star className="w-8 h-8 fill-current text-white/90" strokeWidth={1} />
            </div>
          </div>

          {/* Glassy developer console bar below video */}
          {recentUsers && recentUsers.length > 0 && (
            <div className="video-footer-console">
              {/* Console Top Row: Avatars & Community Text */}
              <div className="console-community-section">
                <div className="avatar-overlap-group">
                  {recentUsers.map((u, idx) => (
                    <div 
                      key={u.id || idx} 
                      className="community-avatar-ring"
                      style={{ zIndex: 10 - idx }}
                    >
                      {u.avatar ? (
                        <img 
                          src={u.avatar} 
                          alt={u.name} 
                          className="community-avatar-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`;
                          }}
                        />
                      ) : (
                        <div className="community-avatar-initials">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <span className="community-stack-text">
                  Join our <span className="highlight-cyan font-extrabold">{totalCount}+</span> community.
                </span>
              </div>

              {/* Console Bottom Row: Git terminal + Join EDOT action */}
              <div className="console-action-row">
                <div className="console-terminal-line">
                  <span className="terminal-prompt">$</span>
                  <span>git commit -m "style(frontend): adjust HeroSection layout and styling"</span>
                </div>
                <Link to="/register" className="console-join-btn">
                  <span>Join EDOT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </motion.div>

      </div>
    </div>
  );
}
