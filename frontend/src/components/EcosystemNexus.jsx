import React, { useState, useEffect } from 'react';
import { Network, ShieldCheck, User, Users, GraduationCap, Building2, Lock, ArrowRight, HeartHandshake, Fingerprint, Check } from 'lucide-react';
import api from '../utils/api';
import useThemeMode from '../hooks/useThemeMode';

export default function EcosystemNexus() {
  const isDarkMode = useThemeMode();
  const [connections, setConnections] = useState({
    parents: [],
    sponsors: [],
    instructors: [],
    admin: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from a specialized /ecosystem route
    // For now, we simulate the secure fetch to demonstrate the architecture
    const fetchEcosystem = async () => {
      try {
        // Simulating the secure data aggregation
        setTimeout(() => {
          setConnections({
            parents: [{ id: 'p1', name: 'Verified Guardian', status: 'active', encryptionKey: 'E2E-A1B2' }],
            sponsors: [{ id: 's1', name: 'Anonymous Sponsor (Ghost Protocol)', status: 'pending_consent', encryptionKey: 'E2E-X9Y8' }],
            instructors: [{ id: 'i1', name: 'Prof. Sarah Jenkins', role: 'Lead Instructor', status: 'active' }],
            admin: { id: 'a1', name: 'System Core Security', status: 'active' }
          });
          setLoading(false);
        }, 1200);
      } catch (err) {
        console.error('Failed to load ecosystem securely:', err);
        setLoading(false);
      }
    };
    fetchEcosystem();
  }, []);

  const handleAuthorize = (type, id) => {
    alert(`Secure handshake initiated for ${type} connection.`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className={`w-12 h-12 border-4 border-t-[#F97316] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
        <p className={`text-sm font-black tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ESTABLISHING SECURE NEXUS...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className={`text-2xl md:text-3xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Network className="w-8 h-8 text-[#00D4FF]" />
            Secure Educational Ecosystem
          </h2>
          <p className={`mt-2 font-medium max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Your learning journey is supported by a mathematically secure network of instructors, guardians, sponsors, and administrators. You control the access keys.
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-black tracking-widest uppercase">E2E Secured Nexus</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Decorative background link line */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#F97316]/20 to-transparent -z-10"></div>
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-1 bg-gradient-to-b from-transparent via-[#00D4FF]/20 to-transparent -z-10"></div>

        {/* Instructors Node */}
        <div className={`p-6 rounded-[2rem] border shadow-lg relative overflow-hidden group ${isDarkMode ? 'bg-[#0B1120] border-white/5 hover:border-[#00D4FF]/30' : 'bg-white border-slate-200 hover:border-[#00D4FF]/30'}`}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#00D4FF]/20 transition-all duration-700" />
          <div className="flex items-center justify-between mb-6 relative z-10">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] flex items-center justify-center border border-[#00D4FF]/20">
                 <GraduationCap className="w-6 h-6" />
               </div>
               <div>
                 <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Academic Node</h3>
                 <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Instructors & Mentors</p>
               </div>
             </div>
             <span className="text-xs font-black text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-1 rounded-full">ACTIVE</span>
          </div>
          <div className="space-y-4 relative z-10">
            {connections.instructors.map((inst, i) => (
              <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <User className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  <div>
                    <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{inst.name}</p>
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{inst.role}</p>
                  </div>
                </div>
                <button className={`p-2 rounded-lg hover:bg-[#00D4FF]/10 hover:text-[#00D4FF] transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Parent / Guardian Node */}
        <div className={`p-6 rounded-[2rem] border shadow-lg relative overflow-hidden group ${isDarkMode ? 'bg-[#0B1120] border-white/5 hover:border-[#F97316]/30' : 'bg-white border-slate-200 hover:border-[#F97316]/30'}`}>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#F97316]/20 transition-all duration-700" />
          <div className="flex items-center justify-between mb-6 relative z-10">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center border border-[#F97316]/20">
                 <Users className="w-6 h-6" />
               </div>
               <div>
                 <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Guardian Node</h3>
                 <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Parents & Overseers</p>
               </div>
             </div>
             <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">SECURED</span>
          </div>
          <div className="space-y-4 relative z-10">
            {connections.parents.map((parent, i) => (
              <div key={i} className={`p-4 rounded-xl border flex flex-col gap-3 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{parent.name}</p>
                  </div>
                  <Lock className={`w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <div className={`text-[10px] font-mono flex items-center gap-2 p-2 rounded bg-black/20 text-emerald-400`}>
                  <Fingerprint className="w-3 h-3" /> Key: {parent.encryptionKey}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsor / Financial Node */}
        <div className={`p-6 rounded-[2rem] border shadow-lg relative overflow-hidden group ${isDarkMode ? 'bg-[#0B1120] border-white/5 hover:border-emerald-500/30' : 'bg-white border-slate-200 hover:border-emerald-500/30'}`}>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
          <div className="flex items-center justify-between mb-6 relative z-10">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                 <HeartHandshake className="w-6 h-6" />
               </div>
               <div>
                 <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Sponsorship Node</h3>
                 <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Financial Backers</p>
               </div>
             </div>
             <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">PENDING ACTION</span>
          </div>
          <div className="space-y-4 relative z-10">
            {connections.sponsors.map((sponsor, i) => (
              <div key={i} className={`p-4 rounded-xl border flex flex-col gap-3 ${isDarkMode ? 'bg-white/5 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <User className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-amber-600'}`} />
                    <div>
                      <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sponsor.name}</p>
                      <p className={`text-[10px] mt-0.5 font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Awaiting Your Consent</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => handleAuthorize('sponsorship', sponsor.id)} className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors">
                    Authorize E2E
                  </button>
                  <button className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${isDarkMode ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin / System Node */}
        <div className={`p-6 rounded-[2rem] border shadow-lg relative overflow-hidden group ${isDarkMode ? 'bg-[#0B1120] border-white/5 hover:border-purple-500/30' : 'bg-white border-slate-200 hover:border-purple-500/30'}`}>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700" />
          <div className="flex items-center justify-between mb-6 relative z-10">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                 <Building2 className="w-6 h-6" />
               </div>
               <div>
                 <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>System Core</h3>
                 <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Admin Oversight</p>
               </div>
             </div>
             <span className="text-xs font-black text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full">ENCRYPTED</span>
          </div>
          <div className="space-y-4 relative z-10">
             <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
               <div className="flex items-center gap-3">
                 <ShieldCheck className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                 <div>
                   <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Protocol & Compliance</p>
                   <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Data integrity verified</p>
                 </div>
               </div>
               <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                  <Check className="w-4 h-4" />
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
