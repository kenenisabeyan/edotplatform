import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, Bell, LogOut, Settings, User, 
  Home, RefreshCw, Heart, Wallet, Users, 
  Activity, ShieldCheck, GraduationCap, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeMode from '../hooks/useThemeMode';
import PremiumModal from '../components/PremiumModal';

export default function SponsorDashboard() {
  const isDarkMode = useThemeMode();
  const queryClient = useQueryClient();
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('Supported Students');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [sponsorAmount, setSponsorAmount] = useState('50');

  const { data, isLoading } = useQuery({
    queryKey: ['sponsor', 'dashboard'],
    queryFn: async () => {
      const res = await axios.get('/api/sponsor/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  // Derived data
  const sponsor = data?.sponsor || { name: 'beyan abesha', role: 'sponsor', avatar: null };
  const stats = data?.stats || {
    totalContributions: 0,
    activeSponsors: 0,
    supportedStudents: 0,
    activeSupportCycles: 0,
  };
  const humanImpact = data?.humanImpact || {
    studentsSupported: 0,
    coursesCompleted: 0,
    livesInProgress: 0
  };
  const supportedStudents = data?.supportedStudents || [];
  const recentImpact = data?.recentImpact || [];

  const sponsorMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post('/api/sponsor/support-student', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Successfully initiated sponsorship!');
      queryClient.invalidateQueries(['sponsor', 'dashboard']);
      setIsModalOpen(false);
      setSelectedStudent('');
      setSponsorAmount('50');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to initiate sponsorship');
    }
  });

  const handleSponsorSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent || !sponsorAmount) {
      toast.error('Please select a student and amount');
      return;
    }
    sponsorMutation.mutate({
      studentId: selectedStudent,
      amount: sponsorAmount,
      type: 'General Support'
    });
  };

  const sidebarSections = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', icon: Home }
      ]
    }
  ];

  const navClass = (active) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors text-left w-full ${
      active ? 'bg-green-100/50 text-green-900 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    } ${isDarkMode ? 'dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white' : ''}`;

  return (
    <div className="max-w-none w-full space-y-6 animate-in fade-in zoom-in duration-500 p-6">
      
      {/* Top Bar: Title & Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Heart className="w-6 h-6 text-sky-500" />
                    <h1 className="text-2xl font-bold">Support & Sponsorship</h1>
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      LIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 ml-9">
                    <p>"Supporting continuous learning for every student."</p>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <p>Updated just now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => queryClient.invalidateQueries(['sponsor', 'dashboard'])}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 text-sm font-bold text-white hover:bg-cyan-500 transition shadow-sm"
                  >
                    <Heart className="w-4 h-4" />
                    Become a Sponsor
                  </button>
                </div>
              </div>

              {/* Analytics Row */}
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Contributions</p>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800">${stats.totalContributions}</h2>
                </div>
                
                <div className="rounded-[20px] border border-slate-100 bg-gradient-to-br from-white to-indigo-50/30 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-4 h-4 text-indigo-400" />
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Active Sponsors</p>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800">{stats.activeSponsors}</h2>
                </div>

                <div className="rounded-[20px] border border-slate-100 bg-gradient-to-br from-white to-sky-50/30 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-4 h-4 text-sky-400" />
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Supported Students</p>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800">{stats.supportedStudents}</h2>
                </div>

                <div className="rounded-[20px] border border-slate-100 bg-gradient-to-br from-white to-amber-50/30 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Active Support Cycles</p>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800">{stats.activeSupportCycles}</h2>
                </div>
              </div>

              {/* Tabs & Search Area */}
              <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-6 border-b border-slate-100 mb-6">
                  <button 
                    onClick={() => setActiveTab('Supported Students')}
                    className={`pb-3 text-xs font-bold transition-colors relative ${activeTab === 'Supported Students' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Supported Students
                    {activeTab === 'Supported Students' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveTab('Recent Impact Log')}
                    className={`pb-3 text-xs font-bold transition-colors relative ${activeTab === 'Recent Impact Log' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Recent Impact Log
                    {activeTab === 'Recent Impact Log' && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
                    )}
                  </button>
                </div>
                
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search learners securely..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {activeTab === 'Supported Students' && (
                <div className="mt-6 flex flex-col gap-4">
                  {supportedStudents.length > 0 ? (
                    supportedStudents.map(student => (
                      <div key={student.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600 font-bold">
                              {student.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-slate-800">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.courseTitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">{student.progress}%</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">{student.supportStatus}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <p className="text-sm font-semibold text-slate-600">No supported students yet</p>
                      <p className="text-xs text-slate-500">When you sponsor a student, they will appear here.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Recent Impact Log' && (
                <div className="mt-6 flex flex-col gap-4">
                  {recentImpact.length > 0 ? (
                    recentImpact.map(impact => (
                      <div key={impact.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{impact.type}</p>
                          <p className="text-xs text-slate-500">{impact.studentName} - {new Date(impact.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <p className="text-sm font-semibold text-slate-600">No recent impact</p>
                      <p className="text-xs text-slate-500">Your recent support activities will appear here.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Info Cards */}
              <div className="grid grid-cols-[1fr_1fr] gap-6">
                {/* Protocol Card */}
                <div className="rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">100% Direct Impact Protocol</h3>
                      <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                        All students are independently verified. Every sponsorship contribution actively circumvents overhead and is instantly routed to secure educational access, vital learning apparatus, and core instructional resources. No middlemen.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Human Impact Card */}
                <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <Heart className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-800">Real Human Impact</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                      <Users className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                      <h4 className="text-2xl font-black text-slate-800">{humanImpact.studentsSupported}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Students Supported</p>
                    </div>
                    
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                      <GraduationCap className="w-5 h-5 text-sky-400 mx-auto mb-2" />
                      <h4 className="text-2xl font-black text-slate-800">{humanImpact.coursesCompleted}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Courses Completed</p>
                    </div>
                    
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                      <RefreshCw className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                      <h4 className="text-2xl font-black text-slate-800">{humanImpact.livesInProgress}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Lives In Progress</p>
                    </div>
                  </div>
                </div>
              </div>

        {/* Become a Sponsor Modal */}
        <PremiumModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="max-w-md">
            <div className="p-8">
              <h2 className="mb-2 text-2xl font-bold">Become a Sponsor</h2>
              <p className={`mb-6 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Select a student to support and choose your contribution amount.
              </p>
              <form onSubmit={handleSponsorSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold">Learner ID</label>
                  <input
                    type="text"
                    required
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    placeholder="Enter student UUID"
                    className={`w-full rounded-xl border p-3 outline-none transition focus:border-cyan-400 ${isDarkMode ? 'border-slate-700 bg-[#0B1120]' : 'border-slate-200 bg-slate-50'}`}
                  />
                  <p className="mt-1 text-[10px] text-slate-500">In a production environment, this would be a searchable dropdown.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">Contribution Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={sponsorAmount}
                    onChange={(e) => setSponsorAmount(e.target.value)}
                    className={`w-full rounded-xl border p-3 outline-none transition focus:border-cyan-400 ${isDarkMode ? 'border-slate-700 bg-[#0B1120]' : 'border-slate-200 bg-slate-50'}`}
                  />
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sponsorMutation.isPending}
                    className="flex-1 rounded-full bg-cyan-400 py-3 font-bold text-white transition hover:bg-cyan-500 disabled:opacity-50"
                  >
                    {sponsorMutation.isPending ? 'Processing...' : 'Confirm Support'}
                  </button>
                </div>
              </form>
            </div>
        </PremiumModal>

    </div>
  );
}
