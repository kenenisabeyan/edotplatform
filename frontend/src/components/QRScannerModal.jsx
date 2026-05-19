import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { X, QrCode } from 'lucide-react';
import useThemeMode from '../hooks/useThemeMode';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const isDarkMode = useThemeMode();
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure the DOM element exists
    const timer = setTimeout(() => {
      if (!document.getElementById('qr-reader')) return;
      
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: {width: 250, height: 250} },
        /* verbose= */ false
      );

      html5QrcodeScanner.render((decodedText, decodedResult) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.type === 'digital_id' || data.type === 'session_attendance') {
            html5QrcodeScanner.clear();
            onScanSuccess(data);
            onClose();
          } else {
            setError('Invalid QR Code. Please scan a valid EDOT QR code.');
          }
        } catch (err) {
          setError('Invalid QR Code format.');
        }
      }, (errorMessage) => {
        // parse errors are normal while scanning, ignore them
      });

      scannerRef.current = html5QrcodeScanner;
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error('Failed to clear scanner', err));
      }
    };
  }, [isOpen, onScanSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-md p-6 rounded-[32px] shadow-2xl border ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'} animate-in zoom-in-95 duration-300`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <QrCode className="w-6 h-6 text-[#00D4FF]" /> Scan Digital ID
          </h3>
          <button onClick={onClose} className={`p-2 rounded-full hover:bg-slate-500/10 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        <div className={`rounded-2xl overflow-hidden border-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <div id="qr-reader" className="w-full"></div>
        </div>

        <p className={`text-center text-sm font-medium mt-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Align the student's QR code within the frame to automatically mark attendance.
        </p>
      </div>
    </div>
  );
}
