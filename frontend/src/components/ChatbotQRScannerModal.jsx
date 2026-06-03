import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode } from 'lucide-react';
import useThemeMode from '../hooks/useThemeMode';

export default function ChatbotQRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const isDarkMode = useThemeMode();
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!document.getElementById('chatbot-qr-reader')) return;
      
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "chatbot-qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      html5QrcodeScanner.render((decodedText, decodedResult) => {
        try {
          // Send the raw decoded text directly to the scanner callback
          html5QrcodeScanner.clear();
          onScanSuccess(decodedText);
          onClose();
        } catch (err) {
          setError('Failed to process QR Code content.');
        }
      }, (errorMessage) => {
        // Parse errors are normal while scanning, ignore them
      });

      scannerRef.current = html5QrcodeScanner;
    }, 250);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error('Failed to clear scanner', err));
      }
    };
  }, [isOpen, onScanSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal Box */}
      <div className={`relative w-full max-w-md p-6 rounded-[32px] shadow-2xl border ${
        isDarkMode ? 'bg-[#0B1120] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
      } animate-in zoom-in-95 duration-300`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <QrCode className="w-6 h-6 text-[#00D4FF]" /> Chatbot QR Scanner
          </h3>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full hover:bg-slate-500/10 transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold text-center">
            {error}
          </div>
        )}

        {/* Scanner target container */}
        <div className={`rounded-2xl overflow-hidden border-4 ${
          isDarkMode ? 'border-white/5 bg-black/30' : 'border-slate-100 bg-slate-50'
        }`}>
          <div id="chatbot-qr-reader" className="w-full"></div>
        </div>

        <p className={`text-center text-xs font-semibold mt-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Align any platform QR code (Digital ID, Session, or Certificate link) inside the frame to scan and verify.
        </p>
      </div>
    </div>
  );
}
