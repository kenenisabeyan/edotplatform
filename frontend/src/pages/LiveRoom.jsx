import React, { useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  useRoomContext
} from '@livekit/components-react';
import '@livekit/components-styles';
import { motion } from 'framer-motion';
import { X, Share2, CircleDot } from 'lucide-react';
import useThemeMode from '../hooks/useThemeMode';
import toast from 'react-hot-toast';

export default function LiveRoom({ token, url, roomName, onClose }) {
  const isDarkMode = useThemeMode();
  const [isRecording, setIsRecording] = useState(false);

  const copyInviteLink = () => {
    // Assuming the classId is the roomName suffix
    const classId = roomName.replace('edot-class-', '');
    const link = `${window.location.origin}/dashboard/live_classes?join=${classId}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`fixed inset-0 z-[100] flex flex-col font-sans overflow-hidden ${
        isDarkMode ? 'bg-[#0B1221]' : 'bg-slate-100'
      }`}
    >
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none z-0"></div>

      {/* Modern Floating Header */}
      <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-xl border shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <span className="absolute w-full h-full rounded-full bg-red-400 animate-ping opacity-75"></span>
            <CircleDot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`font-black text-lg leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {roomName.replace('edot-class-', 'Session ')}
            </h2>
            <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Encrypted Stream
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={copyInviteLink}
             className={`px-5 py-2.5 text-xs font-bold rounded-full border transition-all flex items-center gap-2 ${isDarkMode ? 'bg-white/10 border-white/5 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'}`}
           >
             <Share2 className="w-4 h-4" /> Copy Link
           </button>
           
           <button
             onClick={onClose}
             className="px-5 py-2.5 text-xs font-bold rounded-full bg-red-500 hover:bg-red-600 text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center gap-2"
           >
             <X className="w-4 h-4" /> End Call
           </button>
        </div>
      </div>

      {/* Main LiveKit Container */}
      <div className="flex-1 relative mt-24 mb-6 mx-6 rounded-[32px] overflow-hidden border shadow-2xl border-white/10" data-lk-theme="default">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={url}
          connect={true}
          onDisconnected={onClose}
          className="h-full w-full custom-lk-room"
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>

      {/* Custom Styles Injection to Override Default LiveKit CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .lk-room-container {
          background: transparent !important;
        }
        .lk-video-conference {
          height: 100%;
        }
        .lk-control-bar {
          background: ${isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)'} !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important;
          border-radius: 999px !important;
          margin: 20px auto !important;
          width: fit-content !important;
          padding: 10px 20px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
        }
        .lk-button {
          border-radius: 50% !important;
          width: 50px !important;
          height: 50px !important;
          margin: 0 5px !important;
          background: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} !important;
          border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} !important;
          transition: all 0.2s ease !important;
        }
        .lk-button:hover {
          background: ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} !important;
          transform: translateY(-2px) !important;
        }
        .lk-button[data-lk-source="camera"][aria-pressed="false"],
        .lk-button[data-lk-source="microphone"][aria-pressed="false"] {
          background: #EF4444 !important;
          color: white !important;
        }
        .lk-participant-tile {
          border-radius: 24px !important;
          overflow: hidden !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
        }
        .lk-chat {
          border-radius: 24px !important;
          background: ${isDarkMode ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.9)'} !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} !important;
        }
      `}} />
    </motion.div>
  );
}
