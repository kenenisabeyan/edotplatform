import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useThemeMode from '../hooks/useThemeMode';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, BookOpen, Award, Users, Play, Pause, 
  Volume2, VolumeX, Maximize, Settings, MapPin, Sparkles, Star 
} from 'lucide-react';
import "./HeroSection.css";

const qanoVideo = 'https://res.cloudinary.com/dacck6udl/video/upload/v1778415967/edot/frontend/videos/yv9rdzpffbitbyumbn41.mov';

export default function HeroSection() {
  const isDarkMode = useThemeMode();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(6); // Default 6 seconds video
  const [controlsHovered, setControlsHovered] = useState(false);
  
  const videoRef = useRef(null);

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
            d="M 50 372 L 170 192 L 230 262 L 360 122 L 410 182 L 510 72" 
            stroke="url(#neonCyanGlow)" 
            strokeWidth="36" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="opacity-30 blur-lg"
            filter="url(#neonGlow)"
          />

          {/* ==========================================
             VOLUMETRIC CONTINUOUS 3D ZIGZAG RIBBON (5 segments + 3D Arrowhead)
             ========================================== */}

          {/* --- 1. 3D Side/Extrusion Faces (Underneath) --- */}
          {/* Side Face 1 (Orange, Rising) */}
          <path d="M 50 384 L 170 204 L 170 224 L 50 404 Z" fill="url(#arrowOrangeSide)" />
          
          {/* Side Face 2 (Teal, Falling) */}
          <path d="M 170 204 L 230 274 L 230 294 L 170 224 Z" fill="url(#arrowTealSide)" />
          
          {/* Side Face 3 (Orange, Rising) */}
          <path d="M 230 274 L 360 134 L 360 154 L 230 294 Z" fill="url(#arrowOrangeSide)" />
          
          {/* Side Face 4 (Teal, Falling) */}
          <path d="M 360 134 L 410 194 L 410 214 L 360 154 Z" fill="url(#arrowTealSide)" />
          
          {/* Side Face 5 (Orange, Rising) */}
          <path d="M 410 194 L 510 84 L 510 104 L 410 214 Z" fill="url(#arrowOrangeSide)" />

          {/* --- 2. 3D Arrowhead Extrusion Faces --- */}
          {/* Left Arrowhead Side Face */}
          <path d="M 475 105 L 570 15 L 570 35 L 475 125 Z" fill="url(#arrowTealSide)" />
          {/* Right Arrowhead Side Face */}
          <path d="M 530 40 L 570 15 L 570 35 L 530 60 Z" fill="url(#arrowTealSide)" />

          {/* --- 3. Front Glossy Top Faces --- */}
          {/* Segment 1 Top Face (Orange) */}
          <path d="M 50 360 L 170 180 L 170 204 L 50 384 Z" fill="url(#arrowOrangeFront)" />
          
          {/* Segment 2 Top Face (Teal) */}
          <path d="M 170 180 L 230 250 L 230 274 L 170 204 Z" fill="url(#arrowTealFront)" />
          
          {/* Segment 3 Top Face (Orange) */}
          <path d="M 230 250 L 360 110 L 360 134 L 230 274 Z" fill="url(#arrowOrangeFront)" />
          
          {/* Segment 4 Top Face (Teal) */}
          <path d="M 360 110 L 410 170 L 410 194 L 360 134 Z" fill="url(#arrowTealFront)" />
          
          {/* Segment 5 Top Face (Orange) */}
          <path d="M 410 170 L 510 60 L 510 84 L 410 194 Z" fill="url(#arrowOrangeFront)" />

          {/* --- 4. Arrowhead Top Face --- */}
          <path 
            d="M 475 105 L 570 15 L 530 40 Z" 
            fill="url(#arrowTealFront)" 
            stroke="#19C2E8" 
            strokeWidth="1.5" 
            filter="url(#neonGlow)"
          />

          {/* Secondary Trailing smaller blue arrow emphasizing acceleration */}
          <path 
            d="M 380 230 L 450 140" 
            stroke="url(#arrowTealFront)" 
            strokeWidth="12" 
            strokeLinecap="round"
            opacity="0.8"
            filter="url(#neonGlow)"
          />
          <path 
            d="M 446 142 L 476 168" 
            stroke="url(#arrowOrangeFront)" 
            strokeWidth="12" 
            strokeLinecap="round"
            opacity="0.8"
          />
          <path 
            d="M 474 166 L 530 100" 
            stroke="url(#arrowTealFront)" 
            strokeWidth="12" 
            strokeLinecap="round"
            opacity="0.8"
            filter="url(#neonGlow)"
          />
          <path 
            d="M 505 96 L 534 94 L 530 125 Z" 
            fill="url(#arrowTealFront)" 
            opacity="0.8"
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

        </motion.div>

      </div>
    </div>
  );
}
