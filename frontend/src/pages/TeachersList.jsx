import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { Check, X, ShieldAlert, BadgeCheck, Users, Search } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

export default function TeachersList() {
  const isDarkMode = useThemeMode();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending'); // 'pending' or 'approved'

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const { data } = await api.get('/admin/instructors');
      if (data.success) {
        setInstructors(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch instructors', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div></div>;

  const filteredInstructors = instructors.filter(i => i.status === tab || (tab === 'approved' && !i.status));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Instructor Management</h1>
          <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Approve registrations and manage faculty</p>
        </div>
      </div>

      <div className={`flex gap-4 border-b pb-2 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
        <button 
          onClick={() => setTab('pending')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition ${tab === 'pending' ? 'text-[#FFD700] border-b-2 border-[#FFD700]' : 'text-slate-200 hover:text-white'}`}
        >
          Pending Approval ({instructors.filter(i => i.status === 'pending').length})
        </button>
        <button 
          onClick={() => setTab('approved')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition ${tab === 'approved' ? 'text-[#E67E22] border-b-2 border-[#E67E22]' : 'text-slate-200 hover:text-white'}`}
        >
          Approved Instructors ({instructors.filter(i => i.status === 'approved' || !i.status).length})
        </button>
      </div>

      <div className={`rounded-2xl border backdrop-blur-xl shadow-lg overflow-hidden ${isDarkMode ? 'border-white/5 bg-[#1E293B]/5' : 'border-slate-100 bg-slate-50'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-sm font-semibold ${isDarkMode ? 'bg-[#1E293B]/5 text-slate-200' : 'bg-slate-50 text-slate-600'}`}>
                <th className="p-4">Instructor</th>
                <th className="p-4">Email</th>
                <th className="p-4">Assigned Students</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className={`text-sm font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {filteredInstructors.length === 0 ? (
                <tr>
                   <td colSpan="5" className={`p-8 text-center font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No {tab} instructors found.</td>
                </tr>
              ) : filteredInstructors.map(inst => (
                <tr key={inst.id} className={`border-b hover:bg-[#1E293B]/5 transition ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
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
                        <span className="px-3 py-1 bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 font-bold rounded-full text-xs flex items-center gap-1 w-max"><ShieldAlert className="w-3 h-3"/> Pending</span>
                     ) : (
                        <span className="px-3 py-1 bg-[#E67E22]/10 text-[#E67E22] border border-[#E67E22]/20 font-bold rounded-full text-xs flex items-center gap-1 w-max"><BadgeCheck className="w-3 h-3"/> Approved</span>
                     )}
                  </td>
                  <td className="p-4 flex gap-2">
                    {tab === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(inst.id)} className="p-2 bg-[#E67E22]/10 text-[#E67E22] hover:bg-[#E67E22]/20 border border-[#E67E22]/20 rounded-lg transition" title="Approve">
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
