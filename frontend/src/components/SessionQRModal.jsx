import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode } from 'lucide-react';
import useThemeMode from '../hooks/useThemeMode';

export default function SessionQRModal({ isOpen, onClose, courseId, section }) {
  const isDarkMode = useThemeMode();

  if (!isOpen) return null;

  const qrData = JSON.stringify({
    type: 'session_attendance',
    courseId,
    section
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-sm p-8 rounded-[32px] shadow-2xl border ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'} animate-in zoom-in-95 duration-300 flex flex-col items-center text-center`}>
        <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-full hover:bg-slate-500/10 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
          <X className="w-5 h-5" />
        </button>

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${isDarkMode ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
           <QrCode className="w-8 h-8" />
        </div>

        <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Class Check-in
        </h3>
        <p className={`text-sm mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Project this QR Code so students can scan it with their devices to check in automatically.
        </p>

        <div className={`p-4 bg-white rounded-3xl shadow-inner border-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <QRCodeSVG 
            value={qrData}
            size={200}
            bgColor={"#ffffff"}
            fgColor={"#0f172a"}
            level={"H"}
          />
        </div>

        <div className={`mt-8 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase border ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
          Section: {section || 'Main'}
        </div>
      </div>
    </div>
  );
}
