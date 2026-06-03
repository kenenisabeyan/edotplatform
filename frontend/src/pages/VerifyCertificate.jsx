import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Calendar, BookOpen, Clock, Star, MessageSquare, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import useThemeMode from '../hooks/useThemeMode';

export default function VerifyCertificate() {
  const { hash } = useParams();
  const isDarkMode = useThemeMode();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [sponsorship, setSponsorship] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/users/public/verify-certificate/${hash}`);
        if (data.success && data.certificate) {
          setCertificate(data.certificate);
          setSponsorship(data.sponsorship);
        } else {
          setError('Certificate details not found.');
        }
      } catch (err) {
        console.error('Failed to verify certificate', err);
        setError(err.response?.data?.message || 'Invalid verification link or certificate not found.');
      } finally {
        setLoading(false);
      }
    };

    if (hash) {
      fetchCertificate();
    }
  }, [hash]);

  const triggerChatbot = () => {
    // Dispatch custom event to trigger ChatbotWidget and auto-send verification message
    const event = new CustomEvent('trigger-chatbot', {
      detail: { message: `Please verify certificate ${hash}` }
    });
    window.dispatchEvent(event);
  };

  const pageBg = isDarkMode 
    ? 'linear-gradient(110deg, #020617 0%, #0B1528 50%, #030712 100%)' 
    : 'linear-gradient(110deg, #F8FAFC 0%, #EFF6FF 50%, #F1F5F9 100%)';

  if (loading) {
    return (
      <div 
        style={{ background: pageBg }}
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full animate-spin"></div>
        <p className={`mt-6 text-sm font-bold tracking-wide uppercase ${isDarkMode ? 'text-cyan-400' : 'text-teal-700'}`}>
          Connecting to Registry...
        </p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div 
        style={{ background: pageBg }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-8 rounded-[32px] border text-center shadow-xl backdrop-blur-md ${
            isDarkMode ? 'bg-[#0B1120]/80 border-white/10 text-white' : 'bg-white/80 border-slate-200 text-slate-800'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black mb-3">Verification Warning</h2>
          <p className={`text-sm mb-8 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {error || 'This credential does not match any certificate recorded in our registry.'}
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              to="/" 
              className="px-6 py-3 rounded-full font-black text-sm transition-colors border border-transparent bg-gradient-to-tr from-sky-500 to-cyan-400 text-white hover:shadow-lg"
            >
              Go to Homepage
            </Link>
            <button 
              onClick={triggerChatbot}
              className={`px-6 py-3 rounded-full font-black text-sm transition-colors border ${
                isDarkMode ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              Ask EDOT Assistant
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      style={{ background: pageBg }}
      className="min-h-screen flex items-center justify-center py-16 px-4"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-2xl p-8 md:p-12 rounded-[40px] border shadow-2xl backdrop-blur-md relative overflow-hidden ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#0B1120]/90 to-[#020617]/95 border-white/10 text-white' 
            : 'bg-gradient-to-br from-white/90 to-slate-50/95 border-slate-200 text-slate-800'
        }`}
      >
        {/* Verification banner decor */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500"></div>

        {/* Verification Status Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 shadow-inner border border-emerald-500/20">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <span className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-3">
            VERIFIED CREDENTIAL
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Academic Verification
          </h1>
          <p className={`text-xs mt-2 font-mono break-all max-w-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Registry Hash: {certificate.verificationHash}
          </p>
        </div>

        {/* Certificate Card Content */}
        <div className={`p-6 md:p-8 rounded-3xl border mb-8 ${
          isDarkMode ? 'bg-[#060B13]/60 border-white/5' : 'bg-slate-50/50 border-slate-100'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col - Student Details */}
            <div className="space-y-4">
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Recipient Student
                </span>
                <h3 className="text-xl font-bold mt-1 flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-500" /> {certificate.user?.name}
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {certificate.user?.email}
                </p>
              </div>

              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Issue Date
                </span>
                <p className="text-sm font-semibold mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                  {new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Right Col - Course Details */}
            <div className="space-y-4">
              <div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Course Completed
                </span>
                <h3 className="text-lg font-bold mt-1 flex items-center gap-2 text-indigo-500">
                  <BookOpen className="w-5 h-5" /> {certificate.course?.title}
                </h3>
              </div>

              <div className="flex gap-6">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Level
                  </span>
                  <p className="text-xs font-bold mt-1 text-teal-500">
                    {certificate.course?.level || 'Intermediate'}
                  </p>
                </div>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Duration
                  </span>
                  <p className="text-xs font-bold mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {certificate.course?.duration} hrs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Associated Sponsorship Campaign details (if any) */}
          {sponsorship && (
            <div className={`mt-6 p-5 rounded-2xl border flex items-start gap-4 text-left ${
              isDarkMode 
                ? 'bg-[#0F1D33]/40 border-[#00D4FF]/20 text-white' 
                : 'bg-blue-50/40 border-blue-100 text-slate-800'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-[#00D4FF] flex items-center justify-center shrink-0 border border-[#00D4FF]/20 mt-1">
                <Star className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-cyan-400' : 'text-teal-700'}`}>
                  SPONSORSHIP CAMPAIGN DETAILS
                </span>
                <h4 className="text-sm font-bold mt-1">
                  Funded via the <span className="text-indigo-400 font-extrabold">"{sponsorship.category.replace('_', ' ').toUpperCase()}"</span> Campaign
                </h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  This academic course was fully funded and supported by <strong className="font-extrabold">{sponsorship.sponsorName}</strong>. 
                  EDOT's transparent sponsorship registry links global supporters to talented students to enable verified credentials.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Interaction Panel */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold">Have questions about this course?</h4>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Our AI assistant is ready with curriculum info.
            </p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <button 
              onClick={triggerChatbot}
              className="px-6 py-3 rounded-full font-black text-sm bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" /> Ask EDOT Assistant
            </button>
            <Link 
              to="/" 
              className={`px-5 py-3 rounded-full font-black text-sm border flex items-center gap-1 transition-all ${
                isDarkMode ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
