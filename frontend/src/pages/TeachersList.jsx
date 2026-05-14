import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { Check, X, ShieldAlert, BadgeCheck, Users, Search } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

import { useQuery } from '@tanstack/react-query';

export default function TeachersList() {
  const isDarkMode = useThemeMode();
  const [tab, setTab] = useState('pending'); // 'pending' or 'approved'

  const { data: instructors = [], isLoading: loading, refetch: fetchInstructors } = useQuery({
    queryKey: ['adminInstructors'],
    queryFn: async () => {
      const { data } = await api.get('/admin/instructors', { params: { limit: 200 } });
      return data.success ? data.data : [];
    }
  });

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/instructor/${id}/approve`);
      fetchInstructors(); // Refresh UI
    } catch (error) {
      console.error('Failed to approve instructor', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/instructor/${id}/reject`);
      fetchInstructors(); // Refresh UI
    } catch (error) {
      console.error('Failed to reject instructor', error);
    }
  };



  const pendingCount = React.useMemo(() => instructors.filter(i => i.status === 'pending').length, [instructors]);
  const approvedCount = React.useMemo(() => instructors.filter(i => i.status === 'approved' || !i.status).length, [instructors]);

  const filteredInstructors = React.useMemo(() => {
    return instructors.filter(i => i.status === tab || (tab === 'approved' && !i.status));
  }, [instructors, tab]);

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-8 h-8 text-[#00D4FF]" />
            Instructor Management
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Approve registrations and manage faculty across all active courses.</p>
        </div>
      </div>

      <div className={`flex gap-4 border-b pb-2 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
        <button 
          onClick={() => setTab('pending')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition ${tab === 'pending' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-slate-200 hover:text-white'}`}
        >
          Pending Approval ({pendingCount})
        </button>
        <button 
          onClick={() => setTab('approved')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition ${tab === 'approved' ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-slate-200 hover:text-white'}`}
        >
          Approved Instructors ({approvedCount})
        </button>
      </div>

      <div className={`rounded-2xl border backdrop-blur-xl shadow-lg overflow-hidden ${isDarkMode ? 'border-white/5 bg-[#0B1120]/5' : 'border-slate-100 bg-slate-50'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-sm font-semibold ${isDarkMode ? 'bg-[#0B1120]/5 text-slate-200' : 'bg-slate-50 text-slate-600'}`}>
                <th className="p-4">Instructor</th>
                <th className="p-4">Email</th>
                <th className="p-4">Assigned Students</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className={`text-sm font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {loading ? (
                <tr>
                   <td colSpan="5" className="p-12 text-center">
                     <div className="w-8 h-8 border-4 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full animate-spin mx-auto"></div>
                   </td>
                </tr>
              ) : filteredInstructors.length === 0 ? (
                <tr>
                   <td colSpan="5" className={`p-8 text-center font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No {tab} instructors found.</td>
                </tr>
              ) : filteredInstructors.map(inst => (
                <tr key={inst.id} className={`border-b hover:bg-white/5/5 transition ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <td className={`p-4 flex items-center gap-3 font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <UserAvatar user={inst} className="w-10 h-10 text-sm" />
                    {inst.name}
                  </td>
                  <td className={`p-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{inst.email}</td>
                  <td className="p-4">
                     <span className={`flex items-center gap-2 font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}><Users className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} /> {inst.assignedStudents?.length || 0}</span>
                  </td>
                  <td className="p-4">
                     {inst.status === 'pending' ? (
                        <span className="px-3 py-1 bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 font-bold rounded-full text-xs flex items-center gap-1 w-max"><ShieldAlert className="w-3 h-3"/> Pending</span>
                     ) : (
                        <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-bold rounded-full text-xs flex items-center gap-1 w-max"><BadgeCheck className="w-3 h-3"/> Approved</span>
                     )}
                  </td>
                  <td className="p-4 flex gap-2">
                    {tab === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(inst.id)} className="p-2 bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 border border-[#00D4FF]/20 rounded-lg transition" title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleReject(inst.id)} className="p-2 bg-[#E30A17]/10 text-[#E30A17] hover:bg-[#E30A17]/20 border border-[#E30A17]/20 rounded-lg transition" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
