import React, { useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import useThemeMode from '../hooks/useThemeMode';

export default function LiveRoom({ token, url, roomName, onClose }) {
  const isDarkMode = useThemeMode();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] flex flex-col ${
        isDarkMode ? 'bg-[#0B1221]' : 'bg-slate-100'
      }`}
    >
      <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-white/10 bg-[#151B2B]' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <h2 className="font-bold text-lg">{roomName}</h2>
          <span className="bg-emerald-500/20 text-emerald-500 text-xs px-2 py-1 rounded-full font-bold ml-2 border border-emerald-500/30">LIVE</span>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={async () => {
               const phone = window.prompt("Enter phone number to invite via SMS (e.g. +1234567890):");
               if(phone) {
                 // Call the SMS API we built
                 try {
                   const res = await fetch('/api/messages/sms', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ phone, message: `Join my live class "${roomName}" on EDOT!` })
                   });
                   if(res.ok) alert("Invitation SMS Sent!");
                 } catch(e) {}
               }
             }}
             className={`px-4 py-2 text-sm font-bold rounded-full border transition-all flex items-center gap-2 ${isDarkMode ? 'bg-[#1E293B] border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'}`}
           >
             📱 Invite via SMS
           </button>
           
           <button
             onClick={onClose}
             className={`p-2 rounded-full transition-colors ${
               isDarkMode ? 'bg-white/5 hover:bg-red-500 hover:text-white text-slate-300' : 'bg-slate-100 hover:bg-red-500 hover:text-white text-slate-800'
             }`}
           >
             <X className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="flex-1 relative" data-lk-theme="default">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={url}
          connect={true}
          onDisconnected={onClose}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </motion.div>
  );
}
