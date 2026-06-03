import React, { useState, useEffect } from 'react';
import { HeartHandshake, Users, GraduationCap, ArrowRight, ShieldCheck, HandCoins, Search, CheckCircle2, Wallet, RefreshCw, Loader2 } from 'lucide-react';
import api from '../utils/api';
import useThemeMode from '../hooks/useThemeMode';
import PremiumModal from '../components/PremiumModal';

export default function SupportDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('just now');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({ studentId: '', amount: 100, isAnonymous: false, termsAccepted: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDarkMode = useThemeMode();

  const fetchDashboardData = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const response = await api.get('/support/dashboard');
      if (response.data.success) {
        setData(response.data.data);
        setLastUpdated('just now');
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError('Error connecting to Server');
      console.error('Support API Error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(() => {
      setLastUpdated('1 min ago');
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSponsorSubmit = async (e) => {
    e.preventDefault();
    if (!sponsorForm.termsAccepted) {
       alert("You must accept the strict privacy and security protocol terms.");
       return;
    }
    
    setIsSubmitting(true);
    try {
       const response = await api.post('/support', sponsorForm);
       if (response.data.success) {
          alert('Secure connection request sent. Awaiting student consent.');
          setShowSponsorModal(false);
          setSponsorForm({ studentId: '', amount: 100, isAnonymous: false, termsAccepted: false });
          fetchDashboardData(true);
       }
    } catch (err) {
       alert(err.response?.data?.message || 'Transaction failed. Ensure Student ID is correct and there are no overlapping active constraints.');
    } finally {
       setIsSubmitting(false);
    }
  };

  const staticStatsConfigs = [
    { label: 'Total Contributions', key: 'totalContributions', icon: Wallet, gradient: 'from-emerald-500/20 to-[#0B1120]', color: 'text-emerald-400', format: (v) => `$${v.toLocaleString()}` },
    { label: 'Active Sponsors', key: 'activeSponsors', icon: HeartHandshake, gradient: 'from-indigo-500/20 to-[#0B1120]', color: 'text-indigo-400', format: (v) => v },
    { label: 'Supported Students', key: 'supportedStudents', icon: GraduationCap, gradient: 'from-cyan-500/20 to-[#0B1120]', color: 'text-cyan-400', format: (v) => v },
    { label: 'Active Support Cycles', key: 'activeCycles', icon: RefreshCw, gradient: 'from-amber-500/20 to-[#0B1120]', color: 'text-amber-400', format: (v) => v },
  ];



  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  const { stats = null, supportedStudents = [], recentImpact = [], currentCycle = null } = data || {};

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-none w-full">
      
      {/* Header Section */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <HeartHandshake className="w-8 h-8 text-[#00D4FF]" />
              Support & Sponsorship
            </h1>
            <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              LIVE
            </span>
          </div>
          <div className={`text-sm mt-2 font-medium flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
            “Supporting continuous learning for every student.”
            <span className={`text-xs ml-3 font-medium tracking-normal flex items-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              • Updated {lastUpdated}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => fetchDashboardData(true)} 
            className={`p-3 rounded-full border transition-all ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-slate-200 hover:text-white hover:bg-white/5' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm'}`}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-[#00D4FF]' : ''}`} />
          </button>
          <button 
             onClick={() => setShowSponsorModal(true)}
             className={`inline-flex items-center gap-2 px-6 py-3 font-black rounded-xl hover:-translate-y-0.5 transition-transform bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
          >
            <HandCoins className="w-4 h-4" />
            Become a Sponsor
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-32 rounded-3xl animate-pulse ${isDarkMode ? 'bg-[#0B1120]/40' : 'bg-slate-200'}`} />
            ))}
          </div>
          <div className={`h-64 rounded-3xl animate-pulse w-full ${isDarkMode ? 'bg-[#0B1120]/40' : 'bg-slate-200'}`} />
          <div className={`h-96 rounded-3xl animate-pulse w-full ${isDarkMode ? 'bg-[#0B1120]/40' : 'bg-slate-200'}`} />
        </div>
      ) : (
        <>
      {/* Metrics Row (SECTION 1 - SUPPORT POOL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {staticStatsConfigs.map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-3xl bg-gradient-to-br flex flex-col items-center text-center gap-3 shadow-xl transition-transform relative overflow-hidden group ${isDarkMode ? `${stat.gradient} border-0 shadow-black/20 hover:-translate-y-1` : 'from-white to-slate-50 border border-slate-200 shadow-slate-200/50 hover:-translate-y-1'}`}>
            {/* Soft decorative blur */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 bg-current ${stat.color} pointer-events-none group-hover:opacity-40 transition-opacity`} />
            
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-slate-500/10 shrink-0 relative z-10`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>

            {/* Content */}
            <div className="flex flex-col items-center relative z-10 w-full">
              <p className={`text-xs font-bold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{stat.label}</p>
              <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats ? stat.format(stats[stat.key]) : '0'}</h3>
            </div>
          </div>
        ))}
      </div>

      {currentCycle && (
      <div className={`rounded-3xl p-8 relative overflow-hidden group mb-8 ${isDarkMode ? 'bg-[#0B1120] border-0 shadow-2xl shadow-indigo-900/10' : 'bg-white border border-slate-200 shadow-xl shadow-slate-200/50'}`}>
        {/* SECTION 3 - SUPPORT CYCLE TRACKING */}
        {/* Soft immersive background flare */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 relative z-10 gap-4">
          <div>
            <h2 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <RefreshCw className="w-6 h-6 text-indigo-400" />
              Active Support Cycle
            </h2>
            <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Tracking the current primary sponsorship journey.</p>
          </div>
          <div>
             <span className="inline-flex px-4 py-2 text-[10px] font-black   bg-emerald-500/10 text-emerald-500 border-0 rounded-xl shadow-md">
                Contribution Status: {currentCycle.funded}% Funded
             </span>
          </div>
        </div>

        <div className={`flex flex-col xl:flex-row gap-8 items-center rounded-2xl p-6 relative z-10 shadow-lg ${isDarkMode ? 'bg-[#0B1120] border-0' : 'bg-slate-50 border border-slate-200'}`}>
          {/* Student Focus */}
          <div className="flex items-center gap-5 min-w-[280px]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 flex items-center justify-center font-black text-2xl text-indigo-500 border-0 shadow-inner">
              {currentCycle.studentName?.charAt(0)}
            </div>
            <div>
              <p className={`text-[10px] font-bold mb-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Currently Supported</p>
              <h4 className={`font-bold text-lg leading-tight mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentCycle.studentName}</h4>
              <p className="text-xs text-indigo-500 font-bold">{currentCycle.courseName}</p>
            </div>
          </div>

          {/* Horizontal Step Timeline */}
          <div className="flex-1 w-full pt-6 pb-2 px-2 sm:px-8">
             <div className="relative flex justify-between items-center w-full">
                {/* Background Track */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full z-0 ${isDarkMode ? 'bg-[#0B1120] border border-white/5' : 'bg-slate-200 border-0'}`}></div>
                {/* Active Progress Track */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-indigo-500 rounded-full z-0 shadow-[0_0_15px_rgba(99,102,241,0.6)] transition-all duration-1000" style={{ width: `${Math.max(10, currentCycle.progress)}%` }}></div>

                {/* Nodes */}
                {[
                  { label: "Funding Started", completed: true, active: false },
                  { label: "Learning in Progress", completed: currentCycle.progress > 0, active: currentCycle.progress > 0 && currentCycle.progress < 75 },
                  { label: "Near Completion", completed: currentCycle.progress >= 75, active: currentCycle.progress >= 75 && currentCycle.progress < 100 },
                  { label: "Completed", completed: currentCycle.progress === 100, active: currentCycle.progress === 100 }
                ].map((step, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${step.completed ? `bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110 ${isDarkMode ? 'border-[#0B1120]' : 'border-slate-50'}` : (isDarkMode ? 'bg-[#0B1120] border-[#0B1120]' : 'bg-slate-200 border-slate-50')}`}>
                      {step.completed && <CheckCircle2 className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />}
                    </div>
                    {/* Node Text */}
                    <div className="absolute top-12 text-center w-24 sm:w-32 -ml-12 sm:-ml-16">
                       <p className={`text-[10px] font-black   transition-colors ${step.active ? 'text-white' : step.completed ? 'text-indigo-400' : 'text-slate-400'}`}>
                         {step.label}
                       </p>
                    </div>
                  </div>
                ))}
             </div>
             {/* Spacer to accommodate absolute positioned labels */}
             <div className="h-10"></div> 
          </div>
        </div>
      </div>
      )}

      {/* Content Tabs */}
      <div className={`rounded-3xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-[#0B1120] border border-white/5' : 'bg-white border border-slate-200'}`}>
        
        {/* Tab Navigation */}
        <div className={`flex items-center gap-8 border-b px-8 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <button 
            onClick={() => setActiveTab('students')}
            className={`py-6 text-sm font-bold transition-colors relative ${activeTab === 'students' ? 'text-indigo-500' : (isDarkMode ? 'text-slate-200 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
          >
            Supported Students
            {activeTab === 'students' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />}
          </button>
          <button 
            onClick={() => setActiveTab('impact')}
            className={`py-6 text-sm font-bold transition-colors relative ${activeTab === 'impact' ? 'text-emerald-500' : (isDarkMode ? 'text-slate-200 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
          >
            Recent Impact Log
            {activeTab === 'impact' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 rounded-t-full shadow-[0_-2px_10px_rgba(52,211,153,0.5)]" />}
          </button>
        </div>

        {/* Tab Content: Supported Students */}
        {activeTab === 'students' && (
          <div className="p-8 space-y-6">
            
            {/* Search/Filter Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className={`w-[18px] h-[18px] absolute left-5 top-1/2 -translate-y-1/2 ml-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                <input 
                  type="text" 
                  placeholder="Search learners securely..."
                  className={`w-full !pl-14 !pr-4 !py-3 border !rounded-full-full focus:outline-none transition-colors ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {supportedStudents.map((student) => (
                <div key={student.id} className={`p-6 rounded-[2rem] hover:-translate-y-2 transition-all group duration-300 flex flex-col h-full ${isDarkMode ? 'bg-[#0B1120] border-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.15)] bg-gradient-to-b from-[#0B1120]/40 to-transparent' : 'bg-white border border-slate-200 shadow-md hover:shadow-xl'}`}>
                  
                  {/* Top Row: Avatar & Metadata */}
                  <div className="flex justify-between items-start mb-6 w-full">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full ${student.avatar} flex items-center justify-center font-black text-lg border-0 shadow-inner`}>
                        {student.name.charAt(0)}
                      </div>
                      
                      {/* Basic Info */}
                      <div>
                        <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{student.name}</h4>
                        <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>{student.course}</p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div>
                      {student.status === 'active' && <span className="px-3 py-1.5 text-[10px] font-black   bg-emerald-500/10 text-emerald-500 border-0 rounded-xl shadow-sm flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active</span>}
                      {student.status === 'at-risk' && <span className="px-3 py-1.5 text-[10px] font-black   bg-[#00D4FF]/10 text-[#00D4FF] border-0 rounded-xl shadow-sm flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse"></span> At Risk</span>}
                      {student.status === 'completed' && <span className="px-3 py-1.5 text-[10px] font-black   bg-cyan-500/10 text-cyan-500 border-0 rounded-xl shadow-sm flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Completed</span>}
                    </div>
                  </div>
                  
                  {/* Bottom Row: Animated Progress */}
                  <div className="mt-auto pt-2">
                    <div className="flex justify-between items-end text-xs font-bold mb-3">
                      <span className={`text-[10px] ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Academic Progress</span>
                      <span className={`${student.progress === 100 ? 'text-cyan-500' : (isDarkMode ? 'text-slate-300' : 'text-slate-600')}`}>{student.progress}%</span>
                    </div>
                    <div className={`h-3 w-full border-0 rounded-full overflow-hidden shadow-inner ${isDarkMode ? 'bg-[#0B1120]' : 'bg-slate-100'}`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-[1500ms] ease-out ${student.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : student.status === 'at-risk' ? 'bg-[#00D4FF] shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`} 
                        style={{ width: `${student.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Impact Log */}
        {activeTab === 'impact' && (
          <div className="p-8">
             <div className="space-y-4">
               {recentImpact.map((log) => (
                 <div key={log.id} className={`flex items-center justify-between p-5 rounded-2xl hover:border-emerald-500/30 transition-colors ${isDarkMode ? 'bg-[#0B1120] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
                   <div className="flex items-center gap-5">
                     <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                       <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                     </div>
                     <div>
                       <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                         <span className="font-bold text-emerald-500">{log.sponsor}</span> supported <span className="font-bold">{log.student}</span>
                       </p>
                       <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>{log.type}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>{log.date}</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* SECTION 4 - EMOTIONAL IMPACT & TRANSPARENCY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Trust & Transparency Banner */}
        <div className={`p-8 rounded-[2rem] border flex gap-6 relative overflow-hidden group ${isDarkMode ? 'bg-gradient-to-r from-emerald-900/30 to-[#0B1120] border-0 shadow-2xl' : 'bg-gradient-to-r from-emerald-50 to-white border-slate-200 shadow-xl'}`}>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
          
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-emerald-500/10 flex items-center justify-center border-0 text-emerald-500 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <h3 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>100% Direct Impact Protocol</h3>
            <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>All students are independently verified. Every sponsorship contribution actively circumvents overhead and is instantly routed to secure educational access, vital learning apparatus, and core instructional resources. No middlemen.</p>
          </div>
        </div>

        {/* The Impact Panel (Secret Weapon 🔥) */}
        <div className={`p-8 rounded-[2rem] border relative overflow-hidden group ${isDarkMode ? 'bg-gradient-to-l from-indigo-900/30 to-[#0B1120] border-0 shadow-2xl' : 'bg-gradient-to-l from-indigo-50 to-white border-slate-200 shadow-xl'}`}>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
          
          <div className="relative z-10">
            <h3 className={`text-xl font-black mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <HeartHandshake className="w-6 h-6 text-indigo-500" /> 
              Real Human Impact
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className={`p-5 border rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-transform ${isDarkMode ? 'bg-[#0B1120] border-0 shadow-lg' : 'bg-white border-slate-200 shadow-md'}`}>
                <Users className="w-6 h-6 text-indigo-500 mb-2 opacity-80" />
                <p className={`text-[10px] font-bold mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Students Supported</p>
                <h4 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats?.supportedStudents || 0}</h4>
              </div>

              <div className={`p-5 border rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-transform ${isDarkMode ? 'bg-[#0B1120] border-0 shadow-lg' : 'bg-white border-slate-200 shadow-md'}`}>
                <GraduationCap className="w-6 h-6 text-cyan-500 mb-2 opacity-80" />
                <p className={`text-[10px] font-bold leading-tight mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Courses Completed</p>
                <h4 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{supportedStudents?.filter(s => s.status === 'completed').length || 0}</h4>
              </div>

              <div className={`p-5 border rounded-2xl flex flex-col items-center text-center hover:-translate-y-1 transition-transform ${isDarkMode ? 'bg-[#0B1120] border-0 shadow-lg' : 'bg-white border-slate-200 shadow-md'}`}>
                <RefreshCw className="w-6 h-6 text-emerald-500 mb-2 opacity-80" />
                <p className={`text-[10px] font-bold leading-tight mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Lives In Progress</p>
                <h4 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats?.activeCycles || 0}</h4>
              </div>
            </div>
          </div>
        </div>

      </div>
      </>
      )}

      {/* Advanced Connection Secure Modal */}
      <PremiumModal isOpen={showSponsorModal} onClose={() => setShowSponsorModal(false)} maxWidth="max-w-lg">
             <div className="p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
              
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className={`text-2xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                       <ShieldCheck className="w-6 h-6 text-indigo-500" />
                       Establish Connection
                    </h3>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Initialize secure proxy sponsorship for a student.</p>
                 </div>
                 <button onClick={() => setShowSponsorModal(false)} className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>✕</button>
              </div>

              <form onSubmit={handleSponsorSubmit} className="space-y-5">
                 <div>
                    <label className={`block text-xs font-black mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Student System ID</label>
                    <input 
                       required 
                       type="text" 
                       value={sponsorForm.studentId}
                       onChange={e => setSponsorForm({...sponsorForm, studentId: e.target.value})}
                       className={`w-full border !px-5 !py-3 !rounded-full focus:outline-none focus:border-[#00D4FF]/50 transition-all ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                       placeholder="Enter the UUID of the student..."
                    />
                 </div>
                 
                 <div>
                    <label className={`block text-xs font-black mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Sponsorship Amount ($/Cycle)</label>
                    <input 
                       required 
                       type="number" 
                       min="1"
                       value={sponsorForm.amount}
                       onChange={e => setSponsorForm({...sponsorForm, amount: e.target.value})}
                       className={`w-full border !px-5 !py-3 !rounded-full focus:outline-none focus:border-[#00D4FF]/50 transition-all ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'}`}
                    />
                 </div>
                 
                 <div className={`border rounded-xl p-4 space-y-3 ${isDarkMode ? 'border-white/5 bg-[#0B1120]' : 'border-slate-200 bg-slate-50'}`}>
                    <label className="flex items-start gap-3 cursor-pointer group">
                       <input 
                          type="checkbox" 
                          checked={sponsorForm.isAnonymous}
                          onChange={e => setSponsorForm({...sponsorForm, isAnonymous: e.target.checked})}
                          className={`mt-1 w-4 h-4 rounded text-indigo-500 focus:ring-0 focus:ring-offset-0 ${isDarkMode ? 'border-white/20 bg-[#0B1120]' : 'border-slate-300 bg-white'}`}
                       />
                       <div>
                          <span className={`block text-sm font-bold transition-colors ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>Ghost Protocol (Anonymous)</span>
                          <span className={`block text-[11px] mt-0.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Sponsor identity will be completely masked from the student. The secure communication channel will anonymize your real metadata.</span>
                       </div>
                    </label>
                 </div>

                 <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                       <input 
                          required
                          type="checkbox" 
                          checked={sponsorForm.termsAccepted}
                          onChange={e => setSponsorForm({...sponsorForm, termsAccepted: e.target.checked})}
                          className={`mt-1 w-4 h-4 rounded border-indigo-500/50 text-indigo-500 focus:ring-0 focus:ring-offset-0 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}
                       />
                       <div>
                          <span className="block text-sm font-bold text-indigo-500 group-hover:text-indigo-400 transition-colors">Legal & Privacy Acknowledgment</span>
                          <span className="block text-[11px] text-indigo-500 mt-0.5 leading-relaxed">I consent to creating a restricted, monitored communication channel. Direct out-of-band communication attempts will result in immediate protocol termination.</span>
                       </div>
                    </label>
                 </div>

                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-full-full font-black text-sm flex justify-center items-center gap-2 ${isSubmitting ? 'bg-indigo-600/50 /50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.02]'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                 >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Initialize Secure Link</>}
                 </button>
              </form>
             </div>
      </PremiumModal>

    </div>
  );
}
