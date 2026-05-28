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
            <MapPin className="w-4 h-4 fill-current" />
            <span>Beilling careful flow through equation</span>
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
                  <p className="bubble-desc">Tat and learning for your ensper journey.</p>
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
                  <p className="bubble-desc">Explore Thousands of expertied cowners.</p>
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
                  <p className="bubble-desc">Engaged with real world projects.</p>
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
                  <p className="bubble-desc">Lean with gears and owners.</p>
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
          {/* Volumetric 3D Zigzag Growth Centerpiece (Inline SVG Backdrop) */}
          <div className="zigzag-arrow-backdrop">
            <svg 
              viewBox="0 0 580 400" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full opacity-95 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
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
                
                {/* 3D Arrow Gradients */}
                <linearGradient id="arrowOrangeFront" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff7b00" />
                  <stop offset="100%" stopColor="#ff9f43" />
                </linearGradient>
                <linearGradient id="arrowOrangeSide" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d35400" />
                  <stop offset="100%" stopColor="#e67e22" />
                </linearGradient>
                
                <linearGradient id="arrowTealFront" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00bfff" />
                  <stop offset="100%" stopColor="#4facfe" />
                </linearGradient>
                <linearGradient id="arrowTealSide" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0086b3" />
                  <stop offset="100%" stopColor="#005c80" />
                </linearGradient>
                
                <linearGradient id="neonCyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#19C2E8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Glowing Ambient Light Trail behind 3D arrow */}
              <path 
                d="M 40 370 L 160 250 L 220 300 L 340 180 L 395 230 L 490 100" 
                stroke="url(#neonCyanGlow)" 
                strokeWidth="32" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="opacity-30 blur-lg"
                filter="url(#neonGlow)"
              />

              {/* ==========================================
                 VOLUMETRIC 3D ZIGZAG PARTS
                 ========================================== */}

              {/* --- Segment 1: Orange Bottom-up Slope --- */}
              {/* Shading/Side Face */}
              <path d="M 30 365 L 42 377 L 42 387 L 30 375 Z" fill="#b33600" />
              <path d="M 42 377 L 172 257 L 172 267 L 42 387 Z" fill="url(#arrowOrangeSide)" />
              {/* Front Face */}
              <path d="M 30 365 L 160 245 L 172 257 L 42 377 Z" fill="url(#arrowOrangeFront)" />

              {/* --- Segment 2: Teal Turn Slope --- */}
              {/* Shading/Side Face */}
              <path d="M 160 245 L 172 231 L 172 221 L 160 235 Z" fill="#004d66" />
              <path d="M 220 297 L 232 283 L 232 273 L 220 287 Z" fill="url(#arrowTealSide)" />
              {/* Front Face */}
              <path d="M 160 245 L 220 297 L 232 283 L 172 231 Z" fill="url(#arrowTealFront)" />

              {/* --- Segment 3: Orange Middle Slope --- */}
              {/* Shading/Side Face */}
              <path d="M 232 283 L 352 163 L 352 173 L 232 293 Z" fill="url(#arrowOrangeSide)" />
              {/* Front Face */}
              <path d="M 220 297 L 340 177 L 352 189 L 232 309 Z" fill="url(#arrowOrangeFront)" />

              {/* --- Segment 4: Teal Turn Slope --- */}
              {/* Shading/Side Face */}
              <path d="M 340 177 L 352 163 L 352 153 L 340 167 Z" fill="#004d66" />
              <path d="M 395 229 L 407 215 L 407 205 L 395 219 Z" fill="url(#arrowTealSide)" />
              {/* Front Face */}
              <path d="M 340 177 L 395 229 L 407 215 L 352 163 Z" fill="url(#arrowTealFront)" />

              {/* --- Segment 5: Orange Top Slope --- */}
              {/* Shading/Side Face */}
              <path d="M 407 215 L 507 115 L 507 125 L 407 225 Z" fill="url(#arrowOrangeSide)" />
              {/* Front Face */}
              <path d="M 395 229 L 495 129 L 507 141 L 407 241 Z" fill="url(#arrowOrangeFront)" />

              {/* --- Segment 6: Massive Arrowhead --- */}
              {/* Shading/Side Face */}
              <path d="M 445 126 L 485 130 L 485 138 L 445 134 Z" fill="#004d66" />
              <path d="M 485 130 L 500 144 L 500 152 L 485 138 Z" fill="url(#arrowTealSide)" />
              {/* Front Face */}
              <path 
                d="M 445 126 L 514 94 L 500 144 L 485 130 L 445 126 Z" 
                fill="url(#arrowTealFront)" 
                stroke="#19C2E8" 
                strokeWidth="1.5" 
                filter="url(#neonGlow)"
              />

              {/* Secondary Trailing smaller blue arrow emphasizing acceleration */}
              <path 
                d="M 320 280 L 390 210" 
                stroke="url(#arrowTealFront)" 
                strokeWidth="12" 
                strokeLinecap="round"
                opacity="0.8"
                filter="url(#neonGlow)"
              />
              <path 
                d="M 386 212 L 416 238" 
                stroke="url(#arrowOrangeFront)" 
                strokeWidth="12" 
                strokeLinecap="round"
                opacity="0.8"
              />
              <path 
                d="M 414 236 L 470 170" 
                stroke="url(#arrowTealFront)" 
                strokeWidth="12" 
                strokeLinecap="round"
                opacity="0.8"
                filter="url(#neonGlow)"
              />
              <path 
                d="M 445 166 L 474 164 L 470 195 Z" 
                fill="url(#arrowTealFront)" 
                opacity="0.8"
              />

              {/* ==========================================
                 EXTRA GROWTH/FIN-TECH METRIC INDICATORS
                 ========================================== */}
              
              {/* Mini glowing analytics bars at bottom left of chart */}
              <rect x="60" y="320" width="8" height="24" rx="2" fill="#19C2E8" opacity="0.65" filter="url(#neonGlow)" />
              <rect x="74" y="296" width="8" height="48" rx="2" fill="#EBC176" opacity="0.85" />
              <rect x="88" y="310" width="8" height="34" rx="2" fill="#FF6A00" opacity="0.7" />

              {/* Glowing metric dots orbiting */}
              <circle cx="120" cy="210" r="4.5" fill="#19C2E8" filter="url(#neonGlow)" />
              <circle cx="280" cy="240" r="3.5" fill="#FF6A00" />
              <circle cx="430" cy="180" r="4" fill="#EBC176" />
              
              {/* Subtle translucent thin dashboard connection lines */}
              <line x1="120" y1="210" x2="160" y2="250" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="280" y1="240" x2="340" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>

            {/* Floating anti-gravity particles and neon blue sparks breaking off arrow tip */}
            <div className="spark-particle spark-1" style={{ top: "22%", right: "12%", width: "9px", height: "9px" }}></div>
            <div className="spark-particle spark-2" style={{ top: "18%", right: "8%", width: "6px", height: "6px" }}></div>
            <div className="spark-particle spark-3" style={{ top: "25%", right: "6%", width: "7px", height: "7px" }}></div>
            <div className="spark-particle spark-1" style={{ top: "14%", right: "15%", width: "5px", height: "5px" }}></div>
            <div className="spark-particle spark-2" style={{ top: "28%", right: "10%", width: "8px", height: "8px" }}></div>
          </div>

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
