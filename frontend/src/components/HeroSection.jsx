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
    <div className="premium-hero-wrap">
      {/* Dynamic backdrop gradient canvas */}
      <div className="premium-hero-bg"></div>

      <div className="premium-hero-grid">
        
        {/* ================= LEFT-HAND CONTENT ================= */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start"
        >
          {/* Location / Tagline Pill */}
          <div className="tagline-badge-pill">
            <MapPin className="w-4 h-4 fill-current" />
            <span>Bridging structural gaps through education</span>
          </div>

          {/* Heading */}
          <h1 className="premium-hero-title">
            Every Learner Deserves <br />
            <span className="premium-title-gradient">a Chance to Succeed</span>
          </h1>

          {/* Speech bubbles 2x2 Grid */}
          <div className="speech-bubble-grid">
            
            {/* Card 1: Personalized Pathways */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
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

            {/* Card 2: Curated Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
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

            {/* Card 3: Interactive Learning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="speech-bubble-card bubble-interactive"
            >
              <div className="bubble-icon-wrap icon-orange">
                <Award className="w-5 h-5" />
              </div>
              <div className="bubble-text-wrap">
                <h4 className="bubble-title">Interactive Learning</h4>
                <p className="bubble-desc">Engaged with real-world projects.</p>
              </div>
            </motion.div>

            {/* Card 4: Community Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
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

          </div>
        </motion.div>

        {/* ================= RIGHT-HAND VISUALS ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="premium-hero-visuals"
        >
          {/* Stunning Zigzag Growth Ribbon Arrow (Inline SVG Backdrop) */}
          <div className="zigzag-arrow-backdrop">
            <svg 
              viewBox="0 0 550 400" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full opacity-90 filter drop-shadow-[0_15px_30px_rgba(255,106,0,0.15)]"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="ribbonOrange" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF6A00" />
                  <stop offset="50%" stopColor="#FF9000" />
                  <stop offset="100%" stopColor="#FFB700" />
                </linearGradient>
                <linearGradient id="ribbonTeal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#19C2E8" />
                  <stop offset="100%" stopColor="#00D4FF" />
                </linearGradient>
                <linearGradient id="ribbonGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#19C2E8" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Backglow trail path */}
              <path 
                d="M 50 350 L 160 250 L 220 300 L 330 180 L 390 230 L 490 80" 
                stroke="url(#ribbonGlow)" 
                strokeWidth="28" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="opacity-40 blur-md"
              />

              {/* Segment 1: Bottom orange slope (goes up-right) */}
              <path 
                d="M 40 360 L 170 240" 
                stroke="url(#ribbonOrange)" 
                strokeWidth="24" 
                strokeLinecap="round"
              />

              {/* Segment 2: Teal turn slope (goes down-right) */}
              <path 
                d="M 166 244 L 224 296" 
                stroke="url(#ribbonTeal)" 
                strokeWidth="24" 
                strokeLinecap="round"
              />

              {/* Segment 3: Middle orange slope (goes up-right) */}
              <path 
                d="M 218 292 L 342 168" 
                stroke="url(#ribbonOrange)" 
                strokeWidth="24" 
                strokeLinecap="round"
              />

              {/* Segment 4: Teal turn slope (goes down-right) */}
              <path 
                d="M 338 172 L 394 224" 
                stroke="url(#ribbonTeal)" 
                strokeWidth="24" 
                strokeLinecap="round"
              />

              {/* Segment 5: Top orange slope leading to arrowhead */}
              <path 
                d="M 388 220 L 496 90" 
                stroke="url(#ribbonOrange)" 
                strokeWidth="24" 
                strokeLinecap="round"
              />

              {/* Large arrowhead pointing Up-Right */}
              <path 
                d="M 450 82 L 508 76 L 502 134 Z" 
                fill="url(#ribbonTeal)" 
                stroke="url(#ribbonTeal)" 
                strokeWidth="6" 
                strokeLinejoin="round"
              />
            </svg>
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
